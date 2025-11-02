import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const CMSV6_API_URL = Deno.env.get('CMSV6_API_URL');

    if (!CMSV6_API_URL) {
      throw new Error('CMSV6 API URL not configured');
    }

    const { jsession, deviceId } = await req.json();

    if (!jsession || !deviceId) {
      throw new Error('CMSV6 session token and device ID required');
    }

    console.log(`[CMSV6] Getting real-time status for device: ${deviceId}`);

    // Get real-time device status from CMSV6 API
    const statusUrl = `${CMSV6_API_URL}/StandardApiAction_deviceStatus.action?jsession=${jsession}&devIdno=${deviceId}`;
    
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMSV6 API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('[CMSV6] Real-time status retrieved');

    // Sync telemetry to our database
    if (data.result === 0 && data.status) {
      const { data: device } = await supabaseClient
        .from('devices')
        .select('id')
        .eq('imei', deviceId)
        .maybeSingle();

      if (device) {
        const status = data.status;
        
        await supabaseClient
          .from('telemetry')
          .insert({
            device_id: device.id,
            gps_lat: status.latitude || status.lat || null,
            gps_lon: status.longitude || status.lng || null,
            signal_strength: status.gsmSignal || status.signalStrength || null,
            battery_level: status.batteryLevel || null,
            storage_free_mb: status.storageFree || null,
            data_usage_mb: status.dataUsage || null,
            timestamp: status.gpsTime || new Date().toISOString(),
          });

        // Update device status
        await supabaseClient
          .from('devices')
          .update({
            status: status.onlineStatus === 1 ? 'online' : 'offline',
            last_seen: status.onlineStatus === 1 ? new Date().toISOString() : null,
          })
          .eq('id', device.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[CMSV6] Telemetry fetch error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Failed to fetch telemetry',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
