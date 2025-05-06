
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Send, Phone, MessageSquare, Whatsapp } from 'lucide-react';

const communications = [
  {
    id: 1,
    sender: "Dr. Mohammed",
    message: "Patient is stabilized and ready for transport to Muhimbili",
    time: "2 mins ago",
    type: "message"
  },
  {
    id: 2,
    sender: "Traffic Officer T-05",
    message: "Road cleared for ambulance on Morogoro Road",
    time: "5 mins ago",
    type: "voice"
  },
  {
    id: 3,
    sender: "+255 123 456 789",
    message: "Reporting fire emergency at Kariakoo market",
    time: "12 mins ago",
    type: "whatsapp"
  },
  {
    id: 4,
    sender: "Ambulance 03 Team",
    message: "Patient picked up, en route to hospital with ETA 8 minutes",
    time: "15 mins ago",
    type: "message"
  }
];

const getCommunicationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <MessageSquare className="h-3 w-3" />;
    case 'voice':
      return <Phone className="h-3 w-3" />;
    case 'whatsapp':
      return <Whatsapp className="h-3 w-3" />;
    default:
      return <MessageSquare className="h-3 w-3" />;
  }
};

const getCommunicationStyle = (type: string) => {
  switch (type) {
    case 'message':
      return 'bg-gray-100 text-gray-600';
    case 'voice':
      return 'bg-blue-100 text-blue-600';
    case 'whatsapp':
      return 'bg-green-100 text-green-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const RecentCommunications = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Recent Communications</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {communications.map((comm) => (
            <div key={comm.id} className="p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center">
                  <span className={`p-1 rounded-full mr-2 ${getCommunicationStyle(comm.type)}`}>
                    {getCommunicationIcon(comm.type)}
                  </span>
                  <span className="font-medium text-sm">{comm.sender}</span>
                </div>
                <span className="text-xs text-gray-400">{comm.time}</span>
              </div>
              <p className="text-sm text-gray-600 pl-6">{comm.message}</p>
              <div className="flex justify-end mt-2">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  <Send className="h-3 w-3 mr-1" /> Reply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentCommunications;
