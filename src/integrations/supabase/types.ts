export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          notification_type: string
          read: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          notification_type?: string
          read?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          notification_type?: string
          read?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agencies: {
        Row: {
          active: boolean | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          coordinates: unknown | null
          created_at: string | null
          id: string
          location: string | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      alert_escalations: {
        Row: {
          alert_id: string
          created_at: string | null
          id: string
          level: Database["public"]["Enums"]["escalation_level"]
          reason: string
          resolved: boolean | null
          resolved_at: string | null
        }
        Insert: {
          alert_id: string
          created_at?: string | null
          id?: string
          level: Database["public"]["Enums"]["escalation_level"]
          reason: string
          resolved?: boolean | null
          resolved_at?: string | null
        }
        Update: {
          alert_id?: string
          created_at?: string | null
          id?: string
          level?: Database["public"]["Enums"]["escalation_level"]
          reason?: string
          resolved?: boolean | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_escalations_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "device_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_processors: {
        Row: {
          alert_id: string
          created_at: string | null
          details: Json | null
          id: string
          processor_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          alert_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          processor_type: string
          status: string
          updated_at?: string | null
        }
        Update: {
          alert_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          processor_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_processors_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "device_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          new_data: Json | null
          old_data: Json | null
          performed_at: string | null
          performed_by: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string
          joined_at: string | null
          last_read_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          channel_id: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_channels: {
        Row: {
          created_at: string | null
          description: string | null
          emergency_id: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          emergency_id?: string | null
          id?: string
          name: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          emergency_id?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_channels_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          attachment_url: string | null
          emergency_id: string | null
          id: string
          message: string
          parent_id: string | null
          read_by_ids: string[] | null
          responder_id: string | null
          sender: string
          sent_at: string
          type: string
        }
        Insert: {
          attachment_url?: string | null
          emergency_id?: string | null
          id?: string
          message: string
          parent_id?: string | null
          read_by_ids?: string[] | null
          responder_id?: string | null
          sender: string
          sent_at?: string
          type: string
        }
        Update: {
          attachment_url?: string | null
          emergency_id?: string | null
          id?: string
          message?: string
          parent_id?: string | null
          read_by_ids?: string[] | null
          responder_id?: string | null
          sender?: string
          sent_at?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      device_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          data: Json
          device_id: string
          emergency_id: string | null
          id: string
          location: unknown
          processed: boolean | null
          processed_at: string | null
          severity: number
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          data: Json
          device_id: string
          emergency_id?: string | null
          id?: string
          location: unknown
          processed?: boolean | null
          processed_at?: string | null
          severity: number
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          data?: Json
          device_id?: string
          emergency_id?: string | null
          id?: string
          location?: unknown
          processed?: boolean | null
          processed_at?: string | null
          severity?: number
        }
        Relationships: [
          {
            foreignKeyName: "device_alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "iot_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_alerts_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          active: boolean | null
          created_at: string | null
          html_content: string
          id: string
          name: string
          subject: string
          text_content: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          html_content: string
          id?: string
          name: string
          subject: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          html_content?: string
          id?: string
          name?: string
          subject?: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      emergencies: {
        Row: {
          assigned_at: string | null
          coordinates: unknown | null
          description: string | null
          device_alert_id: string | null
          id: string
          location: string
          notes: string | null
          priority: number
          reported_at: string
          resolution_details: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["emergency_status"]
          type: string
        }
        Insert: {
          assigned_at?: string | null
          coordinates?: unknown | null
          description?: string | null
          device_alert_id?: string | null
          id?: string
          location: string
          notes?: string | null
          priority?: number
          reported_at?: string
          resolution_details?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["emergency_status"]
          type: string
        }
        Update: {
          assigned_at?: string | null
          coordinates?: unknown | null
          description?: string | null
          device_alert_id?: string | null
          id?: string
          location?: string
          notes?: string | null
          priority?: number
          reported_at?: string
          resolution_details?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["emergency_status"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergencies_device_alert_id_fkey"
            columns: ["device_alert_id"]
            isOneToOne: false
            referencedRelation: "device_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergencies_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_agencies: {
        Row: {
          agency_id: string
          assigned_at: string | null
          created_at: string | null
          emergency_id: string
          id: string
          notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          assigned_at?: string | null
          created_at?: string | null
          emergency_id: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          assigned_at?: string | null
          created_at?: string | null
          emergency_id?: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_agencies_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_agencies_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_assignments: {
        Row: {
          assigned_at: string
          emergency_id: string
          eta: string | null
          id: string
          notes: string | null
          responder_id: string
          status: string | null
        }
        Insert: {
          assigned_at?: string
          emergency_id: string
          eta?: string | null
          id?: string
          notes?: string | null
          responder_id: string
          status?: string | null
        }
        Update: {
          assigned_at?: string
          emergency_id?: string
          eta?: string | null
          id?: string
          notes?: string | null
          responder_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_assignments_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_assignments_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource: string
          resource_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource: string
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource?: string
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          available_beds: number
          coordinates: unknown | null
          id: string
          location: string
          name: string
          notes: string | null
          specialist_available: boolean | null
          total_beds: number
        }
        Insert: {
          available_beds: number
          coordinates?: unknown | null
          id?: string
          location: string
          name: string
          notes?: string | null
          specialist_available?: boolean | null
          total_beds: number
        }
        Update: {
          available_beds?: number
          coordinates?: unknown | null
          id?: string
          location?: string
          name?: string
          notes?: string | null
          specialist_available?: boolean | null
          total_beds?: number
        }
        Relationships: []
      }
      iot_devices: {
        Row: {
          created_at: string | null
          device_id: string
          id: string
          last_heartbeat: string | null
          location: unknown | null
          metadata: Json | null
          name: string
          owner_id: string | null
          status: string | null
          type: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          id?: string
          last_heartbeat?: string | null
          location?: unknown | null
          metadata?: Json | null
          name: string
          owner_id?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          id?: string
          last_heartbeat?: string | null
          location?: unknown | null
          metadata?: Json | null
          name?: string
          owner_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          resource?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          last_sign_in_at: string | null
          name: string | null
          phone_number: string | null
          rejection_reason: string | null
          role: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          last_sign_in_at?: string | null
          name?: string | null
          phone_number?: string | null
          rejection_reason?: string | null
          role?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_sign_in_at?: string | null
          name?: string | null
          phone_number?: string | null
          rejection_reason?: string | null
          role?: string | null
        }
        Relationships: []
      }
      responder_skills: {
        Row: {
          certification_expiry: string | null
          certified: boolean | null
          created_at: string | null
          id: string
          proficiency_level: number
          responder_id: string
          skill_name: string
          updated_at: string | null
        }
        Insert: {
          certification_expiry?: string | null
          certified?: boolean | null
          created_at?: string | null
          id?: string
          proficiency_level?: number
          responder_id: string
          skill_name: string
          updated_at?: string | null
        }
        Update: {
          certification_expiry?: string | null
          certified?: boolean | null
          created_at?: string | null
          id?: string
          proficiency_level?: number
          responder_id?: string
          skill_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responder_skills_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      responders: {
        Row: {
          agency_id: string | null
          availability_status: string | null
          coordinates: unknown | null
          current_location: string | null
          id: string
          last_active: string | null
          last_status_change: string | null
          name: string
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["responder_status"] | null
          type: Database["public"]["Enums"]["responder_type"]
        }
        Insert: {
          agency_id?: string | null
          availability_status?: string | null
          coordinates?: unknown | null
          current_location?: string | null
          id?: string
          last_active?: string | null
          last_status_change?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["responder_status"] | null
          type: Database["public"]["Enums"]["responder_type"]
        }
        Update: {
          agency_id?: string | null
          availability_status?: string | null
          coordinates?: unknown | null
          current_location?: string | null
          id?: string
          last_active?: string | null
          last_status_change?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["responder_status"] | null
          type?: Database["public"]["Enums"]["responder_type"]
        }
        Relationships: [
          {
            foreignKeyName: "responders_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_id: string | null
          role: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id?: string | null
          role: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          notes: string | null
          responder_id: string
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          notes?: string | null
          responder_id: string
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          responder_id?: string
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_rules: {
        Row: {
          active: boolean | null
          created_at: string | null
          error_message: string
          field_name: string
          id: string
          rule_type: string
          rule_value: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          error_message: string
          field_name: string
          id?: string
          rule_type: string
          rule_value?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          error_message?: string
          field_name?: string
          id?: string
          rule_type?: string
          rule_value?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_user: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      approve_user_enhanced: {
        Args: { user_id_param: string; notes_param?: string }
        Returns: Json
      }
      log_admin_action: {
        Args: {
          action_param: string
          resource_param: string
          resource_id_param?: string
          old_values_param?: Json
          new_values_param?: Json
          metadata_param?: Json
        }
        Returns: string
      }
      reject_user: {
        Args: { user_id_param: string; reason_param?: string }
        Returns: boolean
      }
      reject_user_enhanced: {
        Args: {
          user_id_param: string
          reason_param?: string
          notes_param?: string
        }
        Returns: Json
      }
      validate_user_data: {
        Args: {
          email_param: string
          name_param: string
          phone_param?: string
          role_param?: string
        }
        Returns: Json
      }
    }
    Enums: {
      emergency_status:
        | "pending"
        | "assigned"
        | "in_transit"
        | "on_site"
        | "resolved"
        | "canceled"
      escalation_level: "normal" | "elevated" | "critical" | "emergency"
      responder_status: "available" | "on_call" | "off_duty"
      responder_type: "ambulance" | "bajaj" | "traffic"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      emergency_status: [
        "pending",
        "assigned",
        "in_transit",
        "on_site",
        "resolved",
        "canceled",
      ],
      escalation_level: ["normal", "elevated", "critical", "emergency"],
      responder_status: ["available", "on_call", "off_duty"],
      responder_type: ["ambulance", "bajaj", "traffic"],
    },
  },
} as const
