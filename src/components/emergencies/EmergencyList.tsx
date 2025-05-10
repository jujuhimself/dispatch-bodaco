
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Emergency } from '@/types/emergency-types';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

interface EmergencyListProps {
  emergencies: Emergency[];
}

const EmergencyList: React.FC<EmergencyListProps> = ({ emergencies }) => {
  const navigate = useNavigate();

  // Sort emergencies by priority (lower number = higher priority) and then by reported_at (newest first)
  const sortedEmergencies = [...emergencies].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority; // Lower priority number first
    }
    return new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime();
  });
  
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'assigned':
      case 'in_transit':
        return <AlertCircle className="h-4 w-4" />;
      case 'on_site':
        return <AlertTriangle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };
  
  // Get priority class
  const getPriorityClass = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-500 text-white';
      case 2:
        return 'bg-orange-500 text-white';
      case 3:
        return 'bg-yellow-500 text-white';
      case 4:
        return 'bg-blue-500 text-white';
      case 5:
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  // Get status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'on_site':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Handle row click to navigate to emergency details
  const handleRowClick = (emergencyId: string) => {
    navigate(`/emergency/${emergencyId}`);
  };
  
  if (emergencies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No emergencies found.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedEmergencies.map((emergency) => (
            <tr
              key={emergency.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleRowClick(emergency.id)}
            >
              <td className="px-3 py-4 whitespace-nowrap text-sm">
                <div className="font-medium text-gray-900">{emergency.type}</div>
                {emergency.description && (
                  <div className="text-gray-500 truncate max-w-[200px]">{emergency.description}</div>
                )}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{emergency.location}</td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Badge className={getPriorityClass(emergency.priority)}>
                  {emergency.priority === 1 ? 'Critical' : 
                   emergency.priority === 2 ? 'High' : 
                   emergency.priority === 3 ? 'Medium' : 
                   emergency.priority === 4 ? 'Low' : 'Minimal'}
                </Badge>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(emergency.status)}`}>
                  {getStatusIcon(emergency.status)}
                  <span className="ml-1 capitalize">{emergency.status.replace('_', ' ')}</span>
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(emergency.reported_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmergencyList;
