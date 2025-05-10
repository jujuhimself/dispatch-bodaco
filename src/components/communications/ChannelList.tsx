
import React, { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { 
  Card, CardContent, CardHeader, CardTitle,
  CardFooter, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BellRing, Plus, Phone, MessageCircle, Ambulance, AlertCircle,
  Search, Loader2
} from 'lucide-react';
import { CommunicationChannel } from '@/types/communication-types';
import { Skeleton } from '@/components/ui/skeleton';

interface ChannelListProps {
  channels: CommunicationChannel[];
  activeChannelId?: string;
  loading?: boolean;
  onChannelSelect: (channel: CommunicationChannel) => void;
  onCreateChannel?: () => void;
}

const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  activeChannelId,
  loading = false,
  onChannelSelect,
  onCreateChannel
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChannels, setFilteredChannels] = useState<CommunicationChannel[]>(channels);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChannels(channels);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredChannels(
        channels.filter(
          channel => channel.name.toLowerCase().includes(query) || 
                    (channel.description && channel.description.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, channels]);
  
  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'responder':
        return <Ambulance className="h-5 w-5 text-blue-500" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Channels</CardTitle>
          {onCreateChannel && (
            <Button variant="ghost" size="sm" onClick={onCreateChannel}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        {loading ? (
          Array(5).fill(null).map((_, index) => (
            <div key={index} className="mb-3 p-2 flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))
        ) : filteredChannels.length > 0 ? (
          <div className="space-y-2 pt-2">
            {filteredChannels.map(channel => (
              <div
                key={channel.id}
                className={`flex items-start gap-3 p-2.5 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  activeChannelId === channel.id ? 'bg-muted' : ''
                }`}
                onClick={() => onChannelSelect(channel)}
              >
                <div className="bg-secondary rounded-full p-2 flex-shrink-0">
                  {getChannelIcon(channel.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{channel.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(new Date(channel.updated_at), new Date(), { addSuffix: true })}
                    </span>
                  </div>
                  {channel.description && (
                    <p className="text-sm text-muted-foreground truncate">{channel.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
            <p>No channels found</p>
            <p className="text-sm">{searchQuery ? "Try a different search" : "Create a new channel to get started"}</p>
          </div>
        )}
      </CardContent>
      
      {onCreateChannel && (
        <CardFooter className="pt-2 pb-3">
          <Button 
            onClick={onCreateChannel} 
            variant="outline" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create New Channel
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ChannelList;
