export interface Portal {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string;
  status: 'active' | 'inactive' | 'error';
  lastChecked: string;
  bidCount: number;
  type: 'government' | 'private' | 'nonprofit';
}

export interface BidData {
  id: string;
  title: string;
  description: string;
  portalId: string;
  portalName: string;
  bidNumber: string;
  agency: string;
  amount: number;
  currency: string;
  deadline: string;
  publishedDate: string;
  category: string;
  location: string;
  status: 'open' | 'closed' | 'awarded' | 'cancelled';
  tags: string[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  documents: {
    name: string;
    url: string;
    type: string;
  }[];
}

export interface TodayStats {
  totalBids: number;
  newBids: number;
  activePortals: number;
  totalPortals: number;
  lastUpdate: string;
  bidsByPortal: {
    [portalId: string]: {
      name: string;
      count: number;
      percentage: number;
    };
  };
  bidsByCategory: {
    [category: string]: number;
  };
  bidsByStatus: {
    open: number;
    closed: number;
    awarded: number;
    cancelled: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface AppState {
  portals: Portal[];
  selectedPortal: Portal | null;
  activeSection: 'today-count' | 'hunted-data' | 'credentials';
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  settings: {
    autoRefresh: boolean;
    refreshInterval: number;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}

export type AppAction =
  | { type: 'SET_PORTALS'; payload: Portal[] }
  | { type: 'ADD_PORTAL'; payload: Portal }
  | { type: 'UPDATE_PORTAL'; payload: Portal }
  | { type: 'DELETE_PORTAL'; payload: string }
  | { type: 'SELECT_PORTAL'; payload: Portal | null }
  | { type: 'SET_ACTIVE_SECTION'; payload: AppState['activeSection'] }
  | { type: 'SET_USER'; payload: AppState['user'] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'RESET_STATE' };

export interface FilterOptions {
  portal?: string[];
  category?: string[];
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  search?: string;
}

export interface SortOptions {
  field: keyof BidData;
  direction: 'asc' | 'desc';
}