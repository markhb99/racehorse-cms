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
          customer_id: string
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
          customer_id: string
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
          customer_id?: string
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
          {
            foreignKeyName: 'buyers_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
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
      customers: {
        Row: {
          id: string
          legal_first_name: string
          legal_last_name: string | null
          display_name: string
          entity_type: 'individual' | 'company' | 'trust' | 'partnership' | 'super_fund'
          email: string | null
          phone: string | null
          address_line1: string | null
          address_line2: string | null
          suburb: string | null
          state: string | null
          postcode: string | null
          country: string
          abn: string | null
          acn: string | null
          date_of_birth: string | null
          marketing_consent: boolean
          marketing_consent_at: string | null
          marketing_consent_source: string | null
          notes: string | null
          status: 'prospect' | 'active' | 'lapsed' | 'archived'
          tags: string[]
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          legal_first_name: string
          legal_last_name?: string | null
          display_name: string
          entity_type?: 'individual' | 'company' | 'trust' | 'partnership' | 'super_fund'
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          suburb?: string | null
          state?: string | null
          postcode?: string | null
          country?: string
          abn?: string | null
          acn?: string | null
          date_of_birth?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          marketing_consent_source?: string | null
          notes?: string | null
          status?: 'prospect' | 'active' | 'lapsed' | 'archived'
          tags?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          legal_first_name?: string
          legal_last_name?: string | null
          display_name?: string
          entity_type?: 'individual' | 'company' | 'trust' | 'partnership' | 'super_fund'
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          suburb?: string | null
          state?: string | null
          postcode?: string | null
          country?: string
          abn?: string | null
          acn?: string | null
          date_of_birth?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          marketing_consent_source?: string | null
          notes?: string | null
          status?: 'prospect' | 'active' | 'lapsed' | 'archived'
          tags?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      customer_communications: {
        Row: {
          id: string
          customer_id: string
          occurred_at: string
          type: 'call' | 'email' | 'sms' | 'meeting' | 'note' | 'document'
          direction: 'inbound' | 'outbound' | 'na'
          subject: string | null
          body: string | null
          follow_up_at: string | null
          follow_up_completed_at: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          occurred_at?: string
          type: 'call' | 'email' | 'sms' | 'meeting' | 'note' | 'document'
          direction?: 'inbound' | 'outbound' | 'na'
          subject?: string | null
          body?: string | null
          follow_up_at?: string | null
          follow_up_completed_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          occurred_at?: string
          type?: 'call' | 'email' | 'sms' | 'meeting' | 'note' | 'document'
          direction?: 'inbound' | 'outbound' | 'na'
          subject?: string | null
          body?: string | null
          follow_up_at?: string | null
          follow_up_completed_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'customer_communications_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
        ]
      }
      audit_log: {
        Row: {
          id: string
          occurred_at: string
          user_id: string | null
          user_email: string | null
          action:
            | 'create' | 'update' | 'delete' | 'soft_delete' | 'restore'
            | 'forget' | 'export' | 'view' | 'login' | 'logout'
            | 'consent_granted' | 'consent_revoked' | 'import'
          entity:
            | 'horse' | 'buyer' | 'customer' | 'customer_communication'
            | 'setting' | 'user' | 'export' | 'login' | 'logout' | 'import'
          entity_id: string | null
          payload: Record<string, unknown> | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          occurred_at?: string
          user_id?: string | null
          user_email?: string | null
          action:
            | 'create' | 'update' | 'delete' | 'soft_delete' | 'restore'
            | 'forget' | 'export' | 'view' | 'login' | 'logout'
            | 'consent_granted' | 'consent_revoked' | 'import'
          entity:
            | 'horse' | 'buyer' | 'customer' | 'customer_communication'
            | 'setting' | 'user' | 'export' | 'login' | 'logout' | 'import'
          entity_id?: string | null
          payload?: Record<string, unknown> | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: never
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
      customer_status: 'prospect' | 'active' | 'lapsed' | 'archived'
      customer_entity_type: 'individual' | 'company' | 'trust' | 'partnership' | 'super_fund'
      comm_type: 'call' | 'email' | 'sms' | 'meeting' | 'note' | 'document'
      comm_direction: 'inbound' | 'outbound' | 'na'
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
