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

    console.log(`[CMSV6] Driver management action: ${action}`);

    let apiUrl = '';
    const queryParams = new URLSearchParams();
    queryParams.append('jsession', jsession);

    switch (action) {
      case 'list':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_driverList.action`;
        if (params.currentPage) queryParams.append('currentPage', params.currentPage);
        if (params.pageRecords) queryParams.append('pageRecords', params.pageRecords);
        break;

      case 'add':
      case 'modify':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_mergeDriver.action`;
        if (params.id) queryParams.append('id', params.id);
        if (params.name) queryParams.append('name', params.name);
        if (params.IDCard) queryParams.append('IDCard', params.IDCard);
        if (params.licenseNum) queryParams.append('licenseNum', params.licenseNum);
        if (params.phone) queryParams.append('phone', params.phone);
        if (params.address) queryParams.append('address', params.address);
        if (params.qualification) queryParams.append('qualification', params.qualification);
        break;

      case 'find':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_findDriver.action`;
        if (params.id) queryParams.append('id', params.id);
        break;

      case 'delete':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_deleteDriver.action`;
        if (params.id) queryParams.append('id', params.id);
        break;

      case 'queryByDevice':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_driverByDevNo.action`;
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        break;

      case 'queryByCard':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_driverByInfo.action`;
        if (params.qualification) queryParams.append('qualification', params.qualification);
        if (params.licenseNum) queryParams.append('licenseNum', params.licenseNum);
        break;

      case 'punchRecords':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_clockRecordList.action`;
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        if (params.begintime) queryParams.append('begintime', params.begintime);
        if (params.endtime) queryParams.append('endtime', params.endtime);
        if (params.currentPage) queryParams.append('currentPage', params.currentPage);
        if (params.pageRecords) queryParams.append('pageRecords', params.pageRecords);
        break;

      case 'identifyAlarms':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_identifyAlarm.action`;
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        if (params.begintime) queryParams.append('begintime', params.begintime);
        if (params.endtime) queryParams.append('endtime', params.endtime);
        if (params.currentPage) queryParams.append('currentPage', params.currentPage);
        if (params.pageRecords) queryParams.append('pageRecords', params.pageRecords);
        break;

      default:
        throw new Error(`Unknown driver management action: ${action}`);
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
      throw new Error(data.description || `Driver ${action} failed`);
    }

    console.log(`[CMSV6] Driver ${action} completed successfully`);

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
    console.error('[CMSV6] Driver management error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Driver management operation failed',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
