"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FiPackage, FiZap } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import { ProductDetailView } from './ProductDetailView';
import { motion } from 'framer-motion';
import { useProduct } from '@/contexts/product-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Product } from '@prisma/client';

interface ProductsListProps {
  userRole?: string;
  selectedProductId?: string | null;
  onProductSelect?: (productId: string | null) => void;
  isAddingProduct?: boolean;
  onAddingProductChange?: (isAdding: boolean) => void;
}

function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-6 w-24" />
      </motion.div>

      {/* Tabs Skeleton */}
      <div className="w-full">
        <div className="inline-block bg-gray-100 rounded-lg p-1 w-full">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6 mt-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ProductsList({ 
  userRole, 
  selectedProductId, 
  onProductSelect,
  isAddingProduct = false,
  onAddingProductChange
}: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchingId, setResearchingId] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const { setRefreshProducts, setEditingProduct, setIsFormOpen, refreshAllProducts } = useProduct();
  const isAdmin = userRole === 'ADMIN';
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Registrar la función de refresh en el contexto (solo una vez)
  React.useEffect(() => {
    setRefreshProducts(fetchProducts);
  }, []); // Dependencia vacía para evitar re-renders infinitos

  // Sincronizar isAddingProduct con isFormOpen
  React.useEffect(() => {
    if (isAddingProduct) {
      setEditingProduct(null);
      setIsFormOpen(true);
    }
  }, [isAddingProduct, setEditingProduct, setIsFormOpen, setRefreshProducts]);

  // Abrir producto seleccionado desde el sidebar
  React.useEffect(() => {
    if (selectedProductId && selectedProductId !== selectedProductForDetail?.id) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        handleProductClick(product);
      }
    }
    
    // Cleanup: cancelar peticiones pendientes al cambiar de producto
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar producto');

      toast.success('Producto eliminado');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const handleResearch = async (id: string) => {
    setResearchingId(id);

    try {
      const response = await fetch(`/api/products/${id}/research`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Error al generar investigación');

      toast.success('Investigación generada exitosamente');
      refreshAllProducts();
    } catch (error) {
      console.error('Error generating research:', error);
      toast.error('Error al generar investigación');
    } finally {
      setResearchingId(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleViewResearch = (product: Product) => {
    setViewingProduct(product);
    onProductSelect?.(product.id);
  };

  const handleCloseViewResearch = () => {
    setViewingProduct(null);
    onProductSelect?.(null);
  };

  const handleProductClick = async (product: Product) => {
    // Evitar múltiples cargas del mismo producto
    if (selectedProductForDetail?.id === product.id) {
      return;
    }

    // Cancelar cualquier petición pendiente anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController para esta petición
    abortControllerRef.current = new AbortController();

    // Activar estado de carga
    setIsLoadingProduct(true);

    // Cargar los datos actualizados del producto
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        signal: abortControllerRef.current.signal
      });
      if (!response.ok) throw new Error('Error al cargar producto');
      const updatedProduct = await response.json();
      setSelectedProductForDetail(updatedProduct);
    } catch (error: unknown) {
      // Ignorar errores de cancelación
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Error loading product:', error);
      toast.error('Error al cargar producto');
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleBackFromDetail = () => {
    // Cancelar cualquier petición pendiente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setSelectedProductForDetail(null);
    setIsLoadingProduct(false);
    onProductSelect?.(null);
    // Refrescar la lista de productos para tener datos actualizados
    fetchProducts();
  };

  const renderResearchData = (data: unknown) => {
    if (!data) return <p className="text-muted-foreground">No hay datos disponibles</p>;

    // Si tiene el campo "raw", mostrar como texto
    if (typeof data === 'object' && data !== null && 'raw' in data) {
      const dataObj = data as Record<string, unknown>;
      if (typeof dataObj.raw === 'string') {
        return (
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
              {dataObj.raw}
            </pre>
          </div>
        );
      }
    }

    // Si es un JSON estructurado, mostrarlo de manera organizada
    return (
      <div className="space-y-4">
        {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <h4 className="font-semibold text-sm capitalize border-b pb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            {Array.isArray(value) ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {value.map((item, idx) => (
                  <li key={idx} className="text-muted-foreground">{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                ))}
              </ul>
            ) : typeof value === 'object' && value !== null ? (
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">{String(value)}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sidebar-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // Mostrar skeleton mientras se carga el producto
  if (isLoadingProduct) {
    return <ProductDetailSkeleton />;
  }

  // Si hay un producto seleccionado para ver detalle, mostrar la vista de detalle
  if (selectedProductForDetail) {
    return (
      <ProductDetailView
        product={selectedProductForDetail}
        userRole={userRole}
        onBack={handleBackFromDetail}
        onUpdate={refreshAllProducts}
      />
    );
  }

  // Pantalla de estado vacío cuando no hay producto seleccionado
  return (
    <>
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 max-w-md"
        >
          {/* Icono principal */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center">
              <FiPackage className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>

          {/* Título principal */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Selecciona un producto</h2>
            <p className="text-muted-foreground">
              Haz clic en un producto del sidebar para comenzar a editarlo
            </p>
          </div>

          {/* Consejo */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <FiZap className="h-3 w-3 text-white" />
              </div>
              <span>
                Consejo: Usa Ctrl+Space para buscar productos rápidamente
              </span>
            </div>
          </div>

          {/* Botón de acción */}
          {isAdmin && (
            <Button onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }} className="mt-4">
              <FiPackage className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          )}
        </motion.div>
      </div>

      {/* Research View Dialog */}
      <Dialog open={!!viewingProduct} onOpenChange={handleCloseViewResearch}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiPackage className="h-5 w-5 text-orange-500" />
              Investigación: {viewingProduct?.brand} {viewingProduct?.model}
            </DialogTitle>
            <DialogDescription>
              Información generada automáticamente con IA
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {viewingProduct && renderResearchData(viewingProduct.researchData)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
