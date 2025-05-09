
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to calculate distance between two points
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Helper function to parse PostgreSQL point type
const parsePoint = (point: string): { latitude: number; longitude: number } | null => {
  if (!point) return null;
  
  const match = point.match(/\((-?\d+\.?\d*),(-?\d+\.?\d*)\)/);
  if (match) {
    return {
      longitude: parseFloat(match[1]),
      latitude: parseFloat(match[2])
    };
  }
  return null;
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
    const { emergency_id } = await req.json();
    
    if (!emergency_id) {
      return new Response(
        JSON.stringify({ error: "Emergency ID is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Get the emergency details
    const { data: emergency, error: emergencyError } = await supabaseClient
      .from("emergencies")
      .select("*")
      .eq("id", emergency_id)
      .single();
      
    if (emergencyError) {
      return new Response(
        JSON.stringify({ error: "Emergency not found", details: emergencyError.message }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Get the emergency location coordinates
    const emergencyCoordinates = parsePoint(emergency.coordinates);
    if (!emergencyCoordinates) {
      return new Response(
        JSON.stringify({ error: "Emergency coordinates not found or invalid" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Get available responders
    const { data: availableResponders, error: respondersError } = await supabaseClient
      .from("responders")
      .select("*")
      .eq("status", "available");
      
    if (respondersError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch responders", details: respondersError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (!availableResponders.length) {
      // No responders available, create escalation
      const { data: escalationData, error: escalationError } = await supabaseClient
        .from("alert_escalations")
        .insert({
          alert_id: emergency.device_alert_id,
          level: "critical",
          reason: "No available responders for emergency"
        })
        .select()
        .single();
        
      if (escalationError) {
        console.error("Error creating escalation:", escalationError);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No available responders found. Alert escalated.", 
          escalation_id: escalationData?.id 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Calculate distances and find the closest responder
    const respondersWithDistance = availableResponders
      .map(responder => {
        const responderCoordinates = parsePoint(responder.coordinates);
        if (!responderCoordinates) return { ...responder, distance: Infinity };
        
        const distance = calculateDistance(
          emergencyCoordinates.latitude,
          emergencyCoordinates.longitude,
          responderCoordinates.latitude,
          responderCoordinates.longitude
        );
        
        return { ...responder, distance };
      })
      .filter(r => r.distance !== Infinity)
      .sort((a, b) => a.distance - b.distance);
      
    if (!respondersWithDistance.length) {
      // No responders with valid coordinates, create escalation
      const { data: escalationData, error: escalationError } = await supabaseClient
        .from("alert_escalations")
        .insert({
          alert_id: emergency.device_alert_id,
          level: "elevated",
          reason: "No responders with valid location data"
        })
        .select()
        .single();
        
      if (escalationError) {
        console.error("Error creating escalation:", escalationError);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No responders with valid location data. Alert escalated.", 
          escalation_id: escalationData?.id 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Select the closest responder
    const closestResponder = respondersWithDistance[0];
    
    // Create assignment
    const { data: assignment, error: assignmentError } = await supabaseClient
      .from("emergency_assignments")
      .insert({
        emergency_id,
        responder_id: closestResponder.id,
        notes: `Auto-assigned. Distance: ${closestResponder.distance.toFixed(2)}km`,
        status: "assigned"
      })
      .select()
      .single();
      
    if (assignmentError) {
      return new Response(
        JSON.stringify({ error: "Failed to assign responder", details: assignmentError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Update emergency status
    const { error: updateError } = await supabaseClient
      .from("emergencies")
      .update({ 
        status: "assigned", 
        assigned_at: new Date().toISOString() 
      })
      .eq("id", emergency_id);
      
    if (updateError) {
      console.error("Error updating emergency status:", updateError);
    }
    
    // Update responder status
    const { error: responderUpdateError } = await supabaseClient
      .from("responders")
      .update({ status: "on_call" })
      .eq("id", closestResponder.id);
      
    if (responderUpdateError) {
      console.error("Error updating responder status:", responderUpdateError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Responder automatically assigned", 
        assignment_id: assignment.id,
        responder_id: closestResponder.id,
        responder_name: closestResponder.name,
        distance: closestResponder.distance.toFixed(2)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in auto-assign-responder function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
