
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Users,
  Bell,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { CommunicationStats } from './CommunicationStats';
import { MessageThread } from './MessageThread';
import { EnhancedChatInput } from './EnhancedChatInput';
import ChannelList from './ChannelList';
import ChatInterface from './ChatInterface';
import { ChatMessage as ChatMessageType } from '@/types/communication-types';

export const CommunicationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedThread, setSelectedThread] = useState<ChatMessageType | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleMessageSelect = (message: ChatMessageType) => {
    setSelectedThread(message);
  };

  const handleCloseThread = () => {
    setSelectedThread(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Communication Dashboard</h1>
            <p className="text-muted-foreground">Manage all emergency communications</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Channel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Channels
              <Badge variant="secondary" className="ml-1">12</Badge>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Emergency
              <Badge variant="destructive" className="ml-1">3</Badge>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <CommunicationStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { channel: 'Emergency Channel 1', activity: 'New message from Dr. Smith', time: '2 min ago', priority: 'high' },
                      { channel: 'Fire Department', activity: 'Voice call ended', time: '5 min ago', priority: 'medium' },
                      { channel: 'Police Dispatch', activity: 'File attachment shared', time: '8 min ago', priority: 'low' },
                      { channel: 'Medical Team', activity: 'Channel created', time: '12 min ago', priority: 'low' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded border">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.channel}</p>
                          <p className="text-sm text-muted-foreground">{item.activity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}>
                            {item.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Broadcast Emergency Alert
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Create Team Channel
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Send Notification
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              <div className="lg:col-span-1">
                <ChannelList 
                  channels={[]}
                  loading={false}
                  onChannelSelect={() => {}}
                  onCreateChannel={() => {}}
                />
              </div>
              <div className="lg:col-span-2">
                {selectedThread ? (
                  <MessageThread 
                    parentMessage={selectedThread}
                    onClose={handleCloseThread}
                  />
                ) : (
                  <div className="bg-card rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4">Real-Time Communications</h3>
                    <div className="text-muted-foreground">
                      Select an emergency channel or create a new one to start communicating.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Active Emergency Communications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: '1', type: 'Medical Emergency', location: 'Downtown Hospital', status: 'In Progress', responders: 4, lastUpdate: '1 min ago' },
                      { id: '2', type: 'Vehicle Crash', location: 'Highway 101', status: 'Assigned', responders: 2, lastUpdate: '3 min ago' },
                      { id: '3', type: 'Fire Emergency', location: 'Residential Area', status: 'En Route', responders: 6, lastUpdate: '5 min ago' }
                    ].map((emergency) => (
                      <Card key={emergency.id} className="border-red-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{emergency.type}</h3>
                              <p className="text-sm text-muted-foreground">{emergency.location}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">{emergency.status}</Badge>
                              <Badge variant="outline">{emergency.responders} responders</Badge>
                              <span className="text-xs text-muted-foreground">{emergency.lastUpdate}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Notification Preferences</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Emergency alerts</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Message notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span>System updates</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Auto-responder</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span>Enable auto-acknowledgment</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span>Smart message routing</span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
