export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_checkins: {
        Row: {
          created_at: string
          day: string
          exercise_minutes: number
          id: string
          meals: number
          mood_score: number
          notes: string | null
          screen_hours: number
          sleep_hours: number
          updated_at: string
          user_id: string
          water_glasses: number
        }
        Insert: {
          created_at?: string
          day?: string
          exercise_minutes?: number
          id?: string
          meals?: number
          mood_score?: number
          notes?: string | null
          screen_hours?: number
          sleep_hours?: number
          updated_at?: string
          user_id: string
          water_glasses?: number
        }
        Update: {
          created_at?: string
          day?: string
          exercise_minutes?: number
          id?: string
          meals?: number
          mood_score?: number
          notes?: string | null
          screen_hours?: number
          sleep_hours?: number
          updated_at?: string
          user_id?: string
          water_glasses?: number
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      haven_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      haven_memories: {
        Row: {
          content: string
          created_at: string
          id: string
          kind: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          kind?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          kind?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mood_checkins: {
        Row: {
          answers: Json | null
          anxiety_score: number | null
          created_at: string
          id: string
          kind: string
          mood: string | null
          notes: string | null
          tips: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          anxiety_score?: number | null
          created_at?: string
          id?: string
          kind: string
          mood?: string | null
          notes?: string | null
          tips?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          anxiety_score?: number | null
          created_at?: string
          id?: string
          kind?: string
          mood?: string | null
          notes?: string | null
          tips?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activities: string[] | null
          age: number | null
          avatar_emoji: string | null
          created_at: string
          daily_routine: string | null
          display_name: string | null
          gender: string | null
          haven_personality: string | null
          hobbies: string[] | null
          id: string
          onboarded: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          activities?: string[] | null
          age?: number | null
          avatar_emoji?: string | null
          created_at?: string
          daily_routine?: string | null
          display_name?: string | null
          gender?: string | null
          haven_personality?: string | null
          hobbies?: string[] | null
          id: string
          onboarded?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          activities?: string[] | null
          age?: number | null
          avatar_emoji?: string | null
          created_at?: string
          daily_routine?: string | null
          display_name?: string | null
          gender?: string | null
          haven_personality?: string | null
          hobbies?: string[] | null
          id?: string
          onboarded?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      review_replies: {
        Row: {
          author_emoji: string | null
          author_id: string
          author_name: string | null
          body: string
          created_at: string
          id: string
          review_id: string
          updated_at: string
        }
        Insert: {
          author_emoji?: string | null
          author_id: string
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          review_id: string
          updated_at?: string
        }
        Update: {
          author_emoji?: string | null
          author_id?: string
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          review_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          avatar_emoji: string | null
          body: string | null
          created_at: string
          display_name: string | null
          feature_on_home: boolean
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_emoji?: string | null
          body?: string | null
          created_at?: string
          display_name?: string | null
          feature_on_home?: boolean
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_emoji?: string | null
          body?: string | null
          created_at?: string
          display_name?: string | null
          feature_on_home?: boolean
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ritual_completions: {
        Row: {
          created_at: string
          day: string
          id: string
          ritual_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day?: string
          id?: string
          ritual_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          ritual_id?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      symptom_sessions: {
        Row: {
          created_at: string
          id: string
          initial_description: string
          messages: Json
          recommendation: string | null
          recommendation_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          initial_description: string
          messages?: Json
          recommendation?: string | null
          recommendation_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          initial_description?: string
          messages?: Json
          recommendation?: string | null
          recommendation_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vitals_snapshots: {
        Row: {
          activity_steps: number | null
          created_at: string
          heart_rate: number | null
          id: string
          sleep_hours: number | null
          spo2: number | null
          stress_score: number | null
          temperature_c: number | null
          user_id: string
        }
        Insert: {
          activity_steps?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          sleep_hours?: number | null
          spo2?: number | null
          stress_score?: number | null
          temperature_c?: number | null
          user_id: string
        }
        Update: {
          activity_steps?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          sleep_hours?: number | null
          spo2?: number | null
          stress_score?: number | null
          temperature_c?: number | null
          user_id?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          created_at: string
          id: string
          patterns: Json | null
          summary: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          patterns?: Json | null
          summary: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          patterns?: Json | null
          summary?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      friend_wellness_streak: { Args: { _friend_id: string }; Returns: number }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      public_app_stats: { Args: never; Returns: Json }
      review_stats: {
        Args: never
        Returns: {
          average: number
          s1: number
          s2: number
          s3: number
          s4: number
          s5: number
          total: number
        }[]
      }
      search_users: {
        Args: { q: string }
        Returns: {
          avatar_emoji: string
          display_name: string
          id: string
          username: string
        }[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
