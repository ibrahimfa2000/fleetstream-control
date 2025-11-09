import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export const useGPSTracking = (vehicleId?: string) => {
  const queryClient = useQueryClient();

  const { data: latestPositions, isLoading } = useQuery({
    queryKey: ['gps-tracking', vehicleId],
    queryFn: async () => {
      let query = supabase
        .from('gps_tracking')
        .select('*, vehicles(*)');

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query
        .order('gps_time', { ascending: false })
        .limit(vehicleId ? 50 : 1);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const syncGPS = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('cmsv6-sync-gps');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gps-tracking'] });
      toast({
        title: 'Success',
        description: 'GPS data synced successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('gps-tracking-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gps_tracking',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['gps-tracking'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    latestPositions,
    isLoading,
    syncGPS: syncGPS.mutate,
    isSyncing: syncGPS.isPending,
  };
};
