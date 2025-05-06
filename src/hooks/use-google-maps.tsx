
import { useState, useEffect } from 'react';

interface UseGoogleMapsResult {
  isLoaded: boolean;
  loadError: Error | null;
}

export function useGoogleMaps(): UseGoogleMapsResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
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
      googleScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDN8Pf0Gn5Z-hKAn-STdYCxrmIU2ECmcf0&libraries=places`;
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

  return { isLoaded, loadError };
}
