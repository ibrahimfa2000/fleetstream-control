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

    console.log(`[CMSV6] Driver management action: ${action}`);

    let endpoint = '';
    const queryParams = new URLSearchParams();
    queryParams.append('jsession', jsession);

    switch (action) {
      case 'findByDeviceId':
        endpoint = '/StandardApiAction_findDriverInfoByDeviceId.action';
        if (params.deviceId) queryParams.append('deviceId', params.deviceId);
        break;

      case 'findVehicleByDeviceId':
        endpoint = '/StandardApiAction_findVehicleInfoByDeviceId.action';
        if (params.deviceId) queryParams.append('deviceId', params.deviceId);
        break;

      case 'findByLicense':
        endpoint = '/StandardApiAction_findVehicleInfoByDeviceJn.action';
        if (params.jn) queryParams.append('jn', params.jn);
        break;

      case 'queryPunchDetail':
        endpoint = '/StandardApiAction_queryDriverPunchDetail.action';
        if (params.deviceId) queryParams.append('deviceId', params.deviceId);
        if (params.begintime) queryParams.append('begintime', params.begintime);
        if (params.endtime) queryParams.append('endtime', params.endtime);
        break;

      case 'queryAlarm':
        endpoint = '/StandardApiAction_queryIdentifyAlarm.action';
        if (params.deviceId) queryParams.append('deviceId', params.deviceId);
        if (params.begintime) queryParams.append('begintime', params.begintime);
        if (params.endtime) queryParams.append('endtime', params.endtime);
        break;

      case 'list':
        endpoint = '/StandardApiAction_qureyDriverList.action';
        if (params.companyId) queryParams.append('companyId', params.companyId);
        if (params.currentPage) queryParams.append('currentPage', params.currentPage);
        if (params.pageRecords) queryParams.append('pageRecords', params.pageRecords);
        break;

      case 'add':
        endpoint = '/StandardApiAction_addDriver.action';
        if (params.driverName) queryParams.append('driverName', encodeURIComponent(params.driverName));
        if (params.licenseNumber) queryParams.append('licenseNumber', params.licenseNumber);
        if (params.phone) queryParams.append('phone', params.phone);
        if (params.companyId) queryParams.append('companyId', params.companyId);
        break;

      case 'find':
        endpoint = '/StandardApiAction_findDriver.action';
        if (params.driverId) queryParams.append('driverId', params.driverId);
        break;

      case 'delete':
        endpoint = '/StandardApiAction_deleteDriver.action';
        if (params.driverId) queryParams.append('driverId', params.driverId);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const apiUrl = `${CMSV6_API_URL}${endpoint}?${queryParams.toString()}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.result !== 0) {
      throw new Error(data.description || `Failed to ${action} driver`);
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
