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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }
    const CMSV6_API_URL = Deno.env.get('CMSV6_API_URL');
    const CMSV6_API_ACCOUNT = Deno.env.get('CMSV6_API_ACCOUNT');
    const CMSV6_API_PASSWORD = Deno.env.get('CMSV6_API_PASSWORD');

    if (!CMSV6_API_URL || !CMSV6_API_ACCOUNT || !CMSV6_API_PASSWORD) {
      throw new Error('CMSV6 API credentials not configured');
    }

    // Validate URL format
    try {
      new URL(CMSV6_API_URL);
    } catch {
      throw new Error(`Invalid CMSV6_API_URL format. Expected: http://your-server:port or https://your-domain. Got: ${CMSV6_API_URL}`);
    }

    console.log('[CMSV6] Attempting login to CMSV6 API...');

    // Login to CMSV6 API
    const loginUrl = `${CMSV6_API_URL}/StandardApiAction_login.action?account=${CMSV6_API_ACCOUNT}&password=${CMSV6_API_PASSWORD}`;
    
    const response = await fetch(loginUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMSV6 login failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('[CMSV6] Login successful');

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        jsession: data.jsession || null,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[CMSV6] Login error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'CMSV6 login failed',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
