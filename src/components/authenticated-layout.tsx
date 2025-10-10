"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ProductCommandPalette } from "@/components/ProductCommandPalette";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { GlobalProductDialogs } from "@/components/GlobalProductDialogs";
import { useProduct } from "@/contexts/product-context";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from 'sonner';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  selectedProductId?: string | null;
  onProductSelect?: (productId: string | null) => void;
  onAddProduct?: () => void;
  onAddCampaign?: () => void;
}

export default function AuthenticatedLayout({ 
  children, 
  selectedProductId, 
  onProductSelect,
  onAddProduct,
  onAddCampaign
}: AuthenticatedLayoutProps) {
  const { data: session } = useSession();
  const { isOpen, closeCommandPalette } = useCommandPalette();
  const { 
    isFormOpen, 
    setIsFormOpen, 
    editingProduct, 
    setEditingProduct, 
    refreshAllProducts 
  } = useProduct();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleProductSelect = (productId: string) => {
    onProductSelect?.(productId);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      toast.success('Producto eliminado exitosamente');
      refreshAllProducts();
      
      // Si el producto eliminado es el seleccionado, limpiar la selección
      if (selectedProductId === productToDelete) {
        onProductSelect?.(null);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    } finally {
      setProductToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    refreshAllProducts();
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar 
        variant="inset"
        user={session?.user}
        selectedProductId={selectedProductId}
        onProductSelect={onProductSelect}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddCampaign={onAddCampaign}
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 h-full">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 h-full">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
      
      {/* Command Palette */}
      <ProductCommandPalette
        isOpen={isOpen}
        onClose={closeCommandPalette}
        onProductSelect={handleProductSelect}
        onAddProduct={handleAddProduct}
        userRole={session?.user?.role}
      />

      {/* Global Product Dialogs */}
      <GlobalProductDialogs
        isFormOpen={isFormOpen}
        onFormClose={handleFormClose}
        editingProduct={editingProduct}
        onFormSuccess={handleFormSuccess}
        userRole={session?.user?.role}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Eliminar Producto"
        description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </SidebarProvider>
  );
}
