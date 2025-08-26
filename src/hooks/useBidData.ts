import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todayCountApi, huntedDataApi } from '@/lib/api';

export function useTodayCount() {
  return useQuery({
    queryKey: ['todayCount'],
    queryFn: todayCountApi.get,
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
}

export function useHuntedData(date?: string) {
  return useQuery({
    queryKey: ['huntedData', date],
    queryFn: () => date ? huntedDataApi.getByDate(date) : huntedDataApi.getAll(),
  });
}

export function useRefreshHuntedData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: huntedDataApi.refresh,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['huntedData'] });
      queryClient.invalidateQueries({ queryKey: ['todayCount'] });
    },
  });
}