import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MQTTMessage {
  device_id: string;
  topic: string;
  payload: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const message: MQTTMessage = await req.json();
    console.log('Received MQTT message:', message);

    // Handle different topic types
    if (message.topic.includes('/telemetry')) {
      // Store telemetry data
      const { error } = await supabaseClient
        .from('telemetry')
        .insert({
          device_id: message.device_id,
          battery_level: message.payload.battery_level,
          signal_strength: message.payload.signal_strength,
          gps_lat: message.payload.gps_lat,
          gps_lon: message.payload.gps_lon,
          storage_free_mb: message.payload.storage_free_mb,
          data_usage_mb: message.payload.data_usage_mb,
        });

      if (error) {
        console.error('Error storing telemetry:', error);
        throw error;
      }

      // Update device last_seen
      await supabaseClient
        .from('devices')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', message.device_id);

    } else if (message.topic.includes('/status')) {
      // Update device status
      await supabaseClient
        .from('devices')
        .update({ 
          status: message.payload.status,
          last_seen: new Date().toISOString()
        })
        .eq('id', message.device_id);

    } else if (message.topic.includes('/stream')) {
      // Handle stream URL updates
      const { data: existingStream } = await supabaseClient
        .from('streams')
        .select('*')
        .eq('device_id', message.device_id)
        .maybeSingle();

      if (existingStream) {
        await supabaseClient
          .from('streams')
          .update({
            stream_url: message.payload.stream_url,
            stream_type: message.payload.stream_type,
            last_active: new Date().toISOString()
          })
          .eq('device_id', message.device_id);
      } else {
        await supabaseClient
          .from('streams')
          .insert({
            device_id: message.device_id,
            stream_url: message.payload.stream_url,
            stream_type: message.payload.stream_type,
            last_active: new Date().toISOString()
          });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing MQTT message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});