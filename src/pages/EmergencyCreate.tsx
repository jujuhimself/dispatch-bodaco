
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, ArrowLeft, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { createEmergency } from '@/services/emergency-service';
import { useGoogleMaps } from '@/hooks/use-google-maps';

const EmergencyCreate = () => {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useGoogleMaps();
  
  const [emergencyData, setEmergencyData] = useState({
    type: '',
    description: '',
    location: '',
    priority: 3,
    coordinates: { x: 0, y: 0 }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -6.1725, lng: 39.2083 }); // Default to Dar es Salaam
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmergencyData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setEmergencyData(prev => ({ ...prev, priority: value }));
  };
  
  const handleLocationSelect = (location: string, lat: number, lng: number) => {
    setEmergencyData(prev => ({
      ...prev,
      location,
      coordinates: { x: lng, y: lat }
    }));
    setShowMapPicker(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emergencyData.type || !emergencyData.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createEmergency(emergencyData);
      toast.success('Emergency created successfully');
      navigate('/emergencies');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create emergency');
      console.error('Error creating emergency:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const initializeMapPicker = () => {
    setShowMapPicker(true);
    
    // Initialize map here if needed
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Use default location if geolocation fails
          console.log('Using default location');
        }
      );
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Emergency</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Emergency Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Emergency Type *</Label>
                <select
                  id="type"
                  name="type"
                  value={emergencyData.type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-white/90 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>Select emergency type</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="fire">Fire</option>
                  <option value="traffic">Traffic Accident</option>
                  <option value="crime">Crime/Security</option>
                  <option value="natural">Natural Disaster</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    id="priority"
                    name="priority"
                    min="1"
                    max="5"
                    value={emergencyData.priority}
                    onChange={handlePriorityChange}
                    className="w-full"
                  />
                  <span className="font-bold text-emergency-600">{emergencyData.priority}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="location"
                  name="location"
                  value={emergencyData.location}
                  onChange={handleChange}
                  placeholder="Enter location or select on map"
                  required
                  className="flex-grow bg-white/90"
                />
                <Button
                  type="button"
                  onClick={initializeMapPicker}
                  className="flex items-center"
                  variant="outline"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Map
                </Button>
              </div>
            </div>
            
            {showMapPicker && (
              <div className="border rounded-md p-4 bg-white/90">
                <div className="mb-2 flex justify-between items-center">
                  <h3 className="font-medium">Select Location on Map</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMapPicker(false)}
                  >
                    Close
                  </Button>
                </div>
                
                {!isLoaded ? (
                  <div className="h-64 flex items-center justify-center">Loading map...</div>
                ) : loadError ? (
                  <div className="h-64 flex items-center justify-center text-emergency-600">
                    <AlertTriangle className="h-6 w-6 mr-2" />
                    Error loading map
                  </div>
                ) : (
                  <div id="map-container" style={{ height: '300px' }} className="rounded-md overflow-hidden">
                    {/* Map will be rendered here by the hook */}
                  </div>
                )}
                
                <div className="mt-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      // Example of manually setting location
                      handleLocationSelect("Current map selection", mapCenter.lat, mapCenter.lng);
                    }}
                  >
                    Use Selected Location
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={emergencyData.description}
                onChange={handleChange}
                placeholder="Provide details about the emergency"
                className="min-h-32 bg-white/90"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emergency-600 hover:bg-emergency-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Emergency'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyCreate;
