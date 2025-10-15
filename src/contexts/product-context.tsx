"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Product } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { PERMISSIONS } from '@/lib/permissions';

type ProductMode = 'research' | 'datasheet';

interface ProductContextType {
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  isAddingProduct: boolean;
  setIsAddingProduct: (value: boolean) => void;
  isFormOpen: boolean;
  setIsFormOpen: (value: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  refreshProducts: () => void;
  setRefreshProducts: (callback: () => void) => void;
  refreshAllProducts: () => void;
  productMode: ProductMode | null;
  setProductMode: (mode: ProductMode | null) => void;
  // Nueva función para actualizar un producto específico en todos los componentes
  updateProductInAllComponents: (productId: string, updates: Partial<Product>) => void;
  // Estado de generación de ficha técnica
  generatingDatasheetId: string | null;
  setGeneratingDatasheetId: (id: string | null) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productMode, setProductMode] = useState<ProductMode | null>(null);
  const [generatingDatasheetId, setGeneratingDatasheetId] = useState<string | null>(null);
  
  // Inicializar el modo de producto basado en los permisos del usuario
  useEffect(() => {
    if (session?.user?.permissions) {
      const userPermissions = session.user.permissions;
      
      if (userPermissions.includes(PERMISSIONS.PRODUCTS.RESEARCH)) {
        setProductMode('research');
      } else if (userPermissions.includes(PERMISSIONS.PRODUCTS.DATASHEET)) {
        setProductMode('datasheet');
      } else {
        setProductMode(null);
      }
    }
  }, [session?.user?.permissions]);
  
  // Usar ref para almacenar las funciones de refresh sin causar re-renders
  const refreshCallbacks = useRef<(() => void)[]>([]);

  const refreshProducts = useCallback(() => {
    refreshCallbacks.current.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error refreshing products:', error);
      }
    });
  }, []);

  const setRefreshProducts = useCallback((callback: () => void) => {
    // Solo agregar si no existe ya
    if (!refreshCallbacks.current.includes(callback)) {
      refreshCallbacks.current.push(callback);
    }
  }, []);

  const refreshAllProducts = useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Nueva función para actualizar un producto específico en todos los componentes
  const updateProductInAllComponents = useCallback(async (productId: string, updates: Partial<Product>) => {
    try {
      // Primero actualizar el producto en el servidor
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar producto');
      }

      // Luego refrescar todos los componentes
      refreshProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error; // Re-lanzar el error para que el componente que llama pueda manejarlo
    }
  }, [refreshProducts]);

  return (
    <ProductContext.Provider
      value={{
        selectedProductId,
        setSelectedProductId,
        isAddingProduct,
        setIsAddingProduct,
        isFormOpen,
        setIsFormOpen,
        editingProduct,
        setEditingProduct,
        refreshProducts,
        setRefreshProducts,
        refreshAllProducts,
        productMode,
        setProductMode,
        updateProductInAllComponents,
        generatingDatasheetId,
        setGeneratingDatasheetId,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}

