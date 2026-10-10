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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      application_attribution: {
        Row: {
          application_id: string
          funnel: string | null
          landing_path: string | null
          ref: string | null
          referrer_host: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          application_id: string
          funnel?: string | null
          landing_path?: string | null
          ref?: string | null
          referrer_host?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          application_id?: string
          funnel?: string | null
          landing_path?: string | null
          ref?: string | null
          referrer_host?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_attribution_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_events: {
        Row: {
          actor_id: string | null
          application_id: string
          created_at: string
          data: Json
          event_type: string
          id: number
        }
        Insert: {
          actor_id?: string | null
          application_id: string
          created_at?: string
          data?: Json
          event_type: string
          id?: never
        }
        Update: {
          actor_id?: string | null
          application_id?: string
          created_at?: string
          data?: Json
          event_type?: string
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "application_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "application_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_files: {
        Row: {
          application_id: string
          category: string
          created_at: string
          id: string
          mime_type: string
          original_filename: string | null
          sha256: string
          size_bytes: number
          status: string
          storage_path: string
          uploaded_by_staff: string | null
        }
        Insert: {
          application_id: string
          category: string
          created_at?: string
          id?: string
          mime_type: string
          original_filename?: string | null
          sha256: string
          size_bytes: number
          status?: string
          storage_path: string
          uploaded_by_staff?: string | null
        }
        Update: {
          application_id?: string
          category?: string
          created_at?: string
          id?: string
          mime_type?: string
          original_filename?: string | null
          sha256?: string
          size_bytes?: number
          status?: string
          storage_path?: string
          uploaded_by_staff?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_files_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_files_uploaded_by_staff_fkey"
            columns: ["uploaded_by_staff"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["user_id"]
          },
        ]
      }
      application_follow_ups: {
        Row: {
          application_id: string
          created_at: string
          id: string
          idempotency_key: string
          mappe: Json | null
          message: string | null
          postal_code: string | null
          received_at: string
          start_date: string | null
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          idempotency_key: string
          mappe?: Json | null
          message?: string | null
          postal_code?: string | null
          received_at?: string
          start_date?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          idempotency_key?: string
          mappe?: Json | null
          message?: string | null
          postal_code?: string | null
          received_at?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_follow_ups_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          author_id: string | null
          body: string
          created_at: string
          id: string
        }
        Insert: {
          application_id: string
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
        }
        Update: {
          application_id?: string
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["user_id"]
          },
        ]
      }
      applications: {
        Row: {
          acquisition_channel: string
          answers: Json
          assigned_to: string | null
          candidate_id: string
          contact_channel: string
          content_hash: string | null
          created_at: string
          erasure_requested_at: string | null
          fill_duration_ms: number | null
          id: string
          idempotency_key_hash: string
          job_id: string
          job_reference_code: string | null
          job_title: string
          last_activity_at: string
          legal_hold: boolean
          mappe: Json | null
          privacy_notice_version: string
          purge_state: string
          question_set: string
          rating: number | null
          reference: string
          rejection_notified_at: string | null
          retention_until: string
          spam_signals: string[]
          stage: Database["public"]["Enums"]["application_stage"]
          stage_changed_at: string
          submitted_at: string
          suspected_spam: boolean
          talent_pool_consent_at: string | null
          talent_pool_revoked_at: string | null
          updated_at: string
        }
        Insert: {
          acquisition_channel: string
          answers?: Json
          assigned_to?: string | null
          candidate_id: string
          contact_channel: string
          content_hash?: string | null
          created_at?: string
          erasure_requested_at?: string | null
          fill_duration_ms?: number | null
          id?: string
          idempotency_key_hash: string
          job_id: string
          job_reference_code?: string | null
          job_title: string
          last_activity_at?: string
          legal_hold?: boolean
          mappe?: Json | null
          privacy_notice_version: string
          purge_state?: string
          question_set: string
          rating?: number | null
          reference: string
          rejection_notified_at?: string | null
          retention_until?: string
          spam_signals?: string[]
          stage?: Database["public"]["Enums"]["application_stage"]
          stage_changed_at?: string
          submitted_at: string
          suspected_spam?: boolean
          talent_pool_consent_at?: string | null
          talent_pool_revoked_at?: string | null
          updated_at?: string
        }
        Update: {
          acquisition_channel?: string
          answers?: Json
          assigned_to?: string | null
          candidate_id?: string
          contact_channel?: string
          content_hash?: string | null
          created_at?: string
          erasure_requested_at?: string | null
          fill_duration_ms?: number | null
          id?: string
          idempotency_key_hash?: string
          job_id?: string
          job_reference_code?: string | null
          job_title?: string
          last_activity_at?: string
          legal_hold?: boolean
          mappe?: Json | null
          privacy_notice_version?: string
          purge_state?: string
          question_set?: string
          rating?: number | null
          reference?: string
          rejection_notified_at?: string | null
          retention_until?: string
          spam_signals?: string[]
          stage?: Database["public"]["Enums"]["application_stage"]
          stage_changed_at?: string
          submitted_at?: string
          suspected_spam?: boolean
          talent_pool_consent_at?: string | null
          talent_pool_revoked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone_e164: string | null
          phone_raw: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone_e164?: string | null
          phone_raw: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone_e164?: string | null
          phone_raw?: string
          updated_at?: string
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          action: string
          application_id: string
          channel: string
          created_at: string
          id: string
          purpose: string
          recorded_by: string | null
          text_version: string
        }
        Insert: {
          action: string
          application_id: string
          channel: string
          created_at?: string
          id?: string
          purpose: string
          recorded_by?: string | null
          text_version: string
        }
        Update: {
          action?: string
          application_id?: string
          channel?: string
          created_at?: string
          id?: string
          purpose?: string
          recorded_by?: string | null
          text_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["user_id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string
          deactivated_at: string | null
          display_name: string
          is_active: boolean
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deactivated_at?: string | null
          display_name: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deactivated_at?: string | null
          display_name?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      rpc_rate_limit_hit: {
        Args: {
          p_action: string
          p_key_hash: string
          p_limit: number
          p_window_seconds: number
        }
        Returns: Json
      }
      rpc_submit_application: { Args: { payload: Json }; Returns: Json }
      rpc_submit_follow_up: { Args: { payload: Json }; Returns: Json }
    }
    Enums: {
      application_stage:
        | "neu"
        | "kontaktiert"
        | "gespraech"
        | "kennenlernen"
        | "angebot"
        | "eingestellt"
        | "abgesagt"
        | "zurueckgezogen"
      staff_role: "viewer" | "recruiter" | "admin"
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
    Enums: {
      application_stage: [
        "neu",
        "kontaktiert",
        "gespraech",
        "kennenlernen",
        "angebot",
        "eingestellt",
        "abgesagt",
        "zurueckgezogen",
      ],
      staff_role: ["viewer", "recruiter", "admin"],
    },
  },
} as const
