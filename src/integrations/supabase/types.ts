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
      ADMIN: {
        Row: {
          created_at: string
          Email: string | null
          id: number
        }
        Insert: {
          created_at?: string
          Email?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          Email?: string | null
          id?: number
        }
        Relationships: []
      }
      PATOLOGIE: {
        Row: {
          Descrizione: string | null
          id: number
          Patologia: string
        }
        Insert: {
          Descrizione?: string | null
          id?: number
          Patologia?: string
        }
        Update: {
          Descrizione?: string | null
          id?: number
          Patologia?: string
        }
        Relationships: []
      }
      RECENSIONI: {
        Row: {
          "Cura Farmacologica": boolean | null
          Data: string
          "Difficoltà diagnosi": string | null
          "Disagio sociale": string
          "Efficacia farmaci": string
          Esperienza: string
          "Fastidio sintomi": string | null
          id: string
          Patologia: number
          "Possibilità guarigione": string | null
          Sintomi: string
          Stato: string
          Titolo: string
          Utente: number | null
        }
        Insert: {
          "Cura Farmacologica"?: boolean | null
          Data: string
          "Difficoltà diagnosi"?: string | null
          "Disagio sociale": string
          "Efficacia farmaci": string
          Esperienza: string
          "Fastidio sintomi"?: string | null
          id?: string
          Patologia: number
          "Possibilità guarigione"?: string | null
          Sintomi: string
          Stato: string
          Titolo: string
          Utente?: number | null
        }
        Update: {
          "Cura Farmacologica"?: boolean | null
          Data?: string
          "Difficoltà diagnosi"?: string | null
          "Disagio sociale"?: string
          "Efficacia farmaci"?: string
          Esperienza?: string
          "Fastidio sintomi"?: string | null
          id?: string
          Patologia?: number
          "Possibilità guarigione"?: string | null
          Sintomi?: string
          Stato?: string
          Titolo?: string
          Utente?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "RECENSIONI_condition (patologia)_fkey"
            columns: ["Patologia"]
            isOneToOne: false
            referencedRelation: "PATOLOGIE"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "RECENSIONI_Utente_fkey"
            columns: ["Utente"]
            isOneToOne: false
            referencedRelation: "UTENTI"
            referencedColumns: ["id"]
          },
        ]
      }
      UTENTI: {
        Row: {
          "Anno Nascita": string | null
          Email: string | null
          id: number
          Password: string | null
          Sesso: string | null
          "Time Stamp": string
          User: string | null
        }
        Insert: {
          "Anno Nascita"?: string | null
          Email?: string | null
          id?: number
          Password?: string | null
          Sesso?: string | null
          "Time Stamp"?: string
          User?: string | null
        }
        Update: {
          "Anno Nascita"?: string | null
          Email?: string | null
          id?: number
          Password?: string | null
          Sesso?: string | null
          "Time Stamp"?: string
          User?: string | null
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
