'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, Portal } from '@/types';
import { mockPortals } from '@/lib/mockData';

const initialState: AppState = {
  portals: mockPortals,
  selectedPortal: null,
  activeSection: 'today-count',
  user: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@bidcompany.com',
    role: 'Bid Manager',
  },
  settings: {
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    theme: 'light',
    notifications: true,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PORTALS':
      return { ...state, portals: action.payload };
    
    case 'ADD_PORTAL':
      return { ...state, portals: [...state.portals, action.payload] };
    
    case 'UPDATE_PORTAL':
      return {
        ...state,
        portals: state.portals.map(portal =>
          portal.id === action.payload.id ? action.payload : portal
        ),
      };
    
    case 'DELETE_PORTAL':
      return {
        ...state,
        portals: state.portals.filter(portal => portal.id !== action.payload),
        selectedPortal: state.selectedPortal?.id === action.payload ? null : state.selectedPortal,
      };
    
    case 'SELECT_PORTAL':
      return { ...state, selectedPortal: action.payload };
    
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  addPortal: (portal: Omit<Portal, 'id'>) => void;
  updatePortal: (portal: Portal) => void;
  deletePortal: (portalId: string) => void;
  selectPortal: (portal: Portal | null) => void;
  setActiveSection: (section: AppState['activeSection']) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addPortal = (portalData: Omit<Portal, 'id'>) => {
    const newPortal: Portal = {
      ...portalData,
      id: `portal-${Date.now()}`,
    };
    dispatch({ type: 'ADD_PORTAL', payload: newPortal });
  };

  const updatePortal = (portal: Portal) => {
    dispatch({ type: 'UPDATE_PORTAL', payload: portal });
  };

  const deletePortal = (portalId: string) => {
    dispatch({ type: 'DELETE_PORTAL', payload: portalId });
  };

  const selectPortal = (portal: Portal | null) => {
    dispatch({ type: 'SELECT_PORTAL', payload: portal });
  };

  const setActiveSection = (section: AppState['activeSection']) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  };

  const updateSettings = (settings: Partial<AppState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const value = {
    state,
    dispatch,
    addPortal,
    updatePortal,
    deletePortal,
    selectPortal,
    setActiveSection,
    updateSettings,
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