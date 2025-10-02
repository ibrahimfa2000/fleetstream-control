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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { deviceId, command, params } = await req.json();
    console.log(`Sending command to device ${deviceId}: ${command}`, params);

    // Verify device ownership
    const { data: device, error: deviceError } = await supabaseClient
      .from('devices')
      .select('*')
      .eq('id', deviceId)
      .eq('owner_id', user.id)
      .single();

    if (deviceError || !device) {
      throw new Error('Device not found or unauthorized');
    }

    // In production, this would publish to MQTT broker
    // For now, we'll simulate the command
    const mqttTopic = `devices/${device.imei}/cmd`;
    const commandPayload = {
      type: command,
      params: params || {},
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    };

    console.log(`Publishing to MQTT topic: ${mqttTopic}`, commandPayload);
    // Example: await mqttClient.publish(topic, JSON.stringify(payload))

    // Log command for audit
    const commandLog = {
      device_id: deviceId,
      command_type: command,
      command_params: params,
      sent_by: user.id,
      sent_at: new Date().toISOString(),
      status: 'sent'
    };

    console.log('Command sent successfully:', commandLog);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Command "${command}" sent to device successfully`,
        commandLog,
        mqttTopic
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-device-command:', error);
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
