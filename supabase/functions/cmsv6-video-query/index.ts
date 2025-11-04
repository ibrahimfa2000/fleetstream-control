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

    const { 
      jsession, 
      deviceId, 
      channel = 0, 
      streamType = 0, 
      begintime, 
      endtime,
      alarmType = 0,
      currentPage = 1,
      pageRecords = 50
    } = await req.json();

    if (!jsession || !deviceId || !begintime || !endtime) {
      throw new Error('Session token, device ID, begin time, and end time required');
    }

    const CMSV6_API_URL = Deno.env.get('CMSV6_API_URL');
    if (!CMSV6_API_URL) {
      throw new Error('CMSV6 API URL not configured');
    }

    console.log(`[CMSV6] Querying video files for device: ${deviceId}, channel: ${channel}`);

    const queryUrl = new URL('/StandardApiAction_queryVideo.action', CMSV6_API_URL);
    queryUrl.searchParams.append('jsession', jsession);
    queryUrl.searchParams.append('devIdno', deviceId);
    queryUrl.searchParams.append('channel', channel.toString());
    queryUrl.searchParams.append('streamType', streamType.toString());
    queryUrl.searchParams.append('startTime', begintime);
    queryUrl.searchParams.append('endTime', endtime);
    queryUrl.searchParams.append('alarmType', alarmType.toString());
    queryUrl.searchParams.append('currentPage', currentPage.toString());
    queryUrl.searchParams.append('pageRecords', pageRecords.toString());

    const response = await fetch(queryUrl.toString());
    const data = await response.json();

    if (data.result !== 0) {
      throw new Error(data.description || 'Failed to query video files');
    }

    return new Response(
      JSON.stringify({
        success: true,
        videos: data.infos || [],
        pagination: data.pagination || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[CMSV6] Video query error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to query video files',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
