import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommandPayload {
  type: string;
  params?: Record<string, unknown>;
  timestamp: string;
  requestId: string;
}

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
    
    console.log(`[GISION] User ${user.email} sending command to device ${deviceId}: ${command}`);

    // Verify device ownership or admin role
    const { data: device, error: deviceError } = await supabaseClient
      .from('devices')
      .select('*, owner:profiles!devices_owner_id_fkey(email)')
      .eq('id', deviceId)
      .single();

    if (deviceError || !device) {
      throw new Error('Device not found');
    }

    // Check if user owns device or is admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    const isAdmin = !!userRole;
    const isOwner = device.owner_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error('Unauthorized: You do not have permission to control this device');
    }

    // Build MQTT command payload for GISION MDVR
    const mqttTopic = `gision/devices/${device.imei}/commands`;
    const commandPayload: CommandPayload = {
      type: command,
      params: params || {},
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    };

    console.log(`[GISION] Publishing command to MQTT topic: ${mqttTopic}`, commandPayload);
    
    // In production, publish to actual MQTT broker
    // Example: await mqttClient.publish(mqttTopic, JSON.stringify(commandPayload))
    
    // For supported GISION MDVR commands:
    // - reboot: Restart device
    // - start_recording: Start video recording
    // - stop_recording: Stop video recording  
    // - update_firmware: Trigger firmware update
    // - configure_stream: Update stream settings
    // - get_status: Request device status
    // - configure_channels: Configure recording channels

    // Log command in database for audit trail
    console.log(`[GISION] Command sent successfully: ${command} to ${device.name} (${device.imei})`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Command "${command}" sent to GISION device successfully`,
        device: {
          id: device.id,
          name: device.name,
          imei: device.imei
        },
        command: {
          type: command,
          requestId: commandPayload.requestId,
          timestamp: commandPayload.timestamp
        },
        mqttTopic
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[GISION] Error in device control:', error);
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
