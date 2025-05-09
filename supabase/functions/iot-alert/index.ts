
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // Parse the request body
    const { device_id, alert_type, severity, latitude, longitude, data } = await req.json();

    // Validate required fields
    if (!device_id || !alert_type || !latitude || !longitude) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: device_id, alert_type, latitude, longitude" 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Find the device in the database
    const { data: deviceData, error: deviceError } = await supabaseClient
      .from("iot_devices")
      .select("id")
      .eq("device_id", device_id)
      .single();

    if (deviceError) {
      console.error("Error finding device:", deviceError);
      return new Response(
        JSON.stringify({ error: "Device not found", details: deviceError.message }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Format coordinates for PostgreSQL point type
    const locationPoint = `(${longitude},${latitude})`;

    // Create a device alert
    const { data: alertData, error: alertError } = await supabaseClient
      .from("device_alerts")
      .insert({
        device_id: deviceData.id,
        alert_type,
        severity: severity || 3, // Default to medium severity if not provided
        location: locationPoint,
        data: data || {}
      })
      .select()
      .single();

    if (alertError) {
      console.error("Error creating alert:", alertError);
      return new Response(
        JSON.stringify({ error: "Failed to create alert", details: alertError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Also update the device's location and last heartbeat
    await supabaseClient
      .from("iot_devices")
      .update({
        location: locationPoint,
        last_heartbeat: new Date().toISOString()
      })
      .eq("id", deviceData.id);

    // Return success response with the created alert
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Alert received and processed", 
        alert_id: alertData.id,
        emergency_id: alertData.emergency_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing IoT alert:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
