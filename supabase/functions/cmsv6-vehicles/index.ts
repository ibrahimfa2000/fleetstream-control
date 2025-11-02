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

    const { jsession } = await req.json();

    if (!jsession) {
      throw new Error('CMSV6 session token required');
    }

    console.log('[CMSV6] Fetching vehicles from CMSV6 API...');

    // Get user vehicles from CMSV6 API
    const vehiclesUrl = `${CMSV6_API_URL}/StandardApiAction_queryUserVehicle.action?jsession=${jsession}`;
    
    const response = await fetch(vehiclesUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMSV6 API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('[CMSV6] Vehicles fetched successfully');

    // Sync vehicles to our database
    if (data.vehicles && Array.isArray(data.vehicles)) {
      for (const vehicle of data.vehicles) {
        const { error: upsertError } = await supabaseClient
          .from('devices')
          .upsert({
            imei: vehicle.deviceNumber || vehicle.deviceId,
            name: vehicle.name || vehicle.vehicleName,
            owner_id: user.id,
            sim_iccid: vehicle.simNumber || 'unknown',
            model: vehicle.vehicleType || 'GISION MDVR',
            status: vehicle.onlineStatus === 1 ? 'online' : 'offline',
            last_seen: vehicle.onlineStatus === 1 ? new Date().toISOString() : null,
          }, {
            onConflict: 'imei',
          });

        if (upsertError) {
          console.error(`[CMSV6] Error syncing vehicle ${vehicle.deviceNumber}:`, upsertError);
        }
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
    console.error('[CMSV6] Vehicles fetch error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Failed to fetch vehicles',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
