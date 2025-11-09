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
  const [GPSData, setGPSData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getGPSDetails } = useCMSV6TrackDevice();
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

  return { vehicles, isLoading, GPSData, error, refetch: fetchVehicles };
};

export const useCMSV6LiveVideo = () => {
  const getLiveVideo = async (jsession: string, deviceId: string, channel: number, streamType: number) => {
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
export const useCMSV6TrackDevice = () => {
  const getGPSDetails = async (jsession: string, deviceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-device-track', {
        body: { jsession, deviceId },
      });

      if (error) throw error;

      return data.track?.status || null;
    } catch (err) {
      console.error('CMSV6track error:', err);
      throw err;
    }
  };

  return { getGPSDetails };
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

export const useCMSV6Reports = () => {
  const getReport = async (
    jsession: string, 
    reportType: string, 
    params: {
      deviceId?: string;
      vehiIdnos?: string;
      begintime?: string;
      endtime?: string;
      currentPage?: number;
      pageRecords?: number;
    }
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-reports', {
        body: { jsession, reportType, ...params },
      });

      if (error) throw error;

      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 reports error:', err);
      throw err;
    }
  };

  const getPeopleDetail = async (
    jsession: string,
    plateNumber: string,
    begintime: string,
    endtime: string,
    currentPage?: number,
    pageRecords?: number
  ) => {
    return getReport(jsession, 'peopleDetail', {
      vehiIdnos: plateNumber,
      begintime,
      endtime,
      currentPage,
      pageRecords,
    });
  };

  const getPassengerDetail = async (
    jsession: string,
    plateNumber: string,
    begintime: string,
    endtime: string,
    currentPage?: number,
    pageRecords?: number
  ) => {
    return getReport(jsession, 'passengerDetail', {
      vehiIdnos: plateNumber,
      begintime,
      endtime,
      currentPage,
      pageRecords,
    });
  };

  const getPassengerSummary = async (
    jsession: string,
    plateNumber: string,
    begintime: string,
    endtime: string,
    currentPage?: number,
    pageRecords?: number
  ) => {
    return getReport(jsession, 'passengerSummary', {
      vehiIdnos: plateNumber,
      begintime,
      endtime,
      currentPage,
      pageRecords,
    });
  };

  return { getReport, getPeopleDetail, getPassengerDetail, getPassengerSummary };
};

export const useCMSV6SIMManagement = () => {
  const mergeSIM = async (jsession: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-sim-management', {
        body: { jsession, action: 'merge', params },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('CMSV6 merge SIM error:', err);
      throw err;
    }
  };

  const findSIM = async (jsession: string, id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-sim-management', {
        body: { jsession, action: 'find', params: { id } },
      });

      if (error) throw error;
      return data?.data?.sim || null;
    } catch (err) {
      console.error('CMSV6 find SIM error:', err);
      throw err;
    }
  };

  const deleteSIM = async (jsession: string, id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-sim-management', {
        body: { jsession, action: 'delete', params: { id } },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('CMSV6 delete SIM error:', err);
      throw err;
    }
  };

  const listSIMs = async (jsession: string, currentPage?: number, pageRecords?: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-sim-management', {
        body: { jsession, action: 'list', params: { currentPage, pageRecords } },
      });

      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 list SIMs error:', err);
      throw err;
    }
  };

  const unbindSIM = async (jsession: string, id: string, flag?: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-sim-management', {
        body: { jsession, action: 'unbind', params: { id, flag } },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('CMSV6 unbind SIM error:', err);
      throw err;
    }
  };

  return { mergeSIM, findSIM, deleteSIM, listSIMs, unbindSIM };
};

export const useCMSV6AreaManagement = () => {
  const listAreas = async (jsession: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-area-management', {
        body: { jsession, action: 'list', params: {} },
      });
      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 list areas error:', err);
      throw err;
    }
  };

  const addArea = async (jsession: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-area-management', {
        body: { jsession, action: 'add', params },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('CMSV6 add area error:', err);
      throw err;
    }
  };

  const modifyArea = async (jsession: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-area-management', {
        body: { jsession, action: 'modify', params },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('CMSV6 modify area error:', err);
      throw err;
    }
  };

  const viewArea = async (jsession: string, id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-area-management', {
        body: { jsession, action: 'view', params: { id } },
      });
      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 view area error:', err);
      throw err;
    }
  };

  const deleteArea = async (jsession: string, id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-area-management', {
        body: { jsession, action: 'delete', params: { id } },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('CMSV6 delete area error:', err);
      throw err;
    }
  };

  return { listAreas, addArea, modifyArea, viewArea, deleteArea };
};

export const useCMSV6DriverManagement = () => {
  const listDrivers = async (jsession: string, currentPage?: number, pageRecords?: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-driver-management', {
        body: { jsession, action: 'list', params: { currentPage, pageRecords } },
      });
      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 list drivers error:', err);
      throw err;
    }
  };

  const addDriver = async (jsession: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-driver-management', {
        body: { jsession, action: 'add', params },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('CMSV6 add driver error:', err);
      throw err;
    }
  };

  const modifyDriver = async (jsession: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-driver-management', {
        body: { jsession, action: 'modify', params },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('CMSV6 modify driver error:', err);
      throw err;
    }
  };

  const findDriver = async (jsession: string, id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-driver-management', {
        body: { jsession, action: 'find', params: { id } },
      });
      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 find driver error:', err);
      throw err;
    }
  };

  const deleteDriver = async (jsession: string, id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-driver-management', {
        body: { jsession, action: 'delete', params: { id } },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('CMSV6 delete driver error:', err);
      throw err;
    }
  };

  const queryDriverByDevice = async (jsession: string, devIdno: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-driver-management', {
        body: { jsession, action: 'queryByDevice', params: { devIdno } },
      });
      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 query driver by device error:', err);
      throw err;
    }
  };

  return { listDrivers, addDriver, modifyDriver, findDriver, deleteDriver, queryDriverByDevice };
};

export const useCMSV6TrafficCard = () => {
  const getFlowInfo = async (jsession: string, devIdno: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-traffic-card', {
        body: { jsession, action: 'getInfo', params: { devIdno } },
      });
      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 get flow info error:', err);
      throw err;
    }
  };

  const saveFlowConfig = async (jsession: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-traffic-card', {
        body: { jsession, action: 'saveConfig', params },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('CMSV6 save flow config error:', err);
      throw err;
    }
  };

  return { getFlowInfo, saveFlowConfig };
};

export const useCMSV6SafetyBusiness = () => {
  const getSecurityEvidence = async (jsession: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-safety-business', {
        body: { jsession, action: 'securityEvidence', params },
      });
      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 security evidence error:', err);
      throw err;
    }
  };

  const queryEvidence = async (jsession: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-safety-business', {
        body: { jsession, action: 'evidenceQuery', params },
      });
      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 evidence query error:', err);
      throw err;
    }
  };

  const getResourceCatalogSummary = async (jsession: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-safety-business', {
        body: { jsession, action: 'resourceCatalogSummary', params },
      });
      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 resource catalog summary error:', err);
      throw err;
    }
  };

  const queryPictures = async (jsession: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-safety-business', {
        body: { jsession, action: 'pictureQuery', params },
      });
      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 picture query error:', err);
      throw err;
    }
  };

  const queryAudioVideo = async (jsession: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-safety-business', {
        body: { jsession, action: 'audioVideoQuery', params },
      });
      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      console.error('CMSV6 audio/video query error:', err);
      throw err;
    }
  };

  return { getSecurityEvidence, queryEvidence, getResourceCatalogSummary, queryPictures, queryAudioVideo };
};

export const useCMSV6DeviceOnline = () => {
  const getDeviceOnlineStatus = async (jsession: string, devIdno?: string, vehiIdno?: string, status?: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('cmsv6-device-online', {
        body: { jsession, devIdno, vehiIdno, status },
      });
      if (error) throw error;
      return data?.onlines || [];
    } catch (err) {
      console.error('CMSV6 device online status error:', err);
      throw err;
    }
  };

  return { getDeviceOnlineStatus };
};
