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

    console.log(`[CMSV6] User management action: ${action}`);

    let endpoint = '';
    const queryParams = new URLSearchParams();
    queryParams.append('jsession', jsession);

    switch (action) {
      case 'add':
        endpoint = '/StandardApiAction_addAccount.action';
        if (params.account) queryParams.append('account', params.account);
        if (params.pwd) queryParams.append('pwd', params.pwd);
        if (params.companyId) queryParams.append('companyId', params.companyId);
        if (params.roleId) queryParams.append('roleId', params.roleId);
        if (params.userName) queryParams.append('userName', encodeURIComponent(params.userName));
        if (params.phone) queryParams.append('phone', params.phone);
        break;

      case 'find':
        endpoint = '/StandardApiAction_findAccount.action';
        if (params.companyId) queryParams.append('companyId', params.companyId);
        break;

      case 'delete':
        endpoint = '/StandardApiAction_deleteAccount.action';
        if (params.accountId) queryParams.append('accountId', params.accountId);
        break;

      case 'getAuthorization':
        endpoint = '/StandardApiAction_getAuthorization.action';
        if (params.accountId) queryParams.append('accountId', params.accountId);
        break;

      case 'addAuthorization':
        endpoint = '/StandardApiAction_addAuthorization.action';
        if (params.accountId) queryParams.append('accountId', params.accountId);
        if (params.devIdnos) queryParams.append('devIdnos', params.devIdnos);
        break;

      case 'deleteAuthorization':
        endpoint = '/StandardApiAction_deleteAuthorization.action';
        if (params.accountId) queryParams.append('accountId', params.accountId);
        if (params.devIdnos) queryParams.append('devIdnos', params.devIdnos);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const apiUrl = `${CMSV6_API_URL}${endpoint}?${queryParams.toString()}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.result !== 0) {
      throw new Error(data.description || `Failed to ${action} user`);
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
    console.error('[CMSV6] User management error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'User management operation failed',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
