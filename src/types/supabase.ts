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
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          base_price: number
          description: string | null
          duration_minutes: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          base_price: number
          description?: string | null
          duration_minutes?: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          base_price?: number
          description?: string | null
          duration_minutes?: number
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          customer_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          price: number
          notes: string | null
          created_at: string
          updated_at: string
          series_id: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          price: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          series_id?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          service_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          series_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "appointment_series"
            referencedColumns: ["id"]
          }
        ]
      }
      appointment_series: {
        Row: {
          id: string
          customer_id: string
          service_id: string
          start_date: string
          estimated_end_date: string | null
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          service_id: string
          start_date: string
          estimated_end_date?: string | null
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          service_id?: string
          start_date?: string
          estimated_end_date?: string | null
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_series_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_series_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          appointment_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          subtotal: number
          tax: number
          total: number
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          invoice_number: string
          issue_date?: string
          due_date?: string
          subtotal: number
          tax?: number
          total: number
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          invoice_number?: string
          issue_date?: string
          due_date?: string
          subtotal?: number
          tax?: number
          total?: number
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          pdf_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          }
        ]
      }
      quotes: {
        Row: {
          id: string
          customer_id: string | null
          service_id: string | null
          residence_type: string
          area_m2: number
          service_modality: string
          valid_until: string | null
          discount: number
          taxes: number
          subtotal: number
          total: number
          status: 'rascunho' | 'enviado' | 'aceito' | 'recusado' | 'expirado'
          notes: string | null
          rich_content: Json | null
          pdf_url: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          title: string
          initial_report: string | null
          activities: Json | null
          payment_methods: Json | null
          contract_terms: string | null
          sign_url: string | null
          client_label: string | null
          client_subtitle: string | null
          signed_by_client: boolean
          signed_by_company: boolean
        }
        Insert: {
          id?: string
          customer_id?: string | null
          service_id?: string | null
          residence_type: string
          area_m2: number
          service_modality: string
          valid_until?: string | null
          discount?: number
          taxes?: number
          subtotal: number
          total: number
          status?: 'rascunho' | 'enviado' | 'aceito' | 'recusado' | 'expirado'
          notes?: string | null
          rich_content?: Json | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          title: string
          initial_report?: string | null
          activities?: Json | null
          payment_methods?: Json | null
          contract_terms?: string | null
          sign_url?: string | null
          client_label?: string | null
          client_subtitle?: string | null
          signed_by_client?: boolean
          signed_by_company?: boolean
        }
        Update: {
          id?: string
          customer_id?: string | null
          service_id?: string | null
          residence_type?: string
          area_m2?: number
          service_modality?: string
          valid_until?: string | null
          discount?: number
          taxes?: number
          subtotal?: number
          total?: number
          status?: 'rascunho' | 'enviado' | 'aceito' | 'recusado' | 'expirado'
          notes?: string | null
          rich_content?: Json | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          title?: string
          initial_report?: string | null
          activities?: Json | null
          payment_methods?: Json | null
          contract_terms?: string | null
          sign_url?: string | null
          client_label?: string | null
          client_subtitle?: string | null
          signed_by_client?: boolean
          signed_by_company?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      quote_images: {
        Row: {
          id: string
          quote_id: string
          url: string
          caption: string | null
        }
        Insert: {
          id?: string
          quote_id: string
          url: string
          caption?: string | null
        }
        Update: {
          id?: string
          quote_id?: string
          url?: string
          caption?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_images_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          }
        ]
      }
      quote_items: {
        Row: {
          id: string
          quote_id: string
          description: string
          quantity: number
          unit: string | null
          unit_price: number
          total: number
        }
        Insert: {
          id?: string
          quote_id: string
          description: string
          quantity?: number
          unit?: string | null
          unit_price: number
          total: number
        }
        Update: {
          id?: string
          quote_id?: string
          description?: string
          quantity?: number
          unit?: string | null
          unit_price?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          }
        ]
      }
      cashflow_transactions: {
        Row: {
          id: string
          type: 'income' | 'expense'
          category: string | null
          amount: number
          transaction_date: string
          client_id: string | null
          invoice_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: 'income' | 'expense'
          category?: string | null
          amount: number
          transaction_date: string
          client_id?: string | null
          invoice_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'income' | 'expense'
          category?: string | null
          amount?: number
          transaction_date?: string
          client_id?: string | null
          invoice_id?: string | null
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashflow_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashflow_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      company: {
        Row: {
          id: string
          name: string
          cnpj: string | null
          phone: string
          email: string
          address: Json
          bank_info: Json | null
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cnpj?: string | null
          phone: string
          email: string
          address: Json
          bank_info?: Json | null
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cnpj?: string | null
          phone?: string
          email?: string
          address?: Json
          bank_info?: Json | null
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string
          cpf: string
          address: Json | null
          position: string
          salary: number | null
          dailyRate: number
          active: boolean
          notes: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone: string
          cpf: string
          address?: Json | null
          position?: string
          salary?: number | null
          dailyRate?: number
          active?: boolean
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string
          cpf?: string
          address?: Json | null
          position?: string
          salary?: number | null
          dailyRate?: number
          active?: boolean
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
      employee_work_records: {
        Row: {
          id: string
          employeeId: string
          workDate: string
          workDays: number
          dailyRate: number
          totalAmount: number
          notes: string | null
          paid: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          employeeId: string
          workDate: string
          workDays?: number
          dailyRate?: number
          totalAmount: number
          notes?: string | null
          paid?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          employeeId?: string
          workDate?: string
          workDays?: number
          dailyRate?: number
          totalAmount?: number
          notes?: string | null
          paid?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
