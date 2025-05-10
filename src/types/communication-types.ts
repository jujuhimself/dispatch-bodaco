
import { Emergency } from './emergency-types';

export interface Communication {
  id: string;
  message: string;
  sender: string;
  type: 'message' | 'voice' | 'whatsapp' | 'system';
  sent_at: string;
  emergency_id: string | null;
  responder_id: string | null;
  parent_id: string | null;
  read_by_ids: string[] | null;
  attachment_url: string | null;
}

export interface CommunicationChannel {
  id: string;
  name: string;
  description: string | null;
  type: 'emergency' | 'responder' | 'general';
  emergency_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChannelMember {
  channel_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at: string;
}

export interface ChatMessage extends Communication {
  isOutgoing?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface EmergencyWithChannel extends Emergency {
  channel?: CommunicationChannel;
}
