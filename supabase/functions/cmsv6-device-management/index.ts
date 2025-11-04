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

    console.log(`[CMSV6] Device management action: ${action}`);

    let endpoint = '';
    const queryParams = new URLSearchParams();
    queryParams.append('jsession', jsession);

    switch (action) {
      case 'getDeviceInfo':
        endpoint = '/StandardApiAction_getDeviceInfo.action';
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        break;

      case 'addDevice':
        endpoint = '/StandardApiAction_addDevice.action';
        if (params.deviceNumber) queryParams.append('deviceNumber', params.deviceNumber);
        if (params.deviceType) queryParams.append('deviceType', params.deviceType);
        if (params.sim) queryParams.append('sim', params.sim);
        if (params.companyId) queryParams.append('companyId', params.companyId);
        break;

      case 'editDevice':
        endpoint = '/StandardApiAction_editDevice.action';
        if (params.devId) queryParams.append('devId', params.devId);
        if (params.deviceNumber) queryParams.append('deviceNumber', params.deviceNumber);
        if (params.sim) queryParams.append('sim', params.sim);
        break;

      case 'deleteDevice':
        endpoint = '/StandardApiAction_delDevice.action';
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        break;

      case 'addVehicle':
        endpoint = '/StandardApiAction_addVehicle.action';
        if (params.plate) queryParams.append('plate', params.plate);
        if (params.companyId) queryParams.append('companyId', params.companyId);
        if (params.carType) queryParams.append('carType', params.carType);
        break;

      case 'deleteVehicle':
        endpoint = '/StandardApiAction_delVehicle.action';
        if (params.vehiIdno) queryParams.append('vehiIdno', params.vehiIdno);
        break;

      case 'installVehicle':
        endpoint = '/StandardApiAction_installVehicle.action';
        if (params.vehiIdno) queryParams.append('vehiIdno', params.vehiIdno);
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        break;

      case 'uninstallDevice':
        endpoint = '/StandardApiAction_uninstallDevice.action';
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
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
    console.error('[CMSV6] Device management error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Device management operation failed',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
