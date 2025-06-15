
export interface Communication {
  id: string;
  sender: string;
  message: string;
  type: string;
  sent_at: string;
  emergency_id: string | null;
  responder_id: string | null;
  parent_id: string | null;
  read_by_ids: string[];
  attachment_url: string | null;
  isOutgoing?: boolean;
  status?: 'sending' | 'sent' | 'failed';
}

export interface ChatMessage extends Communication {
  isOutgoing?: boolean;
  status?: 'sending' | 'sent' | 'failed';
}

export interface CommunicationChannel {
  id: string;
  name: string;
  description: string | null;
  type: string;
  emergency_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChannelMember {
  channel_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
  role: string;
}
