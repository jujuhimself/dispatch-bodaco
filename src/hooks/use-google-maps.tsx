
import React, { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    google: typeof google;
  }
}

export interface UseGoogleMapsResult {
  isLoaded: boolean;
  loadError: Error | null;
  map: google.maps.Map | null;
  mapRef: React.RefObject<HTMLDivElement>;
  createMap: (element: HTMLDivElement, options: google.maps.MapOptions) => google.maps.Map | null;
}

export function useGoogleMaps(): UseGoogleMapsResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapsScriptId = 'google-maps-script';

  // Function to create a map instance
  const createMap = useCallback((element: HTMLDivElement, options: google.maps.MapOptions): google.maps.Map | null => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps not loaded');
      setLoadError(new Error('Google Maps not loaded'));
      return null;
    }
    try {
      const newMap = new window.google.maps.Map(element, options);
      setMap(newMap);
      return newMap;
    } catch (error) {
      console.error('Error creating map:', error);
      setLoadError(error instanceof Error ? error : new Error('Failed to create map'));
      return null;
    }
  }, []);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setLoadError(new Error('Google Maps API key is not configured'));
      return;
    }

    // Function to handle the loading of Google Maps
    const handleScriptLoad = () => {
      // Check if load was successful
      if (!window.google || !window.google.maps) {
        setLoadError(new Error('Google Maps failed to load'));
        return;
      }
      setIsLoaded(true);
    };

    // Function to handle script errors
    const handleScriptError = () => {
      setLoadError(new Error('Failed to load Google Maps script'));
      const scriptElement = document.getElementById('google-maps-script');
      if (scriptElement) {
        document.head.removeChild(scriptElement);
      }
    };

    // Check if we need to load the script (it might be in the HTML already)
    const script = document.getElementById('google-maps-script') as HTMLScriptElement;
    
    if (!script) {
      // Script doesn't exist yet, let's create it
      const googleScript = document.createElement('script');
      googleScript.id = 'google-maps-script';
      googleScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      googleScript.async = true;
      googleScript.defer = true;
      
      googleScript.onload = handleScriptLoad;
      googleScript.onerror = handleScriptError;
      
      document.head.appendChild(googleScript);
    } else if (script.onload) {
      // Script exists but hasn't loaded yet
      const originalOnload = script.onload;
      script.onload = (e) => {
        originalOnload.call(script, e);
        handleScriptLoad();
      };
    } else {
      // Script already loaded
      handleScriptLoad();
    }

    return () => {
      // Cleanup function
      // We don't remove the script on unmount as other components might need it
    };
  }, []);

  return {
    isLoaded,
    loadError,
    map,
    mapRef,
    createMap
  };
}
