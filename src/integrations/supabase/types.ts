export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      communications: {
        Row: {
          emergency_id: string | null
          id: string
          message: string
          responder_id: string | null
          sender: string
          sent_at: string
          type: string
        }
        Insert: {
          emergency_id?: string | null
          id?: string
          message: string
          responder_id?: string | null
          sender: string
          sent_at?: string
          type: string
        }
        Update: {
          emergency_id?: string | null
          id?: string
          message?: string
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
          resolved_at: string | null
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
          resolved_at?: string | null
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
          resolved_at?: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          last_sign_in_at: string | null
          name: string | null
          phone_number: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          last_sign_in_at?: string | null
          name?: string | null
          phone_number?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_sign_in_at?: string | null
          name?: string | null
          phone_number?: string | null
          role?: string | null
        }
        Relationships: []
      }
      responders: {
        Row: {
          coordinates: unknown | null
          current_location: string | null
          id: string
          last_active: string | null
          name: string
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["responder_status"] | null
          type: Database["public"]["Enums"]["responder_type"]
        }
        Insert: {
          coordinates?: unknown | null
          current_location?: string | null
          id?: string
          last_active?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["responder_status"] | null
          type: Database["public"]["Enums"]["responder_type"]
        }
        Update: {
          coordinates?: unknown | null
          current_location?: string | null
          id?: string
          last_active?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["responder_status"] | null
          type?: Database["public"]["Enums"]["responder_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
