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

    console.log(`[CMSV6] SIM management action: ${action}`);

    let endpoint = '';
    const queryParams = new URLSearchParams();
    queryParams.append('jsession', jsession);

    switch (action) {
      case 'add':
        endpoint = '/StandardApiAction_addSimCard.action';
        if (params.simNumber) queryParams.append('simNumber', params.simNumber);
        if (params.iccid) queryParams.append('iccid', params.iccid);
        if (params.operator) queryParams.append('operator', params.operator);
        if (params.companyId) queryParams.append('companyId', params.companyId);
        break;

      case 'find':
        endpoint = '/StandardApiAction_findSimCard.action';
        if (params.simNumber) queryParams.append('simNumber', params.simNumber);
        break;

      case 'delete':
        endpoint = '/StandardApiAction_deleteSimCard.action';
        if (params.simNumber) queryParams.append('simNumber', params.simNumber);
        break;

      case 'query':
        endpoint = '/StandardApiAction_loadSimCard.action';
        if (params.companyId) queryParams.append('companyId', params.companyId);
        if (params.currentPage) queryParams.append('currentPage', params.currentPage);
        if (params.pageRecords) queryParams.append('pageRecords', params.pageRecords);
        break;

      case 'unbind':
        endpoint = '/StandardApiAction_unbindSimCard.action';
        if (params.simNumber) queryParams.append('simNumber', params.simNumber);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const apiUrl = `${CMSV6_API_URL}${endpoint}?${queryParams.toString()}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.result !== 0) {
      throw new Error(data.description || `Failed to ${action} SIM card`);
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
    console.error('[CMSV6] SIM management error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'SIM management operation failed',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
