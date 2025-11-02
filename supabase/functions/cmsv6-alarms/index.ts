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

    const { jsession, deviceId, startTime, endTime } = await req.json();

    if (!jsession || !deviceId) {
      throw new Error('CMSV6 session token and device ID required');
    }

    console.log(`[CMSV6] Getting alarms for device: ${deviceId}`);

    // Get device alarms from CMSV6 API
    let alarmUrl = `${CMSV6_API_URL}/StandardApiAction_getAlarm.action?jsession=${jsession}&devIdno=${deviceId}`;
    
    if (startTime) {
      alarmUrl += `&startTime=${startTime}`;
    }
    if (endTime) {
      alarmUrl += `&endTime=${endTime}`;
    }
    
    const response = await fetch(alarmUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMSV6 API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('[CMSV6] Alarms retrieved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        alarms: data.alarms || [],
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[CMSV6] Alarms fetch error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Failed to fetch alarms',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
