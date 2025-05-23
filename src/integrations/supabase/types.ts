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
      admin: {
        Row: {
          created_at: string
          email: string | null
          id: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: number
          review_id: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          review_id?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          review_id?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      condition_follows: {
        Row: {
          condition_id: number | null
          created_at: string | null
          id: number
          last_checked_at: string | null
          user_id: string | null
        }
        Insert: {
          condition_id?: number | null
          created_at?: string | null
          id?: number
          last_checked_at?: string | null
          user_id?: string | null
        }
        Update: {
          condition_id?: number | null
          created_at?: string | null
          id?: number
          last_checked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condition_follows_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "PATOLOGIE"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condition_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      condition_updates: {
        Row: {
          condition_id: number | null
          created_at: string | null
          id: number
          update_type: string
        }
        Insert: {
          condition_id?: number | null
          created_at?: string | null
          id?: number
          update_type: string
        }
        Update: {
          condition_id?: number | null
          created_at?: string | null
          id?: number
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "condition_updates_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "PATOLOGIE"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: number
          is_read: boolean | null
          related_comment_id: number | null
          related_review_id: number | null
          type: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          related_comment_id?: number | null
          related_review_id?: number | null
          type: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          related_comment_id?: number | null
          related_review_id?: number | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_comment_id_fkey"
            columns: ["related_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_review_id_fkey"
            columns: ["related_review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      PATOLOGIE: {
        Row: {
          created_at: string | null
          Descrizione: string | null
          id: number
          Patologia: string
        }
        Insert: {
          created_at?: string | null
          Descrizione?: string | null
          id?: number
          Patologia?: string
        }
        Update: {
          created_at?: string | null
          Descrizione?: string | null
          id?: number
          Patologia?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          id: number
          ip_address: string
          last_request: number
          request_count: number
        }
        Insert: {
          created_at?: string
          id?: never
          ip_address: string
          last_request: number
          request_count?: number
        }
        Update: {
          created_at?: string
          id?: never
          ip_address?: string
          last_request?: number
          request_count?: number
        }
        Relationships: []
      }
      review_urls: {
        Row: {
          condition: string | null
          created_at: string | null
          id: number
          review_id: number | null
          title: string | null
          url: string
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          id?: number
          review_id?: number | null
          title?: string | null
          url: string
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          id?: number
          review_id?: number | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_urls_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comments_count: number | null
          condition_id: number | null
          created_at: string | null
          diagnosis_difficulty: number | null
          experience: string
          has_medication: boolean | null
          healing_possibility: number | null
          id: number
          import_timestamp: string | null
          likes_count: number | null
          medication_effectiveness: number | null
          social_discomfort: number | null
          status: string | null
          symptoms: string
          symptoms_searchable: unknown | null
          symptoms_severity: number | null
          title: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          comments_count?: number | null
          condition_id?: number | null
          created_at?: string | null
          diagnosis_difficulty?: number | null
          experience: string
          has_medication?: boolean | null
          healing_possibility?: number | null
          id?: number
          import_timestamp?: string | null
          likes_count?: number | null
          medication_effectiveness?: number | null
          social_discomfort?: number | null
          status?: string | null
          symptoms: string
          symptoms_searchable?: unknown | null
          symptoms_severity?: number | null
          title: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          comments_count?: number | null
          condition_id?: number | null
          created_at?: string | null
          diagnosis_difficulty?: number | null
          experience?: string
          has_medication?: boolean | null
          healing_possibility?: number | null
          id?: number
          import_timestamp?: string | null
          likes_count?: number | null
          medication_effectiveness?: number | null
          social_discomfort?: number | null
          status?: string | null
          symptoms?: string
          symptoms_searchable?: unknown | null
          symptoms_severity?: number | null
          title?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "PATOLOGIE"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["username"]
          },
        ]
      }
      site_content: {
        Row: {
          content: string
          created_at: string | null
          id: number
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sitemap_files: {
        Row: {
          filename: string
          id: number
          last_modified: string | null
          url_count: number | null
        }
        Insert: {
          filename: string
          id?: never
          last_modified?: string | null
          url_count?: number | null
        }
        Update: {
          filename?: string
          id?: never
          last_modified?: string | null
          url_count?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          birth_year: string | null
          created_at: string
          email: string | null
          gdpr_consent: boolean | null
          gdpr_consent_date: string | null
          gender: string | null
          id: string
          username: string
        }
        Insert: {
          birth_year?: string | null
          created_at?: string
          email?: string | null
          gdpr_consent?: boolean | null
          gdpr_consent_date?: string | null
          gender?: string | null
          id: string
          username: string
        }
        Update: {
          birth_year?: string | null
          created_at?: string
          email?: string | null
          gdpr_consent?: boolean | null
          gdpr_consent_date?: string | null
          gender?: string | null
          id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_insert_user: {
        Args: {
          p_id: string
          p_username: string
          p_email: string
          p_birth_year: string
          p_gender: string
          p_created_at: string
          p_gdpr_consent: boolean
        }
        Returns: Json
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      populate_review_urls: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      unaccent: {
        Args: {
          "": string
        }
        Returns: string
      }
      unaccent_init: {
        Args: {
          "": unknown
        }
        Returns: unknown
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
