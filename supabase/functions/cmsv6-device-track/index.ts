import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    const { jsession, deviceId} = await req.json();
    if (!jsession || !deviceId) {
      throw new Error('Session token, device ID are required');
    }
    const CMSV6_API_URL = Deno.env.get('CMSV6_API_URL');
    if (!CMSV6_API_URL) {
      throw new Error('CMSV6 API URL not configured');
    }
    console.log(`[CMSV6] Getting device track for: ${deviceId}`);
    const trackUrl = new URL('/StandardApiAction_getDeviceStatus.action', CMSV6_API_URL);
    trackUrl.searchParams.append('jsession', jsession);
    trackUrl.searchParams.append('DevIDNO', deviceId);
    const response = await fetch(trackUrl.toString());
    const data = await response.json();
    if (data.result !== 0) {
      throw new Error(data.description || 'Failed to get device track');
    }
    return new Response(JSON.stringify({
      success: true,
      track: data || []
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('[CMSV6] Device track error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to get device track',
      success: false
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
