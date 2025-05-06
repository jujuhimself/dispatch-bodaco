
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { fetchActiveEmergencies, fetchAvailableResponders } from '@/services/emergency-service';
import { Button } from '@/components/ui/button';

// Default coordinates for Dar es Salaam
const DAR_ES_SALAAM_COORDS: [number, number] = [39.2083, -6.1725];

const EmergencyMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  // Fetch emergencies and responders data
  const { data: emergencies } = useQuery({
    queryKey: ['activeEmergencies'],
    queryFn: fetchActiveEmergencies,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const { data: responders } = useQuery({
    queryKey: ['availableResponders'],
    queryFn: fetchAvailableResponders,
    refetchInterval: 30000,
  });
  
  const handleMapboxTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMapboxToken(e.target.value);
  };

  const initializeMap = () => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: DAR_ES_SALAAM_COORDS,
      zoom: 12
    });

    map.current.on('load', () => {
      // Add emergency markers if we have emergency data
      if (emergencies) {
        emergencies.forEach(emergency => {
          if (!emergency.coordinates) return;
          
          const coordinates: [number, number] = [
            emergency.coordinates.x, 
            emergency.coordinates.y
          ];
          
          const el = document.createElement('div');
          el.className = 'emergency-marker';
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.background = emergency.priority <= 2 ? '#f44336' : '#ff9800';
          el.style.border = '2px solid white';
          
          new mapboxgl.Marker(el)
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${emergency.type}</h3><p>${emergency.location}</p>`))
            .addTo(map.current!);
        });
      } else {
        // Use mock data if no real data is available
        const mockEmergencies = [
          { coordinates: [39.2183, -6.1625], type: 'Traffic Accident', severity: 'high' },
          { coordinates: [39.2133, -6.1825], type: 'Medical Emergency', severity: 'medium' },
          { coordinates: [39.1983, -6.1525], type: 'Building Fire', severity: 'high' },
        ];
        
        mockEmergencies.forEach(emergency => {
          const el = document.createElement('div');
          el.className = 'emergency-marker';
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.background = emergency.severity === 'high' ? '#f44336' : '#ff9800';
          el.style.border = '2px solid white';
          
          new mapboxgl.Marker(el)
            .setLngLat(emergency.coordinates as [number, number])
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${emergency.type}</h3>`))
            .addTo(map.current!);
        });
      }

      // Add responder markers if we have responder data
      if (responders) {
        responders.forEach(responder => {
          if (!responder.coordinates) return;
          
          const coordinates: [number, number] = [
            responder.coordinates.x, 
            responder.coordinates.y
          ];
          
          const el = document.createElement('div');
          el.className = 'responder-marker';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.background = responder.type === 'ambulance' ? '#4caf50' : '#2196f3';
          el.style.border = '2px solid white';
          
          new mapboxgl.Marker(el)
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${responder.name}</h3><p>${responder.type}</p>`))
            .addTo(map.current!);
        });
      } else {
        // Use mock data if no real data is available
        const mockResponders = [
          { coordinates: [39.2053, -6.1695], type: 'ambulance' },
          { coordinates: [39.2153, -6.1795], type: 'bajaj' },
          { coordinates: [39.1953, -6.1595], type: 'traffic' },
        ];
        
        mockResponders.forEach(responder => {
          const el = document.createElement('div');
          el.className = 'responder-marker';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.background = responder.type === 'ambulance' ? '#4caf50' : '#2196f3';
          el.style.border = '2px solid white';
          
          new mapboxgl.Marker(el)
            .setLngLat(responder.coordinates as [number, number])
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${responder.type}</h3>`))
            .addTo(map.current!);
        });
      }
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  };

  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, emergencies, responders]);

  return (
    <Card className="col-span-1 lg:col-span-2 h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Live Emergency Map</CardTitle>
        {mapboxToken && (
          <Button variant="outline" size="sm">Refresh Map</Button>
        )}
      </CardHeader>
      <CardContent className="p-0 relative">
        {!mapboxToken ? (
          <div className="w-full h-[330px] bg-gray-100 rounded-md flex flex-col items-center justify-center p-4">
            <p className="text-gray-500 mb-4">Please enter your Mapbox token to activate the map</p>
            <div className="max-w-md w-full">
              <input
                type="text"
                placeholder="Enter your Mapbox public token"
                value={mapboxToken}
                onChange={handleMapboxTokenChange}
                className="w-full p-2 border rounded mb-2"
              />
              <p className="text-xs text-gray-500">
                Get a token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">mapbox.com</a>
              </p>
            </div>
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-[330px] rounded-md" />
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyMap;
