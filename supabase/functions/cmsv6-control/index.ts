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

    const { jsession, deviceId, command, params = {} } = await req.json();

    if (!jsession || !deviceId || !command) {
      throw new Error('CMSV6 session token, device ID, and command required');
    }

    console.log(`[CMSV6] Sending command to device: ${deviceId}, command: ${command}`);

    let commandUrl = '';
    let commandParams = new URLSearchParams({
      jsession,
      devIdno: deviceId,
    });

    // Map commands to CMSV6 API endpoints
    switch (command) {
      case 'ptz_control':
        commandUrl = `${CMSV6_API_URL}/StandardApiAction_ptzControl.action`;
        commandParams.append('channel', params.channel || '0');
        commandParams.append('command', params.ptzCommand || '1');
        commandParams.append('param1', params.param1 || '5');
        break;
      
      case 'location_interval':
        commandUrl = `${CMSV6_API_URL}/StandardApiAction_setPositionInterval.action`;
        commandParams.append('interval', params.interval || '30');
        break;
      
      case 'send_text':
        commandUrl = `${CMSV6_API_URL}/StandardApiAction_distributeMsg.action`;
        commandParams.append('message', params.message || '');
        break;
      
      case 'device_control':
        commandUrl = `${CMSV6_API_URL}/StandardApiAction_deviceControl.action`;
        commandParams.append('controlType', params.controlType || '1');
        commandParams.append('controlParam', params.controlParam || '');
        break;
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    const fullUrl = `${commandUrl}?${commandParams.toString()}`;
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMSV6 API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('[CMSV6] Command sent successfully');

    // Log command to our database
    const { data: device } = await supabaseClient
      .from('devices')
      .select('id')
      .eq('imei', deviceId)
      .maybeSingle();

    if (device) {
      await supabaseClient
        .from('device_commands')
        .insert({
          device_id: device.id,
          sent_by: user.id,
          command_type: command,
          mqtt_topic: `cmsv6/${deviceId}/${command}`,
          mdvr_message: JSON.stringify(params),
          status: data.result === 0 ? 'delivered' : 'failed',
          response_message: JSON.stringify(data),
        });
    }

    return new Response(
      JSON.stringify({
        success: data.result === 0,
        data: data,
        message: data.reason || 'Command sent successfully',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[CMSV6] Control error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Failed to send command',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
