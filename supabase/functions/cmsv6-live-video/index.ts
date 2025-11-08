import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jsession, deviceId, channel = 0, streamType = 1 } = await req.json();
    if (!jsession || !deviceId) throw new Error("Missing jsession or deviceId");

    const CMSV6_API_URL = Deno.env.get("CMSV6_API_URL") || "http://57.131.13.157";
    const CMSV6_STREAM_PORT = Deno.env.get("CMSV6_STREAM_PORT") || "6604";

    // ✅ Correct CMSV6 stream URL format
    const streamUrl = `${CMSV6_API_URL}:${CMSV6_STREAM_PORT}/3/3?AVType=1&jsession=${jsession}&DevIDNO=${deviceId}&Channel=${channel}&Stream=${streamType}`;

    console.log("[CMSV6] RTMP/FLV stream URL:", streamUrl);

    return new Response(
      JSON.stringify({
        success: true,
        streamUrl,
        protocol: "FLV",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (err) {
    console.error("[CMSV6] Live video error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
