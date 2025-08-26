import { useQuery } from '@tanstack/react-query';
import { TodayStats, ApiResponse } from '@/types';
import { mockTodayStats } from '@/lib/mockData';

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchTodayStats = async (): Promise<ApiResponse<TodayStats>> => {
  await delay(600);
  
  // Simulate dynamic data updates
  const now = new Date();
  const dynamicStats: TodayStats = {
    ...mockTodayStats,
    totalBids: mockTodayStats.totalBids + Math.floor(Math.random() * 5),
    newBids: Math.floor(Math.random() * 10) + 1,
    lastUpdate: now.toISOString(),
  };

  return {
    data: dynamicStats,
    success: true,
    message: 'Today statistics retrieved successfully',
    timestamp: now.toISOString(),
  };
};

export function useTodayStats(options: { refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: ['todayStats'],
    queryFn: fetchTodayStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: options.refetchInterval || 1000 * 60 * 5, // Auto-refresh every 5 minutes
    refetchIntervalInBackground: true,
  });
}