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

    const { imei, telemetry } = await req.json();
    
    console.log(`[GISION] Processing telemetry for device IMEI: ${imei}`);

    // Find device by IMEI
    const { data: device, error: deviceError } = await supabaseClient
      .from('devices')
      .select('id, status')
      .eq('imei', imei)
      .single();

    if (deviceError || !device) {
      console.error(`[GISION] Device not found: ${imei}`, deviceError);
      throw new Error('Device not found');
    }

    // Insert telemetry data
    const telemetryData = {
      device_id: device.id,
      signal_strength: telemetry.signal_strength || null,
      battery_level: telemetry.battery_level || null,
      storage_free_mb: telemetry.storage_free_mb || null,
      data_usage_mb: telemetry.data_usage_mb || null,
      gps_lat: telemetry.gps_lat || null,
      gps_lon: telemetry.gps_lon || null,
      timestamp: telemetry.timestamp || new Date().toISOString(),
    };

    const { error: telemetryError } = await supabaseClient
      .from('telemetry')
      .insert(telemetryData);

    if (telemetryError) {
      console.error('[GISION] Error inserting telemetry:', telemetryError);
      throw telemetryError;
    }

    // Update device last_seen and status
    const { error: updateError } = await supabaseClient
      .from('devices')
      .update({ 
        last_seen: new Date().toISOString(),
        status: 'online'
      })
      .eq('id', device.id);

    if (updateError) {
      console.error('[GISION] Error updating device:', updateError);
    }

    console.log(`[GISION] Telemetry processed successfully for device ${imei}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Telemetry data synchronized',
        device_id: device.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[GISION] Error in telemetry sync:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Internal server error',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
