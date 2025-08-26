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
};

// Mock data for development
export const mockData = {
  portals: [
    {
      id: '1',
      name: 'Metro',
      url: 'https://metro.gov/bids',
      username: 'user1',
      password: '****',
      isActive: true,
      lastSync: new Date(),
      bidCount: 15,
    },
    {
      id: '2',
      name: 'OhioBuys',
      url: 'https://ohiobuys.gov',
      username: 'user2',
      password: '****',
      isActive: true,
      lastSync: new Date(),
      bidCount: 8,
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
      dateHunted: new Date(),
      status: 'active',
    },
    {
      id: '2',
      title: 'IT Equipment Purchase',
      description: 'Computer and server procurement',
      amount: 25000,
      deadline: new Date('2024-02-20'),
      portalId: '2',
      portalName: 'OhioBuys',
      url: 'https://ohiobuys.gov/bid/2',
      dateHunted: new Date(),
      status: 'active',
    },
  ] as BidData[],
};