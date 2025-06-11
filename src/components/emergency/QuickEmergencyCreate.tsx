
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle, MapPin, Plus } from 'lucide-react';
import { createEmergency } from '@/services/emergency-service';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const emergencyTypes = [
  'Vehicle Crash',
  'Medical Emergency',
  'Fire Emergency',
  'Traffic Accident',
  'Theft/Crime',
  'Natural Disaster',
  'Other Emergency'
];

export const QuickEmergencyCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '',
    priority: '3',
    coordinates: { x: 0, y: 0 }
  });

  const createEmergencyMutation = useMutation({
    mutationFn: createEmergency,
    onSuccess: (data) => {
      toast.success('Emergency created successfully!');
      
      // Reset form
      setFormData({
        type: '',
        description: '',
        location: '',
        priority: '3',
        coordinates: { x: 0, y: 0 }
      });
      setIsExpanded(false);
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['active-emergencies'] });
      queryClient.invalidateQueries({ queryKey: ['emergency-statistics'] });
      
      // Navigate to the emergency details
      navigate(`/emergency/${data.id}`);
    },
    onError: (error) => {
      toast.error('Failed to create emergency. Please try again.');
      console.error('Error creating emergency:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    createEmergencyMutation.mutate({
      type: formData.type,
      description: formData.description,
      location: formData.location,
      priority: parseInt(formData.priority),
      coordinates: formData.coordinates
    });
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              x: position.coords.longitude,
              y: position.coords.latitude
            }
          }));
          toast.success('Location captured successfully');
        },
        (error) => {
          toast.error('Failed to get current location');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  if (!isExpanded) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <Button 
            onClick={() => setIsExpanded(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Emergency
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          Create New Emergency
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Emergency Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  {emergencyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High Priority (1)</SelectItem>
                  <SelectItem value="2">Medium Priority (2)</SelectItem>
                  <SelectItem value="3">Low Priority (3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location address"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleLocationClick}
                className="shrink-0"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide additional details about the emergency"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={createEmergencyMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {createEmergencyMutation.isPending ? 'Creating...' : 'Create Emergency'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
