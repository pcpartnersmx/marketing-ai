"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PERMISSIONS } from '@/lib/permissions';

type ViewType = 'products' | 'blogs' | 'marketing';

interface ViewContextType {
  currentView: ViewType | null;
  setCurrentView: (view: ViewType) => void;
  isCampaignFormOpen: boolean;
  setIsCampaignFormOpen: (open: boolean) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [currentView, setCurrentView] = useState<ViewType | null>(null);
  const [isCampaignFormOpen, setIsCampaignFormOpen] = useState(false);

  // Inicializar la vista basada en los permisos del usuario
  useEffect(() => {
    if (session?.user?.permissions) {
      const userPermissions = session.user.permissions;
      
      // Prioridad: productos (research o datasheet) > marketing > blogs
      if (userPermissions.includes(PERMISSIONS.PRODUCTS.RESEARCH) || 
          userPermissions.includes(PERMISSIONS.PRODUCTS.DATASHEET)) {
        setCurrentView('products');
      } else if (userPermissions.includes(PERMISSIONS.MARKETING.VIEW)) {
        setCurrentView('marketing');
      } else if (userPermissions.includes(PERMISSIONS.BLOGS.VIEW)) {
        setCurrentView('blogs');
      } else {
        setCurrentView('products'); // Fallback por si no tiene ningún permiso específico
      }
    }
  }, [session?.user?.permissions]);

  return (
    <ViewContext.Provider value={{ 
      currentView, 
      setCurrentView,
      isCampaignFormOpen,
      setIsCampaignFormOpen
    }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
}

