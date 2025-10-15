'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ProductsList } from '@/components/ProductsList';
import { ProductsKanban } from '@/components/ProductsKanban';
import { ProductDatasheet } from '@/components/ProductDatasheet';
import { BlogsList } from '@/components/BlogsList';
import { MarketingView } from '@/components/MarketingView';
import { useProduct } from '@/contexts/product-context';
import { useView } from '@/contexts/view-context';

export default function Page() {
  const { data: session } = useSession();
  const { selectedProductId, setSelectedProductId, isAddingProduct, setIsAddingProduct, productMode, updateProductInAllComponents, refreshAllProducts } = useProduct();
  const { currentView, isCampaignFormOpen, setIsCampaignFormOpen } = useView();

  const renderView = () => {
    if (!currentView) {
      // Vista aún no inicializada
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'products':
        // Renderizar según el modo de producto
        if (!productMode) {
          // Usuario sin permisos de productos
          return (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin acceso</h3>
                <p className="text-gray-500">No tienes permisos para acceder a la gestión de productos</p>
              </div>
            </div>
          );
        }
        if (productMode === 'datasheet') {
          // Si hay un producto seleccionado, mostrar ProductDatasheet
          if (selectedProductId) {
            return (
              <ProductDatasheet 
                userRole={session?.user?.role}
                selectedProductId={selectedProductId}
                onProductSelect={setSelectedProductId}
              />
            );
          }
          // Si no hay producto seleccionado, mostrar el kanban
          return (
            <ProductsKanban 
              userRole={session?.user?.role}
              selectedProductId={selectedProductId}
              onProductSelect={setSelectedProductId}
              onEditProduct={(product) => {
                // Lógica para editar producto - se maneja en el contexto
                console.log('Edit product:', product);
              }}
              onDeleteProduct={async (productId) => {
                try {
                  const response = await fetch(`/api/products/${productId}`, {
                    method: 'DELETE',
                  });
                  
                  if (!response.ok) {
                    throw new Error('Error al eliminar producto');
                  }
                  
                  // Refrescar todos los componentes después de eliminar
                  refreshAllProducts();
                } catch (error) {
                  console.error('Error deleting product:', error);
                }
              }}
            />
          );
        }
        return (
          <ProductsList 
            userRole={session?.user?.role}
            selectedProductId={selectedProductId}
            onProductSelect={setSelectedProductId}
            isAddingProduct={isAddingProduct}
            onAddingProductChange={setIsAddingProduct}
          />
        );
      case 'blogs':
        return <BlogsList userRole={session?.user?.role} />;
      case 'marketing':
        return (
          <MarketingView 
            userRole={session?.user?.role}
            isFormOpen={isCampaignFormOpen}
            onFormOpenChange={setIsCampaignFormOpen}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-4 lg:px-6">
      <motion.div
        key={`${currentView}-${productMode}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {renderView()}
      </motion.div>
    </div>
  );
}
