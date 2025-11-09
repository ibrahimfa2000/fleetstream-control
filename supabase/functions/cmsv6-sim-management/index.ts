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

    let apiUrl = '';
    const queryParams = new URLSearchParams();
    queryParams.append('jsession', jsession);

    console.log(`[CMSV6] SIM Management action: ${action}`);

    switch (action) {
      case 'merge':
        // Add or update SIM
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_mergeSIMInfo.action`;
        if (params.id) queryParams.append('id', params.id);
        if (params.cardNum) queryParams.append('cardNum', params.cardNum);
        if (params.companyName) queryParams.append('companyName', params.companyName);
        if (params.registrationTime) queryParams.append('registrationTime', params.registrationTime);
        if (params.status !== undefined) queryParams.append('status', params.status);
        if (params.remark) queryParams.append('remark', params.remark);
        if (params.city) queryParams.append('city', params.city);
        if (params.operator) queryParams.append('operator', params.operator);
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        break;

      case 'find':
        // Find SIM by ID
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_findSIMInfo.action`;
        if (params.id) queryParams.append('id', params.id);
        break;

      case 'delete':
        // Delete SIM
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_deleteSIMInfo.action`;
        if (params.id) queryParams.append('id', params.id);
        break;

      case 'list':
        // Load SIM list (paged)
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_loadSIMInfos.action`;
        if (params.currentPage) queryParams.append('currentPage', params.currentPage);
        if (params.pageRecords) queryParams.append('pageRecords', params.pageRecords);
        break;

      case 'unbind':
        // Unbind SIM
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_unbindingSIM.action`;
        if (params.flag !== undefined) queryParams.append('flag', params.flag);
        if (params.id) queryParams.append('id', params.id);
        break;

      default:
        throw new Error(`Unknown SIM management action: ${action}`);
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
      throw new Error(data.description || `SIM ${action} failed`);
    }

    console.log(`[CMSV6] SIM ${action} completed successfully`);

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
