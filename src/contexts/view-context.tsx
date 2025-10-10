"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ViewType = 'products' | 'blogs' | 'marketing';

interface ViewContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isCampaignFormOpen: boolean;
  setIsCampaignFormOpen: (open: boolean) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('products');
  const [isCampaignFormOpen, setIsCampaignFormOpen] = useState(false);

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

