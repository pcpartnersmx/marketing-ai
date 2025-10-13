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
    switch (currentView) {
      case 'products':
        // Renderizar según el modo de producto
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
