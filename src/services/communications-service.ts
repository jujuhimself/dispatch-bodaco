
import { supabase } from '@/integrations/supabase/client';
import { Communication, CommunicationChannel, ChannelMember } from '@/types/communication-types';
import { toast } from 'sonner';

export const fetchCommunications = async (
  emergencyId?: string,
  responderId?: string,
  parentId?: string,
  limit: number = 100
): Promise<Communication[]> => {
  try {
    let query = supabase
      .from('communications')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit);
    
    if (emergencyId) {
      query = query.eq('emergency_id', emergencyId);
    }
    
    if (responderId) {
      query = query.eq('responder_id', responderId);
    }
    
    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null); // Only top-level messages
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data as Communication[];
  } catch (error) {
    console.error('Error fetching communications:', error);
    toast.error('Failed to load communication messages');
    return [];
  }
};

export const createChannel = async (
  channelData: { name: string; description?: string | null; type?: string; emergency_id?: string | null }
): Promise<CommunicationChannel | null> => {
  try {
    const { data, error } = await supabase
      .from('communication_channels')
      .insert(channelData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data as CommunicationChannel;
  } catch (error) {
    console.error('Error creating channel:', error);
    toast.error('Failed to create communication channel');
    return null;
  }
};

export const fetchChannels = async (
  type?: string,
  emergencyId?: string
): Promise<CommunicationChannel[]> => {
  try {
    let query = supabase
      .from('communication_channels')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (emergencyId) {
      query = query.eq('emergency_id', emergencyId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data as CommunicationChannel[];
  } catch (error) {
    console.error('Error fetching channels:', error);
    toast.error('Failed to load communication channels');
    return [];
  }
};

export const sendMessage = async (messageData: Partial<Communication>): Promise<Communication | null> => {
  try {
    // Ensure required fields are present
    if (!messageData.message || !messageData.sender) {
      throw new Error('Message and sender are required');
    }
    
    const { data, error } = await supabase
      .from('communications')
      .insert({
        message: messageData.message,
        sender: messageData.sender,
        type: messageData.type || 'message',
        emergency_id: messageData.emergency_id || null,
        responder_id: messageData.responder_id || null,
        parent_id: messageData.parent_id || null,
        attachment_url: messageData.attachment_url || null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // If this message is part of a channel, update the channel's updated_at timestamp
    if (messageData.emergency_id) {
      await supabase
        .from('communication_channels')
        .update({ updated_at: new Date().toISOString() })
        .eq('emergency_id', messageData.emergency_id);
    }
    
    return data as Communication;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Failed to send message');
    return null;
  }
};

export const subscribeToMessages = (callback: (payload: any) => void) => {
  return supabase
    .channel('table-db-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'communications'
      },
      (payload) => callback(payload)
    )
    .subscribe();
};

export const markMessagesAsRead = async (
  messageIds: string[],
  userId: string
): Promise<boolean> => {
  try {
    // For each message, update the read_by_ids array to include this user
    const { error } = await supabase.rpc('mark_messages_as_read', {
      p_message_ids: messageIds,
      p_user_id: userId
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};
