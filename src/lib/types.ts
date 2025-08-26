// Portal configuration interface
export interface Portal {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string;
  isActive: boolean;
  lastSync?: Date;
  bidCount?: number;
}

// Bid data interface
export interface BidData {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: Date;
  portalId: string;
  portalName: string;
  url: string;
  dateHunted: Date;
  status: 'active' | 'expired' | 'closed';
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface TodayCountResponse {
  totalBids: number;
  portalCounts: {
    portalId: string;
    portalName: string;
    count: number;
  }[];
  lastUpdated: Date;
}

export interface HuntedDataResponse {
  bids: BidData[];
  total: number;
  date: string;
}

// Form interfaces
export interface PortalFormData {
  name: string;
  url: string;
  username: string;
  password: string;
  isActive: boolean;
}

// Context interfaces
export interface AppContextType {
  portals: Portal[];
  setPortals: (portals: Portal[]) => void;
  addPortal: (portal: Portal) => void;
  updatePortal: (id: string, portal: Partial<Portal>) => void;
  deletePortal: (id: string) => void;
}