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

    console.log(`[CMSV6] Safety business action: ${action}`);

    let apiUrl = '';
    const queryParams = new URLSearchParams();
    queryParams.append('jsession', jsession);

    switch (action) {
      case 'securityEvidence':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_performanceReportPhotoListSafe.action`;
        if (params.vehiIdno) queryParams.append('vehiIdno', params.vehiIdno);
        if (params.begintime) queryParams.append('begintime', params.begintime);
        if (params.endtime) queryParams.append('endtime', params.endtime);
        if (params.alarmType) queryParams.append('alarmType', params.alarmType);
        if (params.mediaType !== undefined) queryParams.append('mediaType', params.mediaType);
        if (params.toMap) queryParams.append('toMap', params.toMap);
        if (params.currentPage) queryParams.append('currentPage', params.currentPage);
        if (params.pageRecords) queryParams.append('pageRecords', params.pageRecords);
        break;

      case 'evidenceQuery':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_alarmEvidence.action`;
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        if (params.guid) queryParams.append('guid', params.guid);
        if (params.alarmType) queryParams.append('alarmType', params.alarmType);
        if (params.begintime) queryParams.append('begintime', params.begintime);
        if (params.toMap) queryParams.append('toMap', params.toMap);
        if (params.md5) queryParams.append('md5', params.md5);
        break;

      case 'resourceCatalogSummary':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_resourceCatalogSummary.action`;
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        if (params.begintime) queryParams.append('begintime', params.begintime);
        if (params.endtime) queryParams.append('endtime', params.endtime);
        break;

      case 'resourceCatalogDetail':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_resourceCatalogDetail.action`;
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        if (params.begintime) queryParams.append('begintime', params.begintime);
        if (params.endtime) queryParams.append('endtime', params.endtime);
        if (params.currentPage) queryParams.append('currentPage', params.currentPage);
        if (params.pageRecords) queryParams.append('pageRecords', params.pageRecords);
        break;

      case 'pictureQuery':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_pictureQuery.action`;
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        if (params.channel) queryParams.append('channel', params.channel);
        if (params.begintime) queryParams.append('begintime', params.begintime);
        if (params.endtime) queryParams.append('endtime', params.endtime);
        if (params.alarmType) queryParams.append('alarmType', params.alarmType);
        if (params.currentPage) queryParams.append('currentPage', params.currentPage);
        if (params.pageRecords) queryParams.append('pageRecords', params.pageRecords);
        break;

      case 'audioVideoQuery':
        apiUrl = `${CMSV6_API_URL}/StandardApiAction_audioAndVideoQuery.action`;
        if (params.devIdno) queryParams.append('devIdno', params.devIdno);
        if (params.channel) queryParams.append('channel', params.channel);
        if (params.begintime) queryParams.append('begintime', params.begintime);
        if (params.endtime) queryParams.append('endtime', params.endtime);
        if (params.alarmType) queryParams.append('alarmType', params.alarmType);
        if (params.streamType) queryParams.append('streamType', params.streamType);
        if (params.currentPage) queryParams.append('currentPage', params.currentPage);
        if (params.pageRecords) queryParams.append('pageRecords', params.pageRecords);
        break;

      default:
        throw new Error(`Unknown safety business action: ${action}`);
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
      throw new Error(data.description || `Safety business ${action} failed`);
    }

    console.log(`[CMSV6] Safety business ${action} completed successfully`);

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
    console.error('[CMSV6] Safety business error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Safety business operation failed',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
