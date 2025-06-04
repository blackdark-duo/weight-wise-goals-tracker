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
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      api_requests: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          created_at: string | null
          id: number
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          achieved: boolean | null
          created_at: string | null
          id: string
          start_weight: number
          target_date: string | null
          target_weight: number
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achieved?: boolean | null
          created_at?: string | null
          id?: string
          start_weight: number
          target_date?: string | null
          target_weight: number
          unit: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achieved?: boolean | null
          created_at?: string | null
          id?: string
          start_weight?: number
          target_date?: string | null
          target_weight?: number
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          deletion_date: string | null
          display_name: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          is_suspended: boolean | null
          last_webhook_date: string | null
          preferred_unit: string | null
          scheduled_for_deletion: boolean | null
          show_ai_insights: boolean | null
          timezone: string | null
          updated_at: string | null
          webhook_count: number | null
          webhook_limit: number | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string | null
          deletion_date?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
          is_suspended?: boolean | null
          last_webhook_date?: string | null
          preferred_unit?: string | null
          scheduled_for_deletion?: boolean | null
          show_ai_insights?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          webhook_count?: number | null
          webhook_limit?: number | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string | null
          deletion_date?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          is_suspended?: boolean | null
          last_webhook_date?: string | null
          preferred_unit?: string | null
          scheduled_for_deletion?: boolean | null
          show_ai_insights?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          webhook_count?: number | null
          webhook_limit?: number | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      webhook_config: {
        Row: {
          days: number | null
          default_webhook_limit: number
          fields: Json | null
          id: number
          include_account_fields: boolean | null
          include_goals: boolean | null
          include_user_fields: boolean | null
          include_weight_entries: boolean | null
          url: string | null
          webhook_version: string | null
        }
        Insert: {
          days?: number | null
          default_webhook_limit?: number
          fields?: Json | null
          id?: number
          include_account_fields?: boolean | null
          include_goals?: boolean | null
          include_user_fields?: boolean | null
          include_weight_entries?: boolean | null
          url?: string | null
          webhook_version?: string | null
        }
        Update: {
          days?: number | null
          default_webhook_limit?: number
          fields?: Json | null
          id?: number
          include_account_fields?: boolean | null
          include_goals?: boolean | null
          include_user_fields?: boolean | null
          include_weight_entries?: boolean | null
          url?: string | null
          webhook_version?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          id: string
          request_payload: Json
          response_payload: Json | null
          status: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_payload: Json
          response_payload?: Json | null
          status?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_payload?: Json
          response_payload?: Json | null
          status?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_rate_limits: {
        Row: {
          created_at: string | null
          id: string
          operation: string
          request_count: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          operation: string
          request_count?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          operation?: string
          request_count?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      weight_entries: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          time: string
          unit: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          time?: string
          unit: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          time?: string
          unit?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_user_id: string
          p_ip_address: string
          p_endpoint: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_webhook_rate_limit: {
        Args: {
          p_user_id: string
          p_operation: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      process_webhook: {
        Args: { p_webhook_data: Json; p_ip_address: string }
        Returns: Json
      }
      record_api_request: {
        Args: { p_user_id: string; p_ip_address: string; p_endpoint: string }
        Returns: undefined
      }
      record_webhook_request: {
        Args: { p_user_id: string; p_operation: string }
        Returns: undefined
      }
      submit_user_data: {
        Args: { p_data: Json; p_ip_address: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
