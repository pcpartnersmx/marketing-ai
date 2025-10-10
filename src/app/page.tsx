'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ProductsList } from '@/components/ProductsList';
import { ProductDatasheet } from '@/components/ProductDatasheet';
import { BlogsList } from '@/components/BlogsList';
import { MarketingView } from '@/components/MarketingView';
import { useProduct } from '@/contexts/product-context';
import { useView } from '@/contexts/view-context';

export default function Page() {
  const { data: session } = useSession();
  const { selectedProductId, setSelectedProductId, isAddingProduct, setIsAddingProduct, productMode } = useProduct();
  const { currentView, isCampaignFormOpen, setIsCampaignFormOpen } = useView();

  const renderView = () => {
    switch (currentView) {
      case 'products':
        // Renderizar según el modo de producto
        if (productMode === 'datasheet') {
          return (
            <ProductDatasheet
              userRole={session?.user?.role}
              selectedProductId={selectedProductId}
              onProductSelect={setSelectedProductId}
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
