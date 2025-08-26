import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portalsApi } from '@/lib/api';
import { Portal } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';

export function usePortals() {
  const { portals, setPortals } = useAppContext();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['portals'],
    queryFn: portalsApi.getAll,
    initialData: { success: true, data: portals },
  });

  const createMutation = useMutation({
    mutationFn: portalsApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['portals'] });
      // Also update the AppContext to keep it in sync
      if (response.success && response.data) {
        setPortals(prev => [...prev, response.data]);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, portal }: { id: string; portal: Partial<Portal> }) =>
      portalsApi.update(id, portal),
    onSuccess: (response, { id, portal }) => {
      queryClient.invalidateQueries({ queryKey: ['portals'] });
      // Also update the AppContext to keep it in sync
      if (response.success) {
        setPortals(prev =>
          prev.map(p => p.id === id ? { ...p, ...portal } : p)
        );
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: portalsApi.delete,
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['portals'] });
      // Also update the AppContext to keep it in sync
      if (response.success) {
        setPortals(prev => prev.filter(p => p.id !== id));
      }
    },
  });

  return {
    portals: query.data?.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createPortal: createMutation.mutate,
    updatePortal: updateMutation.mutate,
    deletePortal: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}