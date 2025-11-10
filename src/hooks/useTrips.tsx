import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTrips = (vehicleId?: string) => {
  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips', vehicleId],
    queryFn: async () => {
      let query = supabase
        .from('trips')
        .select('*, vehicles(plate_number), drivers(driver_name)');

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query
        .order('start_time', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    totalTrips: trips?.length || 0,
    totalDistance: trips?.reduce((sum, trip) => sum + (Number(trip.distance) || 0), 0) || 0,
    totalDuration: trips?.reduce((sum, trip) => sum + (trip.duration || 0), 0) || 0,
    avgSpeed: trips?.length 
      ? trips.reduce((sum, trip) => sum + (Number(trip.avg_speed) || 0), 0) / trips.length 
      : 0,
  };

  return {
    trips,
    isLoading,
    stats,
  };
};
