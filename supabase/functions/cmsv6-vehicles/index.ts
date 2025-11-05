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
        const deviceImei = vehicle.deviceNumber || vehicle.deviceId || vehicle.devIdno;
        
        // Skip if no valid IMEI/device ID
        if (!deviceImei) {
          console.error(`[CMSV6] Skipping vehicle with no deviceNumber/deviceId:`, vehicle);
          continue;
        }
        
        // Check if device already exists
        const { data: existingDevice } = await supabaseClient
          .from('devices')
          .select('id, owner_id')
          .eq('imei', deviceImei)
          .maybeSingle();

        if (existingDevice) {
          // Update only non-ownership fields for existing devices
          const { error: updateError } = await supabaseClient
            .from('devices')
            .update({
              name: vehicle.name || vehicle.vehicleName,
              sim_iccid: vehicle.simNumber || 'unknown',
              model: vehicle.vehicleType || 'GISION MDVR',
              status: vehicle.onlineStatus === 1 ? 'online' : 'offline',
              last_seen: vehicle.onlineStatus === 1 ? new Date().toISOString() : null,
            })
            .eq('id', existingDevice.id);

          if (updateError) {
            console.error(`[CMSV6] Error updating vehicle ${deviceImei}:`, updateError);
          }
        } else {
          // Create new device with current user as owner
          const { error: insertError } = await supabaseClient
            .from('devices')
            .insert({
              imei: deviceImei,
              name: vehicle.name || vehicle.vehicleName,
              owner_id: user.id,
              sim_iccid: vehicle.simNumber || 'unknown',
              model: vehicle.vehicleType || 'GISION MDVR',
              status: vehicle.onlineStatus === 1 ? 'online' : 'offline',
              last_seen: vehicle.onlineStatus === 1 ? new Date().toISOString() : null,
            });

          if (insertError) {
            console.error(`[CMSV6] Error creating vehicle ${deviceImei}:`, insertError);
          }
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
