
/**
 * This script can be used to simulate an IoT device alert to test the system.
 * Run it with Node.js, e.g.: node simulate-iot-alert.js
 */

const sendAlert = async () => {
  const SUPABASE_URL = "https://avkbfpzmqgrffhdnfewv.supabase.co";
  const API_ENDPOINT = `${SUPABASE_URL}/functions/v1/iot-alert`;
  
  // Generate random coordinates near a specific location (e.g., Addis Ababa)
  const baseLat = 9.0450;  // Base latitude
  const baseLng = 38.7368; // Base longitude
  
  const randomOffset = () => (Math.random() - 0.5) * 0.01; // Random offset of about 1km
  
  const alertData = {
    device_id: "SIM001", // This device ID would need to exist in your database
    alert_type: "crash",
    severity: 1,
    latitude: baseLat + randomOffset(),
    longitude: baseLng + randomOffset(),
    data: {
      impact_force: Math.floor(Math.random() * 100) + 50,
      vehicle_speed: Math.floor(Math.random() * 80) + 20,
      airbag_deployed: Math.random() > 0.5,
      timestamp: new Date().toISOString()
    }
  };
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(alertData)
    });
    
    const responseData = await response.json();
    console.log("Alert sent:", responseData);
    
  } catch (error) {
    console.error("Error sending alert:", error);
  }
};

sendAlert();

console.log("Simulating IoT device alert...");
