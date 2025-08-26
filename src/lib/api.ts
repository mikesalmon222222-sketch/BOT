import { Portal, BidData, TodayCountResponse, HuntedDataResponse, ApiResponse } from './types';

const API_BASE_URL = '/api';

// Utility function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      data: null as T,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Today's count API
export const todayCountApi = {
  get: () => apiCall<TodayCountResponse>('/bid-data/today-count'),
};

// Hunted data API
export const huntedDataApi = {
  getByDate: (date: string) => 
    apiCall<HuntedDataResponse>(`/bid-data/hunted?date=${date}`),
  getAll: () => apiCall<HuntedDataResponse>('/bid-data/hunted'),
  refresh: () => apiCall<HuntedDataResponse>('/bid-data/refresh'),
};

// Enhanced bids API
export const bidsApi = {
  getAll: () => apiCall<HuntedDataResponse>('/bids'),
  fetchFromPortal: (portalId: string, credentials?: { username: string; password: string }) =>
    apiCall<{ bids: BidData[]; total: number; portal: string; message: string }>('/bids/fetch', {
      method: 'POST',
      body: JSON.stringify({ portalId, credentials }),
    }),
  getTodayCount: () => apiCall<TodayCountResponse>('/bids/today'),
};

// Portals API
export const portalsApi = {
  getAll: () => apiCall<Portal[]>('/portals'),
  create: (portal: Omit<Portal, 'id'>) =>
    apiCall<Portal>('/portals', {
      method: 'POST',
      body: JSON.stringify(portal),
    }),
  update: (id: string, portal: Partial<Portal>) =>
    apiCall<Portal>(`/portals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(portal),
    }),
  delete: (id: string) =>
    apiCall<void>(`/portals/${id}`, {
      method: 'DELETE',
    }),
  scrape: (portalId: string, credentials?: { username: string; password: string }) =>
    apiCall<{ bids: BidData[]; total: number; portal: string; message: string }>('/portals/scrape', {
      method: 'POST',
      body: JSON.stringify({ portalId, credentials }),
    }),
  testConnection: (portalId: string, credentials?: { username: string; password: string }) =>
    apiCall<{ portal: string; status: string; message: string }>('/portals/test', {
      method: 'POST',
      body: JSON.stringify({ portalId, credentials }),
    }),
};

// Mock data for development (kept for backward compatibility)
export const mockData = {
  portals: [
    {
      id: '1',
      name: 'Metro',
      url: 'https://business.metro.net/webcenter/portal/VendorPortal/pages_home/solicitations/openSolicitations',
      baseUrl: 'https://business.metro.net',
      bidsUrl: 'https://business.metro.net/webcenter/portal/VendorPortal/pages_home/solicitations/openSolicitations',
      username: '',
      password: '',
      isActive: true,
      scraperType: 'playwright' as const,
      lastSync: new Date(),
      bidCount: 0,
    },
  ] as Portal[],

  bidData: [
    {
      id: '1',
      title: 'Road Construction Project',
      description: 'Highway 23 expansion project',
      amount: 50000,
      deadline: new Date('2024-02-15'),
      portalId: '1',
      portalName: 'Metro',
      url: 'https://metro.gov/bids/1',
      sourceUrl: 'https://metro.gov/bids/1',
      dateHunted: new Date(),
      fetchedAt: new Date(),
      status: 'active' as const,
    },
  ] as BidData[],
};