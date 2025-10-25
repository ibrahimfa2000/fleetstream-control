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

    const { imei, stream_url, stream_type, action } = await req.json();
    
    console.log(`[ApexAuto] Stream ${action} for device IMEI: ${imei}`);

    // Find device by IMEI
    const { data: device, error: deviceError } = await supabaseClient
      .from('devices')
      .select('id, name')
      .eq('imei', imei)
      .single();

    if (deviceError || !device) {
      console.error(`[ApexAuto] Device not found: ${imei}`, deviceError);
      throw new Error('Device not found');
    }

    if (action === 'register' || action === 'update') {
      // Upsert stream information
      const { data: stream, error: streamError } = await supabaseClient
        .from('streams')
        .upsert({
          device_id: device.id,
          stream_url: stream_url,
          stream_type: stream_type || 'HLS',
          last_active: new Date().toISOString(),
        }, {
          onConflict: 'device_id'
        })
        .select()
        .single();

      if (streamError) {
        console.error('[ApexAuto] Error upserting stream:', streamError);
        throw streamError;
      }

      console.log(`[ApexAuto] Stream ${action}ed for device ${device.name} (${imei})`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Stream ${action}ed successfully`,
          stream
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else if (action === 'deactivate') {
      // Mark stream as inactive
      const { error: deactivateError } = await supabaseClient
        .from('streams')
        .update({ last_active: null })
        .eq('device_id', device.id);

      if (deactivateError) {
        console.error('[ApexAuto] Error deactivating stream:', deactivateError);
        throw deactivateError;
      }

      console.log(`[ApexAuto] Stream deactivated for device ${device.name} (${imei})`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Stream deactivated successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else {
      throw new Error('Invalid action. Use: register, update, or deactivate');
    }

  } catch (error) {
    console.error('[ApexAuto] Error in stream manager:', error);
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
