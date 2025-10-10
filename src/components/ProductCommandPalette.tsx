"use client"

import React, { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command';
import { FiPackage, FiPlus, FiSearch, FiEye, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'sonner';

interface Product {
  id: string;
  brand: string;
  model: string;
  researchData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect: (productId: string) => void;
  onAddProduct: () => void;
  userRole?: string;
}

export function ProductCommandPalette({
  isOpen,
  onClose,
  onProductSelect,
  onAddProduct,
  userRole
}: ProductCommandPaletteProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [researchingId, setResearchingId] = useState<string | null>(null);

  const isAdmin = userRole === 'ADMIN';

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoading(true);
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

  const handleResearch = async (productId: string) => {
    setResearchingId(productId);
    try {
      const response = await fetch(`/api/products/${productId}/research`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Error al generar investigación');

      toast.success('Investigación generada exitosamente');
      fetchProducts();
      onClose();
    } catch (error) {
      console.error('Error generating research:', error);
      toast.error('Error al generar investigación');
    } finally {
      setResearchingId(null);
    }
  };

  const handleProductClick = (product: Product) => {
    onProductSelect(product.id);
    onClose();
  };

  const handleAddProduct = () => {
    onAddProduct();
    onClose();
  };

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Buscar Productos"
      description="Busca productos existentes o crea uno nuevo"
    >
      <CommandInput placeholder="Buscar productos por marca o modelo..." />
      <CommandList>
        <CommandEmpty>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-sidebar-accent border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-muted-foreground">Cargando productos...</span>
            </div>
          ) : (
            <div className="py-6 text-center">
              <FiPackage className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No se encontraron productos</p>
            </div>
          )}
        </CommandEmpty>

        {/* Acción: Crear nuevo producto */}
        {isAdmin && (
          <CommandGroup heading="Acciones">
            <CommandItem onSelect={handleAddProduct}>
              <FiPlus className="h-4 w-4" />
              <span>Crear nuevo producto</span>
              <CommandShortcut>Ctrl+N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Productos existentes */}
        {products.length > 0 && (
          <CommandGroup heading="Productos">
            {products.map((product) => (
              <CommandItem
                key={product.id}
                onSelect={() => handleProductClick(product)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FiPackage className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{product.brand} {product.model}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.researchData ? 'Investigado' : 'Pendiente'} • 
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CommandShortcut>Enter</CommandShortcut>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Acciones rápidas para productos */}
        {isAdmin && products.length > 0 && (
          <CommandGroup heading="Acciones Rápidas">
            {products
              .filter(product => !product.researchData)
              .slice(0, 5) // Mostrar solo los primeros 5 productos sin investigación
              .map((product) => (
                <CommandItem
                  key={`research-${product.id}`}
                  onSelect={() => handleResearch(product.id)}
                  disabled={researchingId === product.id}
                >
                  <FiRefreshCw className={`h-4 w-4 ${researchingId === product.id ? 'animate-spin' : ''}`} />
                  <span>Generar investigación para {product.brand} {product.model}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
