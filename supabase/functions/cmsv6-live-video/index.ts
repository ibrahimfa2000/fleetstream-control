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

    const { jsession, deviceId, channel = 0, streamType = 1 } = await req.json();

    if (!jsession || !deviceId) {
      throw new Error('CMSV6 session token and device ID required');
    }

    console.log(`[CMSV6] Getting live video for device: ${deviceId}, channel: ${channel}`);

    // Get live video stream from CMSV6 API
    // streamType: 0=main stream, 1=sub stream
    const videoUrl = `${CMSV6_API_URL}/StandardApiAction_video.action?jsession=${jsession}&devIdno=${deviceId}&channel=${channel}&streamType=${streamType}`;
    
    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMSV6 API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('[CMSV6] Live video URL retrieved');

    // Update streams table with the video URL
    if (data.result === 0 && data.url) {
      const { data: device } = await supabaseClient
        .from('devices')
        .select('id')
        .eq('imei', deviceId)
        .single();

      if (device) {
        await supabaseClient
          .from('streams')
          .upsert({
            device_id: device.id,
            stream_url: data.url,
            stream_type: data.protocol || 'HLS',
            last_active: new Date().toISOString(),
          }, {
            onConflict: 'device_id',
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        streamUrl: data.url || null,
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
