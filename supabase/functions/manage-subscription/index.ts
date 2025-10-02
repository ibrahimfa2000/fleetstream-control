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
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { action, deviceId, simIccid } = await req.json();
    console.log(`Managing subscription: ${action} for device ${deviceId}, SIM ${simIccid}`);

    // Verify device ownership
    const { data: device, error: deviceError } = await supabaseClient
      .from('devices')
      .select('*')
      .eq('id', deviceId)
      .eq('owner_id', user.id)
      .single();

    if (deviceError || !device) {
      throw new Error('Device not found or unauthorized');
    }

    // In production, this would call the actual SIM provider API
    // For now, we'll simulate the API call
    let providerStatus = 'success';
    let newStatus = action === 'activate' ? 'active' : 'suspended';

    // Simulate API call to SIM provider
    console.log(`Calling SIM provider API: ${action} for ${simIccid}`);
    // Example: await fetch('https://api.simprovider.com/v1/sims/${simIccid}/actions', { ... })
    
    // Update subscription in database
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('device_id', deviceId)
      .select()
      .single();

    if (subError) {
      console.error('Error updating subscription:', subError);
      throw new Error('Failed to update subscription');
    }

    // Update device status
    const deviceStatus = newStatus === 'active' ? 'online' : 'offline';
    await supabaseClient
      .from('devices')
      .update({ 
        status: deviceStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', deviceId);

    // Log the action
    console.log(`Subscription ${action}d successfully for device ${deviceId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Subscription ${action}d successfully`,
        subscription,
        providerStatus
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in manage-subscription:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Internal server error',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
