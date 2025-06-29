
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, MapPin, ArrowLeft } from 'lucide-react';
import { createEmergency } from '@/services/emergency-service';
import { toast } from 'sonner';
import { BackNavigation } from '@/components/navigation/BackNavigation';

const CreateEmergency = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '',
    priority: 3,
    coordinates: { x: 0, y: 0 }
  });

  const createEmergencyMutation = useMutation({
    mutationFn: createEmergency,
    onSuccess: (data) => {
      toast.success('Emergency created successfully');
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      navigate(`/emergency/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create emergency');
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
      priority: formData.priority,
      coordinates: formData.coordinates
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const emergencyTypes = [
    'Medical Emergency',
    'Fire Emergency',
    'Vehicle Crash',
    'Crime in Progress',
    'Natural Disaster',
    'Hazardous Material',
    'Domestic Violence',
    'Missing Person',
    'Other'
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <BackNavigation label="Create Emergency" />
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Create New Emergency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Emergency Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={formData.priority.toString()}
                    onValueChange={(value) => handleInputChange('priority', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - High Priority</SelectItem>
                      <SelectItem value="2">2 - Medium Priority</SelectItem>
                      <SelectItem value="3">3 - Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter the emergency location"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.coordinates.y}
                    onChange={(e) => handleInputChange('coordinates', {
                      ...formData.coordinates,
                      y: parseFloat(e.target.value) || 0
                    })}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.coordinates.x}
                    onChange={(e) => handleInputChange('coordinates', {
                      ...formData.coordinates,
                      x: parseFloat(e.target.value) || 0
                    })}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide additional details about the emergency..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/emergencies')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createEmergencyMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {createEmergencyMutation.isPending ? 'Creating...' : 'Create Emergency'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEmergency;
