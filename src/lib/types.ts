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
  // Enhanced portal configuration
  baseUrl?: string;
  bidsUrl?: string;
  scraperType?: 'playwright' | 'cheerio';
  lastScraped?: Date;
}

// Document interface for bid attachments
export interface Document {
  name: string;
  url: string;
  type?: string;
}

// Enhanced bid data interface for real scraping
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
  // Enhanced bid fields
  postedDate?: Date;
  expirationDate?: Date;
  quantity?: string;
  documents?: Document[];
  sourceUrl: string;
  fetchedAt: Date;
}

// Credentials interface for scraper authentication
export interface Credentials {
  username: string;
  password: string;
}

// Bid details interface for detailed scraping
export interface BidDetails {
  id: string;
  title: string;
  description: string;
  quantity?: string;
  postedDate?: Date;
  expirationDate: Date;
  documents: Document[];
  sourceUrl: string;
  amount?: number;
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