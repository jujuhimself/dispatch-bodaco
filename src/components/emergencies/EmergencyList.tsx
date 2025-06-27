
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Emergency } from '@/types/emergency-types';
import { 
  MapPin, 
  Clock, 
  AlertTriangle,
  Eye,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EmergencyListProps {
  emergencies: Emergency[];
}

const EmergencyList: React.FC<EmergencyListProps> = ({ emergencies }) => {
  const getStatusColor = (status: Emergency['status']) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800 border-red-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'on_site': return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'canceled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500 text-white';
      case 2: return 'bg-orange-500 text-white';
      case 3: return 'bg-yellow-500 text-white';
      case 4: return 'bg-blue-500 text-white';
      case 5: return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      case 4: return 'Low';
      case 5: return 'Routine';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      {emergencies.map((emergency) => (
        <Card key={emergency.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-center space-x-3">
                  <Badge className={getPriorityColor(emergency.priority)}>
                    P{emergency.priority} - {getPriorityLabel(emergency.priority)}
                  </Badge>
                  <Badge className={getStatusColor(emergency.status)}>
                    {emergency.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {/* Emergency Type and Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    {emergency.type}
                  </h3>
                  {emergency.description && (
                    <p className="text-gray-600 mt-1 line-clamp-2">{emergency.description}</p>
                  )}
                </div>

                {/* Location and Time Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {emergency.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Reported {formatDistanceToNow(new Date(emergency.reported_at), { addSuffix: true })}
                  </div>
                  {emergency.assigned_at && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Assigned {formatDistanceToNow(new Date(emergency.assigned_at), { addSuffix: true })}
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>ID: {emergency.id.split('-')[0]}</span>
                  {emergency.coordinates && (
                    <span>Coordinates: {emergency.coordinates.y.toFixed(4)}, {emergency.coordinates.x.toFixed(4)}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 ml-4">
                <Link to={`/emergency/${emergency.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
                
                {emergency.status === 'pending' && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Assign
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmergencyList;
