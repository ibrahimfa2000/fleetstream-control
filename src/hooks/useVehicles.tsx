import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useVehicles = () => {
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('plate_number');
      
      if (error) throw error;
      return data;
    },
  });

  const syncVehicles = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('cmsv6-sync-vehicles');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: 'Success',
        description: 'Vehicles synced successfully',
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

  return {
    vehicles,
    isLoading,
    error,
    syncVehicles: syncVehicles.mutate,
    isSyncing: syncVehicles.isPending,
  };
};
