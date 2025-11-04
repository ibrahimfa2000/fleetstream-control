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

    const { jsession, vehiIdno, begintime, endtime, currentPage, pageRecords } = await req.json();

    if (!jsession || !vehiIdno || !begintime || !endtime) {
      throw new Error('Session token, vehicle ID, begin time, and end time required');
    }

    const CMSV6_API_URL = Deno.env.get('CMSV6_API_URL');
    if (!CMSV6_API_URL) {
      throw new Error('CMSV6 API URL not configured');
    }

    console.log(`[CMSV6] Getting vehicle mileage for: ${vehiIdno}, period: ${begintime} to ${endtime}`);

    const mileageUrl = new URL('/StandardApiAction_runMileage.action', CMSV6_API_URL);
    mileageUrl.searchParams.append('jsession', jsession);
    mileageUrl.searchParams.append('vehiIdno', vehiIdno);
    mileageUrl.searchParams.append('begintime', begintime);
    mileageUrl.searchParams.append('endtime', endtime);
    
    if (currentPage) mileageUrl.searchParams.append('currentPage', currentPage.toString());
    if (pageRecords) mileageUrl.searchParams.append('pageRecords', pageRecords.toString());

    const response = await fetch(mileageUrl.toString());
    const data = await response.json();

    if (data.result !== 0) {
      throw new Error(data.description || 'Failed to get vehicle mileage');
    }

    return new Response(
      JSON.stringify({
        success: true,
        mileage: data.infos || [],
        pagination: data.pagination || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[CMSV6] Vehicle mileage error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to get vehicle mileage',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
