"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

type ProductMode = 'research' | 'datasheet';

interface ProductContextType {
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  isAddingProduct: boolean;
  setIsAddingProduct: (value: boolean) => void;
  isFormOpen: boolean;
  setIsFormOpen: (value: boolean) => void;
  editingProduct: any | null;
  setEditingProduct: (product: any | null) => void;
  refreshProducts: () => void;
  setRefreshProducts: (callback: () => void) => void;
  refreshAllProducts: () => void;
  productMode: ProductMode;
  setProductMode: (mode: ProductMode) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productMode, setProductMode] = useState<ProductMode>('research');
  
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

