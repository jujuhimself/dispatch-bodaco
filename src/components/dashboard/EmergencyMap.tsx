
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Zap, AlertCircle } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/use-google-maps';

// Define the type that matches the actual return type of useGoogleMaps
type UseGoogleMapsResult = {
  isLoaded: boolean;
  loadError: Error | null;
  map: google.maps.Map | null;
  mapRef: React.RefObject<HTMLDivElement>;
  createMap?: (element: HTMLDivElement, options: google.maps.MapOptions) => google.maps.Map | null;
};

// Default map center (Addis Ababa coordinates)
const DEFAULT_CENTER = { lat: 9.032, lng: 38.75 };
const DEFAULT_ZOOM = 12;

// Emergency locations with coordinates
const mockEmergencies = [
  { 
    id: '1', 
    type: 'Medical Emergency', 
    location: 'Bole Road', 
    position: { lat: 9.0227, lng: 38.7897 },
    priority: 1, 
    status: 'pending' 
  },
  { 
    id: '2', 
    type: 'Vehicle Crash', 
    location: 'Mexico Square', 
    position: { lat: 9.0307, lng: 38.7612 },
    priority: 2, 
    status: 'assigned' 
  },
  { 
    id: '3', 
    type: 'Fire Emergency', 
    location: 'Piazza', 
    position: { lat: 9.0408, lng: 38.7636 },
    priority: 1, 
    status: 'in_transit' 
  },
];

const EmergencyMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { isLoaded, loadError } = useGoogleMaps();
  const mapInitialized = useRef(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize the map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapInitialized.current) return;
    
    const initMap = () => {
      try {
        // Check if Google Maps API is available
        if (!window.google || !window.google.maps) {
          setMapError('Google Maps API is not available');
          return;
        }
        
        // Check if the container element exists
        if (!mapContainerRef.current) {
          setMapError('Map container not found');
          return;
        }
        
        // Create the map instance
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });
        
        mapInitialized.current = true;
        
        // Add markers for mock emergencies
        mockEmergencies.forEach(emergency => {
          new window.google.maps.Marker({
            position: emergency.position,
            map: map,
            title: `${emergency.type} - ${emergency.location}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: emergency.priority === 1 ? '#ef4444' : emergency.priority === 2 ? '#f59e0b' : '#10b981',
              fillOpacity: 0.8,
              strokeWeight: 0,
              scale: 10,
            }
          });
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map. Please try again later.');
      }
    };

    // Small delay to ensure the container is fully rendered
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 bg-red-100';
      case 2: return 'text-orange-600 bg-orange-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-red-600';
      case 'assigned': return 'text-blue-600';
      case 'in_transit': return 'text-orange-600';
      case 'on_site': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
          Emergency Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Map Container */}
        <div 
          ref={mapContainerRef} 
          className="relative bg-gray-100 rounded-lg h-64 mb-4 overflow-hidden"
        >
          {loadError && (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-red-600 font-medium">Failed to load map</p>
              <p className="text-sm text-gray-600 mt-1">Please check your internet connection</p>
            </div>
          )}
          {!isLoaded && !loadError && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          )}
        </div>

        {/* Emergency List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700 mb-3">Active Emergencies</h4>
          {mockEmergencies.map((emergency) => (
            <div key={emergency.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(emergency.priority)}`}></div>
                <div>
                  <p className="text-sm font-medium">{emergency.type}</p>
                  <p className="text-xs text-gray-500">{emergency.location}</p>
                </div>
              </div>
              <div className={`text-xs font-medium ${getStatusColor(emergency.status)}`}>
                {emergency.status.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-center text-sm text-gray-500">
          <Zap className="h-4 w-4 mr-1" />
          Live updates every 15 seconds
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyMap;
