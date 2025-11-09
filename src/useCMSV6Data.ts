import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCMSV6Login = () => {
  return useQuery({
    queryKey: ["cmsv6-login"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cmsv6-login");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCMSV6Vehicles = () => {
  return useQuery({
    queryKey: ["cmsv6-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cmsv6-vehicles");
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useCMSV6Alerts = () => {
  return useQuery({
    queryKey: ["cmsv6-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cmsv6-alerts");
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useCMSV6Locations = () => {
  return useQuery({
    queryKey: ["cmsv6-locations"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cmsv6-locations");
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds for real-time tracking
  });
};

export const useCMSV6Videos = () => {
  return useQuery({
    queryKey: ["cmsv6-videos"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cmsv6-videos");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
