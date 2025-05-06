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
      emergencies: {
        Row: {
          assigned_at: string | null
          coordinates: unknown | null
          description: string | null
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
          id?: string
          location?: string
          notes?: string | null
          priority?: number
          reported_at?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["emergency_status"]
          type?: string
        }
        Relationships: []
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
      responder_status: ["available", "on_call", "off_duty"],
      responder_type: ["ambulance", "bajaj", "traffic"],
    },
  },
} as const
