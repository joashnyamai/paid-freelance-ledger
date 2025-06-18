
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Please set up your Supabase project URL in the environment variables.')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please set up your Supabase anon key in the environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          email: string
          company: string | null
          address: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          company?: string | null
          address: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          company?: string | null
          address?: string
          phone?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          client_id: string
          client_name: string
          client_email: string
          client_address: string
          issue_date: string
          due_date: string
          subtotal: number
          tax: number
          total: number
          status: 'pending' | 'paid' | 'overdue'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          client_id: string
          client_name: string
          client_email: string
          client_address: string
          issue_date: string
          due_date: string
          subtotal: number
          tax: number
          total: number
          status: 'pending' | 'paid' | 'overdue'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          client_id?: string
          client_name?: string
          client_email?: string
          client_address?: string
          issue_date?: string
          due_date?: string
          subtotal?: number
          tax?: number
          total?: number
          status?: 'pending' | 'paid' | 'overdue'
          notes?: string | null
          created_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          rate: number
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity: number
          rate: number
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          rate?: number
          amount?: number
          created_at?: string
        }
      }
    }
  }
}
