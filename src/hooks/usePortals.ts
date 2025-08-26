import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Portal, ApiResponse } from '@/types';
import { mockPortals } from '@/lib/mockData';

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
const fetchPortals = async (): Promise<ApiResponse<Portal[]>> => {
  await delay(500);
  return {
    data: mockPortals,
    success: true,
    message: 'Portals retrieved successfully',
    timestamp: new Date().toISOString(),
    total: mockPortals.length,
  };
};

const createPortal = async (portalData: Omit<Portal, 'id'>): Promise<ApiResponse<Portal>> => {
  await delay(800);
  
  const newPortal: Portal = {
    ...portalData,
    id: `portal-${Date.now()}`,
    lastChecked: new Date().toISOString(),
    bidCount: 0,
  };

  return {
    data: newPortal,
    success: true,
    message: 'Portal created successfully',
    timestamp: new Date().toISOString(),
  };
};

const updatePortal = async (portal: Portal): Promise<ApiResponse<Portal>> => {
  await delay(600);
  
  const updatedPortal = {
    ...portal,
    lastChecked: new Date().toISOString(),
  };

  return {
    data: updatedPortal,
    success: true,
    message: 'Portal updated successfully',
    timestamp: new Date().toISOString(),
  };
};

const deletePortal = async (portalId: string): Promise<ApiResponse<null>> => {
  await delay(400);
  
  return {
    data: null,
    success: true,
    message: 'Portal deleted successfully',
    timestamp: new Date().toISOString(),
  };
};

const testPortalConnection = async (portal: Pick<Portal, 'url' | 'username' | 'password'>): Promise<ApiResponse<{ connected: boolean; responseTime: number }>> => {
  await delay(2000); // Simulate connection test
  
  // Simulate random success/failure
  const connected = Math.random() > 0.2; // 80% success rate
  const responseTime = Math.floor(Math.random() * 2000) + 500; // 500-2500ms

  return {
    data: { connected, responseTime },
    success: true,
    message: connected ? 'Connection successful' : 'Connection failed',
    timestamp: new Date().toISOString(),
  };
};

export function usePortals() {
  return useQuery({
    queryKey: ['portals'],
    queryFn: fetchPortals,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCreatePortal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPortal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portals'] });
      queryClient.invalidateQueries({ queryKey: ['todayStats'] });
    },
  });
}

export function useUpdatePortal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePortal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portals'] });
      queryClient.invalidateQueries({ queryKey: ['todayStats'] });
    },
  });
}

export function useDeletePortal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePortal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portals'] });
      queryClient.invalidateQueries({ queryKey: ['todayStats'] });
    },
  });
}

export function useTestPortalConnection() {
  return useMutation({
    mutationFn: testPortalConnection,
  });
}