'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Portal, AppContextType } from '@/lib/types';
import { mockData } from '@/lib/api';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [portals, setPortals] = useState<Portal[]>([]);

  useEffect(() => {
    // Initialize with mock data for development
    setPortals(mockData.portals);
  }, []);

  const addPortal = (portal: Portal) => {
    setPortals(prev => [...prev, portal]);
  };

  const updatePortal = (id: string, updatedPortal: Partial<Portal>) => {
    setPortals(prev =>
      prev.map(portal =>
        portal.id === id ? { ...portal, ...updatedPortal } : portal
      )
    );
  };

  const deletePortal = (id: string) => {
    setPortals(prev => prev.filter(portal => portal.id !== id));
  };

  const value: AppContextType = {
    portals,
    setPortals,
    addPortal,
    updatePortal,
    deletePortal,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}