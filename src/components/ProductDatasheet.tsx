"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { FiPlus, FiFileText, FiEdit, FiEye } from 'react-icons/fi';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TiptapEditor from './TiptapEditor';
import { useProduct } from '@/contexts/product-context';
import { Product } from '@prisma/client';

interface ProductDatasheetProps {
  userRole?: string;
  selectedProductId?: string | null;
  onProductSelect?: (productId: string | null) => void;
}

export function ProductDatasheet({ userRole, selectedProductId, onProductSelect }: ProductDatasheetProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const { setRefreshProducts, refreshAllProducts } = useProduct();

  useEffect(() => {
    fetchProductsWithResearch();
  }, []);

  // Registrar la función de refresh en el contexto
  useEffect(() => {
    setRefreshProducts(fetchProductsWithResearch);
  }, [setRefreshProducts]);

  // Actualizar producto seleccionado cuando cambia selectedProductId
  useEffect(() => {
    if (selectedProductId && products.length > 0) {
      const product = products.find(p => p.id === selectedProductId);
      setSelectedProduct(product || null);
      if (product && product.datasheetContent) {
        setViewingProduct(product);
        setEditedContent(product.datasheetContent);
      }
    } else {
      setSelectedProduct(null);
      setViewingProduct(null);
    }
  }, [selectedProductId, products]);

  const fetchProductsWithResearch = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      // Filtrar solo productos con investigación
      const productsWithResearch = data.filter((product: Product) => product.researchData !== null);
      setProducts(productsWithResearch);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDatasheet = async (productId: string) => {
    setGeneratingId(productId);
    try {
      const response = await fetch(`/api/products/${productId}/datasheet`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al generar la ficha técnica');
      }

      const data = await response.json();
      toast.success('Ficha técnica generada exitosamente');
      
      // Actualizar la lista de productos
      refreshAllProducts();
      
      // Si es el producto seleccionado, actualizarlo
      if (selectedProductId === productId) {
        const updatedProduct = { ...selectedProduct!, datasheetContent: data.content };
        setSelectedProduct(updatedProduct);
        setViewingProduct(updatedProduct);
        setEditedContent(data.content);
      }
    } catch (error) {
      console.error('Error generating datasheet:', error);
      toast.error('Error al generar la ficha técnica');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleViewDatasheet = (product: Product) => {
    setViewingProduct(product);
    setIsEditing(false);
    setEditedContent(product.datasheetContent || '');
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(viewingProduct?.datasheetContent || '');
  };

  const handleSaveDatasheet = async () => {
    if (!viewingProduct) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/products/${viewingProduct.id}/datasheet`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editedContent }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la ficha técnica');
      }

      toast.success('Ficha técnica guardada exitosamente');
      setIsEditing(false);
      
      // Actualizar la lista de productos
      refreshAllProducts();
      
      // Actualizar el producto que se está viendo
      const updatedProduct = { ...viewingProduct, datasheetContent: editedContent };
      setViewingProduct(updatedProduct);
      
      // Si es el producto seleccionado, actualizarlo también
      if (selectedProductId === viewingProduct.id) {
        setSelectedProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Error saving datasheet:', error);
      toast.error('Error al guardar la ficha técnica');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-border">
            <CardContent className="pt-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Si hay un producto seleccionado, mostrar su vista
  if (selectedProduct) {
    const hasDatasheet = !!selectedProduct.datasheetContent;
    const isGenerating = generatingId === selectedProduct.id;

    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {selectedProduct.brand} {selectedProduct.model}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ficha Técnica
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => onProductSelect?.(null)}
          >
            Volver a la lista
          </Button>
        </div>

        {hasDatasheet ? (
          <div className="flex-1 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Ficha disponible
                </Badge>
                {userRole === 'ADMIN' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                  >
                    <FiEdit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <TiptapEditor
                content={editedContent}
                onUpdate={setEditedContent}
                editable={isEditing}
              />
            </div>

            {isEditing && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveDatasheet}
                  disabled={saving}
                  className="bg-black hover:bg-black/90 text-white"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FiFileText className="h-16 w-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-medium mb-4">No hay ficha técnica generada</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Este producto tiene investigación completada pero no se ha generado su ficha técnica aún.
              </p>
              {userRole === 'ADMIN' && (
                <Button 
                  size="lg"
                  onClick={() => handleGenerateDatasheet(selectedProduct.id)}
                  disabled={isGenerating}
                  className="bg-black hover:bg-black/90 text-white px-8 py-3 text-lg"
                >
                  {isGenerating ? (
                    <>Generando ficha...</>
                  ) : (
                    <>
                      <FiPlus className="h-5 w-5 mr-2" />
                      Generar Ficha
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Fichas Técnicas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Genera y gestiona fichas técnicas de productos
          </p>
        </div>
        {userRole === 'ADMIN' && products.length > 0 && (
          <Button className="bg-black hover:bg-black/90 text-white">
            <FiPlus className="mr-2 h-4 w-4" />
            Nueva Ficha
          </Button>
        )}
      </div>

      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FiFileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay productos con investigación</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Primero necesitas completar la investigación de al menos un producto para poder generar fichas técnicas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => {
            const hasDatasheet = !!product.datasheetContent;
            const isGenerating = generatingId === product.id;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="border border-border hover:border-border/60 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">
                          {product.brand} {product.model}
                        </h3>
                        {hasDatasheet ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">
                            Ficha generada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
                            Sin ficha técnica
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {hasDatasheet ? (
                      <>
                        <p className="text-xs text-muted-foreground mb-4">
                          Ficha técnica disponible. Haz clic para ver el contenido completo.
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-8"
                            onClick={() => onProductSelect?.(product.id)}
                          >
                            <FiEye className="h-3 w-3 mr-1" />
                            Ver Ficha
                          </Button>
                          {userRole === 'ADMIN' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleGenerateDatasheet(product.id)}
                              disabled={isGenerating}
                            >
                              <FiEdit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground mb-4">
                          No se ha generado una ficha técnica para este producto.
                        </p>
                        
                        {userRole === 'ADMIN' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full h-8"
                            onClick={() => onProductSelect?.(product.id)}
                          >
                            <FiPlus className="h-3 w-3 mr-1" />
                            Generar Ficha
                          </Button>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Dialog para ver/editar ficha técnica */}
      <Dialog open={!!viewingProduct} onOpenChange={(open) => {
        if (!open) {
          setViewingProduct(null);
          setIsEditing(false);
        }
      }}>
        <DialogContent className="!max-w-[1200px] !h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Ficha Técnica: {viewingProduct?.brand} {viewingProduct?.model}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    {userRole === 'ADMIN' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartEdit}
                      >
                        <FiEdit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveDatasheet}
                      disabled={saving}
                      className="bg-black hover:bg-black/90 text-white"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {viewingProduct && (
              <TiptapEditor
                content={editedContent}
                onUpdate={setEditedContent}
                editable={isEditing}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

