
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { optimizedEmergencyService } from '@/services/optimized-emergency-service';

const emergencyTypes = [
  'Medical Emergency',
  'Fire Emergency',
  'Vehicle Crash',
  'Natural Disaster',
  'Security Incident',
  'Chemical Spill',
  'Other'
];

const priorityLevels = [
  { value: 1, label: 'Critical', color: 'text-red-600' },
  { value: 2, label: 'High', color: 'text-orange-600' },
  { value: 3, label: 'Medium', color: 'text-yellow-600' },
  { value: 4, label: 'Low', color: 'text-green-600' }
];

export const QuickEmergencyCreate = ({ onEmergencyCreated }: { onEmergencyCreated?: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    description: '',
    priority: 3
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.location) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await optimizedEmergencyService.createEmergency(formData);
      toast.success('Emergency created successfully');
      
      // Reset form
      setFormData({
        type: '',
        location: '',
        description: '',
        priority: 3
      });
      
      onEmergencyCreated?.();
    } catch (error) {
      console.error('Error creating emergency:', error);
      toast.error('Failed to create emergency');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Quick Emergency Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Emergency Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  {emergencyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select 
                value={formData.priority.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map(level => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      <span className={level.color}>{level.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter emergency location"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide details about the emergency..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating Emergency...
              </>
            ) : (
              'Create Emergency'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
