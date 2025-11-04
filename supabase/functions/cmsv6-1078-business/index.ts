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
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { jsession, action, ...params } = await req.json();

    if (!jsession || !action) {
      throw new Error('Session token and action required');
    }

    const CMSV6_API_URL = Deno.env.get('CMSV6_API_URL');
    if (!CMSV6_API_URL) {
      throw new Error('CMSV6 API URL not configured');
    }

    console.log(`[CMSV6] 1078 business action: ${action}`);

    let endpoint = '';
    const queryParams = new URLSearchParams();
    queryParams.append('jsession', jsession);

    switch (action) {
      case 'queryMediaTraffic':
        endpoint = '/StandardApiAction_queryMediaTraffic.action';
        if (params.startTime) queryParams.append('startTime', params.startTime);
        if (params.endTime) queryParams.append('endTime', params.endTime);
        if (params.userId) queryParams.append('userId', params.userId);
        break;

      case 'catalogSummary':
        endpoint = '/StandardApiAction_catalogSummary.action';
        if (params.deviceId) queryParams.append('deviceId', params.deviceId);
        if (params.startTime) queryParams.append('startTime', params.startTime);
        if (params.endTime) queryParams.append('endTime', params.endTime);
        break;

      case 'catalogDetail':
        endpoint = '/StandardApiAction_catalogDetail.action';
        if (params.deviceId) queryParams.append('deviceId', params.deviceId);
        if (params.channel) queryParams.append('channel', params.channel);
        if (params.startTime) queryParams.append('startTime', params.startTime);
        if (params.endTime) queryParams.append('endTime', params.endTime);
        if (params.alarmType) queryParams.append('alarmType', params.alarmType);
        if (params.mediaType) queryParams.append('mediaType', params.mediaType);
        break;

      case 'queryPhoto':
        endpoint = '/StandardApiAction_queryPhoto.action';
        if (params.deviceId) queryParams.append('deviceId', params.deviceId);
        if (params.channel) queryParams.append('channel', params.channel);
        if (params.startTime) queryParams.append('startTime', params.startTime);
        if (params.endTime) queryParams.append('endTime', params.endTime);
        if (params.alarmType) queryParams.append('alarmType', params.alarmType);
        break;

      case 'queryAudioOrVideo':
        endpoint = '/StandardApiAction_queryAudioOrVideo.action';
        if (params.deviceId) queryParams.append('deviceId', params.deviceId);
        if (params.channel) queryParams.append('channel', params.channel);
        if (params.startTime) queryParams.append('startTime', params.startTime);
        if (params.endTime) queryParams.append('endTime', params.endTime);
        if (params.alarmType) queryParams.append('alarmType', params.alarmType);
        if (params.mediaType) queryParams.append('mediaType', params.mediaType);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const apiUrl = `${CMSV6_API_URL}${endpoint}?${queryParams.toString()}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.result !== 0) {
      throw new Error(data.description || `Failed to ${action}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[CMSV6] 1078 business error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '1078 business operation failed',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
