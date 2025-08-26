import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BidData, ApiResponse, FilterOptions, SortOptions } from '@/types';
import { mockBidData } from '@/lib/mockData';

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
const fetchBidData = async (
  filters: FilterOptions = {},
  sort: SortOptions = { field: 'publishedDate', direction: 'desc' }
): Promise<ApiResponse<BidData[]>> => {
  await delay(800); // Simulate network delay

  let filteredData = [...mockBidData];

  // Apply filters
  if (filters.portal && filters.portal.length > 0) {
    filteredData = filteredData.filter(bid => filters.portal!.includes(bid.portalId));
  }

  if (filters.category && filters.category.length > 0) {
    filteredData = filteredData.filter(bid => filters.category!.includes(bid.category));
  }

  if (filters.status && filters.status.length > 0) {
    filteredData = filteredData.filter(bid => filters.status!.includes(bid.status));
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredData = filteredData.filter(bid =>
      bid.title.toLowerCase().includes(searchLower) ||
      bid.description.toLowerCase().includes(searchLower) ||
      bid.agency.toLowerCase().includes(searchLower)
    );
  }

  if (filters.dateRange) {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    filteredData = filteredData.filter(bid => {
      const bidDate = new Date(bid.publishedDate);
      return bidDate >= startDate && bidDate <= endDate;
    });
  }

  if (filters.amountRange) {
    filteredData = filteredData.filter(bid =>
      bid.amount >= filters.amountRange!.min && bid.amount <= filters.amountRange!.max
    );
  }

  // Apply sorting
  filteredData.sort((a, b) => {
    const aValue = a[sort.field];
    const bValue = b[sort.field];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sort.direction === 'asc' ? comparison : -comparison;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return sort.direction === 'asc' ? comparison : -comparison;
    }
    
    return 0;
  });

  return {
    data: filteredData,
    success: true,
    message: 'Bid data retrieved successfully',
    timestamp: new Date().toISOString(),
    total: filteredData.length,
  };
};

const refreshBidData = async (): Promise<ApiResponse<BidData[]>> => {
  await delay(1000);
  
  // Simulate adding new bids
  const newBidsCount = Math.floor(Math.random() * 3) + 1;
  const updatedData = [...mockBidData];
  
  for (let i = 0; i < newBidsCount; i++) {
    const newBid: BidData = {
      ...mockBidData[0],
      id: `bid-new-${Date.now()}-${i}`,
      title: `New Bid Opportunity ${i + 1}`,
      publishedDate: new Date().toISOString(),
    };
    updatedData.unshift(newBid);
  }

  return {
    data: updatedData,
    success: true,
    message: `Found ${newBidsCount} new bids`,
    timestamp: new Date().toISOString(),
    total: updatedData.length,
  };
};

export function useBidData(filters: FilterOptions = {}, sort: SortOptions = { field: 'publishedDate', direction: 'desc' }) {
  return useQuery({
    queryKey: ['bidData', filters, sort],
    queryFn: () => fetchBidData(filters, sort),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime in v5)
  });
}

export function useRefreshBidData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshBidData,
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(['bidData'], data);
      
      // Invalidate related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['bidData'] });
      queryClient.invalidateQueries({ queryKey: ['todayStats'] });
    },
  });
}

export function useExportBidData() {
  return useMutation({
    mutationFn: async (data: BidData[]) => {
      await delay(500);
      
      // Convert to CSV format
      const headers = ['Title', 'Agency', 'Amount', 'Deadline', 'Status', 'Portal'];
      const csvContent = [
        headers.join(','),
        ...data.map(bid => [
          `"${bid.title}"`,
          `"${bid.agency}"`,
          bid.amount,
          bid.deadline,
          bid.status,
          `"${bid.portalName}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bid-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, message: 'Data exported successfully' };
    },
  });
}