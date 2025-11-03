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
    const CMSV6_STREAM_PORT = Deno.env.get('CMSV6_STREAM_PORT') || '6604';

    if (!CMSV6_API_URL) {
      throw new Error('CMSV6 API URL not configured');
    }

    const { jsession, deviceId, channel = 0, streamType = 1 } = await req.json();

    if (!jsession || !deviceId) {
      throw new Error('CMSV6 session token and device ID required');
    }

    console.log(`[CMSV6] Getting live video for device: ${deviceId}, channel: ${channel}`);

    // Parse base URL to construct HLS stream URL
    // CMSV6 uses format: http://server:6604/hls/1_deviceId_channel_streamType.m3u8?jsession=xxx
    // requestType: 1=video
    // streamType: 0=main stream, 1=sub stream
    const baseUrl = new URL(CMSV6_API_URL);
    const streamUrl = `${baseUrl.protocol}//${baseUrl.hostname}:${CMSV6_STREAM_PORT}/hls/1_${deviceId}_${channel}_${streamType}.m3u8?jsession=${jsession}`;
    
    console.log('[CMSV6] Live video HLS URL generated:', streamUrl);

    // Update streams table with the video URL
    const { data: device } = await supabaseClient
      .from('devices')
      .select('id')
      .eq('imei', deviceId)
      .maybeSingle();

    if (device) {
      await supabaseClient
        .from('streams')
        .upsert({
          device_id: device.id,
          stream_url: streamUrl,
          stream_type: 'HLS',
          last_active: new Date().toISOString(),
        }, {
          onConflict: 'device_id',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        streamUrl: streamUrl,
        protocol: 'HLS',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[CMSV6] Live video error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Failed to get live video',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
