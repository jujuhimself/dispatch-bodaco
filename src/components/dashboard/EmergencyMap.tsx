
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { fetchActiveEmergencies, fetchAvailableResponders } from '@/services/emergency-service';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

// Default coordinates for Dar es Salaam
const DAR_ES_SALAAM_COORDS = { lat: -6.1725, lng: 39.2083 };
const GOOGLE_MAPS_API_KEY = "AIzaSyDN8Pf0Gn5Z-hKAn-STdYCxrmIU2ECmcf0";

const EmergencyMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  // Fetch emergencies and responders data
  const { data: emergencies, isLoading: emergenciesLoading, error: emergenciesError } = useQuery({
    queryKey: ['activeEmergencies'],
    queryFn: fetchActiveEmergencies,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const { data: responders, isLoading: respondersLoading, error: respondersError } = useQuery({
    queryKey: ['availableResponders'],
    queryFn: fetchAvailableResponders,
    refetchInterval: 30000,
  });

  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    script.onerror = () => {
      setMapLoadError("Failed to load Google Maps. Please check your internet connection.");
    };
    document.head.appendChild(script);
  };

  useEffect(() => {
    // Load Google Maps script if not already loaded
    if (!window.google?.maps && !document.querySelector('script[src*="maps.googleapis"]')) {
      loadGoogleMapsScript();
    } else {
      setMapLoaded(true);
    }

    return () => {
      // Clean up markers on component unmount
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || !mapLoaded || map.current) return;

    try {
      map.current = new google.maps.Map(mapContainer.current, {
        center: DAR_ES_SALAAM_COORDS,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c9e9f6" }]
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#e8eaed" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          }
        ]
      });

      // Add emergency and responder markers if data is available
      addMarkersToMap();
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setMapLoadError("Failed to initialize the map. Please reload the page.");
    }
  };

  const addMarkersToMap = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Add emergency markers
    if (emergencies && emergencies.length > 0) {
      emergencies.forEach(emergency => {
        if (!emergency.coordinates) return;
        
        const position = {
          lat: emergency.coordinates.y,
          lng: emergency.coordinates.x
        };
        
        const marker = new google.maps.Marker({
          position,
          map: map.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: emergency.priority <= 2 ? '#f44336' : '#ff9800',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 10
          },
          title: emergency.type
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div>
              <h3>${emergency.type}</h3>
              <p>${emergency.location}</p>
              <p>Priority: ${emergency.priority}</p>
              <p>Status: ${emergency.status}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map.current, marker);
        });

        markers.current.push(marker);
      });
    }

    // Add responder markers
    if (responders && responders.length > 0) {
      responders.forEach(responder => {
        if (!responder.coordinates) return;
        
        const position = {
          lat: responder.coordinates.y,
          lng: responder.coordinates.x
        };
        
        const marker = new google.maps.Marker({
          position,
          map: map.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: responder.type === 'ambulance' ? '#4caf50' : '#2196f3',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 8
          },
          title: responder.name
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div>
              <h3>${responder.name}</h3>
              <p>Type: ${responder.type}</p>
              <p>Status: ${responder.status}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map.current, marker);
        });

        markers.current.push(marker);
      });
    }
  };

  useEffect(() => {
    if (mapLoaded) {
      initializeMap();
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (map.current && (emergencies || responders)) {
      addMarkersToMap();
    }
  }, [emergencies, responders]);

  const handleRefreshMap = () => {
    if (!map.current) return;
    // Re-center map and refresh markers
    map.current.setCenter(DAR_ES_SALAAM_COORDS);
    addMarkersToMap();
  };

  // Show loading state, error, or map
  const renderMapContent = () => {
    if (!mapLoaded) {
      return (
        <div className="w-full h-[330px] bg-gray-50 rounded-md flex flex-col items-center justify-center p-4">
          <Loader className="h-8 w-8 mb-4" />
          <p className="text-gray-500">Loading Google Maps...</p>
        </div>
      );
    }

    if (mapLoadError) {
      return (
        <div className="w-full h-[330px] bg-gray-50 rounded-md flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-8 w-8 mb-4 text-red-500" />
          <p className="text-gray-700 mb-2 font-medium">Map Error</p>
          <p className="text-gray-500 text-center">{mapLoadError}</p>
        </div>
      );
    }

    if (emergenciesError || respondersError) {
      return (
        <div className="w-full h-[330px] bg-gray-50 rounded-md flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-8 w-8 mb-4 text-orange-500" />
          <p className="text-gray-700 mb-2 font-medium">Data Error</p>
          <p className="text-gray-500 text-center">
            {emergenciesError ? 'Failed to load emergencies data.' : 'Failed to load responders data.'}
          </p>
        </div>
      );
    }

    return <div ref={mapContainer} className="w-full h-[330px] rounded-md shadow-inner" />;
  };

  return (
    <Card className="col-span-1 lg:col-span-2 h-[400px] bg-white/80 backdrop-blur-sm border border-gray-100 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Live Emergency Map</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshMap} 
          disabled={!mapLoaded || !!mapLoadError}
        >
          Refresh Map
        </Button>
      </CardHeader>
      <CardContent className="p-0 relative">
        {renderMapContent()}
        {(emergenciesLoading || respondersLoading) && (
          <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow-sm">
            <Loader className="h-4 w-4 text-primary animate-spin" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyMap;
