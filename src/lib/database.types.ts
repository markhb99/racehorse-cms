// Hand-written to mirror 001_init.sql + 002_settings.sql
// Replace with: npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts

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
      horses: {
        Row: {
          id: string
          display_name: string
          total_shares: number
          share_price_per_pct: number
          color: string
          status: 'active' | 'sold' | 'archived'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          display_name: string
          total_shares?: number
          share_price_per_pct?: number
          color?: string
          status?: 'active' | 'sold' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          total_shares?: number
          share_price_per_pct?: number
          color?: string
          status?: 'active' | 'sold' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      buyers: {
        Row: {
          id: string
          horse_id: string
          first_name: string
          last_name: string | null
          email: string | null
          phone: string | null
          shares_pct: number
          status:
            | 'completed'
            | 'awaiting_payment'
            | 'awaiting_docs'
            | 'awaiting_form'
            | 'pending'
            | 'not_proceeding'
          invoice_amount: number
          paid_amount: number
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          horse_id: string
          first_name: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          shares_pct: number
          status?:
            | 'completed'
            | 'awaiting_payment'
            | 'awaiting_docs'
            | 'awaiting_form'
            | 'pending'
            | 'not_proceeding'
          invoice_amount?: number
          paid_amount?: number
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          horse_id?: string
          first_name?: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          shares_pct?: number
          status?:
            | 'completed'
            | 'awaiting_payment'
            | 'awaiting_docs'
            | 'awaiting_form'
            | 'pending'
            | 'not_proceeding'
          invoice_amount?: number
          paid_amount?: number
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'buyers_horse_id_fkey'
            columns: ['horse_id']
            isOneToOne: false
            referencedRelation: 'horses'
            referencedColumns: ['id']
          },
        ]
      }
      settings: {
        Row: {
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      horse_status: 'active' | 'sold' | 'archived'
      buyer_status:
        | 'completed'
        | 'awaiting_payment'
        | 'awaiting_docs'
        | 'awaiting_form'
        | 'pending'
        | 'not_proceeding'
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
