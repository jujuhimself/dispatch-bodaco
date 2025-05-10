
import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { createChannel } from '@/services/communications-service';
import { CommunicationChannel } from '@/types/communication-types';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Emergency } from '@/types/emergency-types';

interface CreateChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated?: (channel: CommunicationChannel) => void;
  emergencies?: Emergency[];
}

const CreateChannelDialog: React.FC<CreateChannelDialogProps> = ({
  isOpen,
  onClose,
  onChannelCreated,
  emergencies = []
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'emergency' | 'responder' | 'general'>('general');
  const [emergencyId, setEmergencyId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() === '') {
      toast.error('Channel name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const newChannel = await createChannel({
        name,
        description: description || null,
        type,
        emergency_id: type === 'emergency' ? emergencyId : null
      });
      
      if (newChannel) {
        toast.success('Channel created successfully');
        if (onChannelCreated) {
          onChannelCreated(newChannel);
        }
        handleClose();
      } else {
        throw new Error('Failed to create channel');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      toast.error('Failed to create channel');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setName('');
    setDescription('');
    setType('general');
    setEmergencyId(undefined);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Communication Channel</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Channel Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter channel name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter channel description"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Channel Type</Label>
              <RadioGroup value={type} onValueChange={(value: 'emergency' | 'responder' | 'general') => setType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="general" id="general" />
                  <Label htmlFor="general">General</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="emergency" id="emergency" />
                  <Label htmlFor="emergency">Emergency</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="responder" id="responder" />
                  <Label htmlFor="responder">Responder</Label>
                </div>
              </RadioGroup>
            </div>
            
            {type === 'emergency' && emergencies.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="emergency">Link to Emergency</Label>
                <Select value={emergencyId} onValueChange={setEmergencyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an emergency" />
                  </SelectTrigger>
                  <SelectContent>
                    {emergencies.map((emergency) => (
                      <SelectItem key={emergency.id} value={emergency.id}>
                        {emergency.type} - {emergency.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || name.trim() === ''}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Channel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelDialog;
