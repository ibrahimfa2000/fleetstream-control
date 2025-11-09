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

    const { jsession, action, params } = await req.json();

    if (!jsession) {
      throw new Error('CMSV6 session token required');
    }

    const CMSV6_API_URL = Deno.env.get('CMSV6_API_URL');
    if (!CMSV6_API_URL) {
      throw new Error('CMSV6 API URL not configured');
    }

    console.log(`[CMSV6] Area management action: ${action}`);

    let apiUrl = '';
    const queryParams = new URLSearchParams();
    queryParams.append('jsession', jsession);

    switch (action) {
      case 'list':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_areaAll.action`;
        break;

      case 'add':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_saveArea.action`;
        if (params.nm) queryParams.append('nm', params.nm);
        if (params.tp) queryParams.append('tp', params.tp);
        if (params.pts) queryParams.append('pts', params.pts);
        if (params.speed) queryParams.append('speed', params.speed);
        if (params.time) queryParams.append('time', params.time);
        break;

      case 'modify':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_updateArea.action`;
        if (params.id) queryParams.append('id', params.id);
        if (params.nm) queryParams.append('nm', params.nm);
        if (params.tp) queryParams.append('tp', params.tp);
        if (params.pts) queryParams.append('pts', params.pts);
        if (params.speed) queryParams.append('speed', params.speed);
        if (params.time) queryParams.append('time', params.time);
        break;

      case 'view':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_findArea.action`;
        if (params.id) queryParams.append('id', params.id);
        break;

      case 'delete':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_delArea.action`;
        if (params.id) queryParams.append('id', params.id);
        break;

      default:
        throw new Error(`Unknown area management action: ${action}`);
    }

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMSV6 API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.result !== 0) {
      throw new Error(data.description || `Area ${action} failed`);
    }

    console.log(`[CMSV6] Area ${action} completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[CMSV6] Area management error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Area management operation failed',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
