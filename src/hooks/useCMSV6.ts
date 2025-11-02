import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CMSV6Session {
  jsession: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useCMSV6Session = () => {
  const [session, setSession] = useState<CMSV6Session>({
    jsession: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initSession = async () => {
      try {
        // Check if we have a stored session
        const stored = localStorage.getItem('cmsv6_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          const expiry = parsed.expiry || 0;
          
          if (Date.now() < expiry) {
            setSession({ jsession: parsed.jsession, isLoading: false, error: null });
            return;
          }
        }

        // Login to CMSV6
        const { data, error } = await supabase.functions.invoke('cmsv6-login', {
          method: 'POST',
        });

        if (error) throw error;

        if (data?.jsession) {
          // Store session with 1 hour expiry
          localStorage.setItem('cmsv6_session', JSON.stringify({
            jsession: data.jsession,
            expiry: Date.now() + (60 * 60 * 1000),
          }));
          
          setSession({ jsession: data.jsession, isLoading: false, error: null });
        } else {
          throw new Error('No session token received from CMSV6');
        }
      } catch (err) {
        console.error('CMSV6 session error:', err);
        setSession({ 
          jsession: null, 
          isLoading: false, 
          error: err instanceof Error ? err.message : 'Failed to establish CMSV6 session' 
        });
      }
    };

    initSession();
  }, []);

  const refreshSession = async () => {
    setSession(prev => ({ ...prev, isLoading: true }));
    localStorage.removeItem('cmsv6_session');
    
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-login', {
        method: 'POST',
      });

      if (error) throw error;

      if (data?.jsession) {
        localStorage.setItem('cmsv6_session', JSON.stringify({
          jsession: data.jsession,
          expiry: Date.now() + (60 * 60 * 1000),
        }));
        
        setSession({ jsession: data.jsession, isLoading: false, error: null });
      }
    } catch (err) {
      console.error('CMSV6 session refresh error:', err);
      setSession({ 
        jsession: null, 
        isLoading: false, 
        error: err instanceof Error ? err.message : 'Failed to refresh CMSV6 session' 
      });
    }
  };

  return { ...session, refreshSession };
};

export const useCMSV6Vehicles = (jsession: string | null) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    if (!jsession) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.functions.invoke('cmsv6-vehicles', {
        body: { jsession },
      });

      if (fetchError) throw fetchError;

      setVehicles(data?.data?.vehicles || []);
    } catch (err) {
      console.error('CMSV6 vehicles fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [jsession]);

  return { vehicles, isLoading, error, refetch: fetchVehicles };
};

export const useCMSV6LiveVideo = () => {
  const getLiveVideo = async (jsession: string, deviceId: string, channel = 0, streamType = 1) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-live-video', {
        body: { jsession, deviceId, channel, streamType },
      });

      if (error) throw error;

      return data?.streamUrl || null;
    } catch (err) {
      console.error('CMSV6 live video error:', err);
      throw err;
    }
  };

  return { getLiveVideo };
};

export const useCMSV6Telemetry = () => {
  const getTelemetry = async (jsession: string, deviceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-telemetry', {
        body: { jsession, deviceId },
      });

      if (error) throw error;

      return data?.data?.status || null;
    } catch (err) {
      console.error('CMSV6 telemetry error:', err);
      throw err;
    }
  };

  return { getTelemetry };
};

export const useCMSV6Control = () => {
  const sendCommand = async (jsession: string, deviceId: string, command: string, params = {}) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-control', {
        body: { jsession, deviceId, command, params },
      });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('CMSV6 control error:', err);
      throw err;
    }
  };

  return { sendCommand };
};

export const useCMSV6Alarms = () => {
  const getAlarms = async (jsession: string, deviceId: string, startTime?: string, endTime?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-alarms', {
        body: { jsession, deviceId, startTime, endTime },
      });

      if (error) throw error;

      return data?.alarms || [];
    } catch (err) {
      console.error('CMSV6 alarms error:', err);
      throw err;
    }
  };

  return { getAlarms };
};
