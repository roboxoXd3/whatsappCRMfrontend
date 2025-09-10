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
      contacts: {
        Row: {
          id: string
          phone_number: string
          name: string | null
          email: string | null
          tags: string[] | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone_number: string
          name?: string | null
          email?: string | null
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone_number?: string
          name?: string | null
          email?: string | null
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_lists: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_list_memberships: {
        Row: {
          id: string
          contact_id: string
          list_id: string
          added_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          list_id: string
          added_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          list_id?: string
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_list_memberships_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_list_memberships_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          contact_id: string
          messages: Json
          last_message_at: string
          created_at: string
          updated_at: string
          handover_requested: boolean | null
          handover_timestamp: string | null
        }
        Insert: {
          id?: string
          contact_id: string
          messages?: Json
          last_message_at?: string
          created_at?: string
          updated_at?: string
          handover_requested?: boolean | null
          handover_timestamp?: string | null
        }
        Update: {
          id?: string
          contact_id?: string
          messages?: Json
          last_message_at?: string
          created_at?: string
          updated_at?: string
          handover_requested?: boolean | null
          handover_timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          }
        ]
      }
      bulk_campaigns: {
        Row: {
          id: string
          name: string
          message_content: string
          total_contacts: number
          successful_sends: number | null
          failed_sends: number | null
          status: string
          created_at: string
          updated_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          name: string
          message_content: string
          total_contacts: number
          successful_sends?: number | null
          failed_sends?: number | null
          status?: string
          created_at?: string
          updated_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          message_content?: string
          total_contacts?: number
          successful_sends?: number | null
          failed_sends?: number | null
          status?: string
          created_at?: string
          updated_at?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      message_results: {
        Row: {
          id: string
          campaign_id: string
          contact_id: string
          phone_number: string
          message_content: string
          status: string
          delivery_timestamp: string | null
          response_received: boolean | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          contact_id: string
          phone_number: string
          message_content: string
          status?: string
          delivery_timestamp?: string | null
          response_received?: boolean | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          contact_id?: string
          phone_number?: string
          message_content?: string
          status?: string
          delivery_timestamp?: string | null
          response_received?: boolean | null
          error_message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "bulk_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_results_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_details: {
        Row: {
          id: string
          contact_id: string
          company_name: string | null
          job_title: string | null
          industry: string | null
          company_size: string | null
          annual_revenue: number | null
          location: string | null
          lead_source: string | null
          lead_status: string | null
          lead_score: number | null
          budget_range: string | null
          timeline: string | null
          specific_needs: string | null
          technical_requirements: string | null
          preferred_contact_method: string | null
          preferred_contact_time: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          company_name?: string | null
          job_title?: string | null
          industry?: string | null
          company_size?: string | null
          annual_revenue?: number | null
          location?: string | null
          lead_source?: string | null
          lead_status?: string | null
          lead_score?: number | null
          budget_range?: string | null
          timeline?: string | null
          specific_needs?: string | null
          technical_requirements?: string | null
          preferred_contact_method?: string | null
          preferred_contact_time?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          company_name?: string | null
          job_title?: string | null
          industry?: string | null
          company_size?: string | null
          annual_revenue?: number | null
          location?: string | null
          lead_source?: string | null
          lead_status?: string | null
          lead_score?: number | null
          budget_range?: string | null
          timeline?: string | null
          specific_needs?: string | null
          technical_requirements?: string | null
          preferred_contact_method?: string | null
          preferred_contact_time?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_details_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_requirements: {
        Row: {
          id: string
          lead_id: string
          requirement_type: string | null
          requirement_details: string | null
          priority: string | null
          status: string | null
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          requirement_type?: string | null
          requirement_details?: string | null
          priority?: string | null
          status?: string | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          requirement_type?: string | null
          requirement_details?: string | null
          priority?: string | null
          status?: string | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_requirements_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_details"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_documents: {
        Row: {
          id: string
          lead_id: string
          document_type: string | null
          document_name: string | null
          document_url: string | null
          uploaded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          document_type?: string | null
          document_name?: string | null
          document_url?: string | null
          uploaded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          document_type?: string | null
          document_name?: string | null
          document_url?: string | null
          uploaded_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_details"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_interactions: {
        Row: {
          id: string
          lead_id: string
          interaction_type: string | null
          summary: string | null
          follow_up_actions: string | null
          next_follow_up_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          interaction_type?: string | null
          summary?: string | null
          follow_up_actions?: string | null
          next_follow_up_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          interaction_type?: string | null
          summary?: string | null
          follow_up_actions?: string | null
          next_follow_up_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_details"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      lead_summary: {
        Row: {
          id: string | null
          contact_id: string | null
          contact_name: string | null
          phone_number: string | null
          email: string | null
          company_name: string | null
          industry: string | null
          lead_status: string | null
          lead_score: number | null
          lead_source: string | null
          created_at: string | null
          total_requirements: number | null
          total_documents: number | null
          total_interactions: number | null
          last_interaction_date: string | null
        }
        Relationships: []
      }
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

// Helper types for easier use
export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']

export type BulkCampaign = Database['public']['Tables']['bulk_campaigns']['Row']
export type BulkCampaignInsert = Database['public']['Tables']['bulk_campaigns']['Insert']
export type BulkCampaignUpdate = Database['public']['Tables']['bulk_campaigns']['Update']

export type MessageResult = Database['public']['Tables']['message_results']['Row']
export type MessageResultInsert = Database['public']['Tables']['message_results']['Insert']
export type MessageResultUpdate = Database['public']['Tables']['message_results']['Update']

export type LeadDetail = Database['public']['Tables']['lead_details']['Row']
export type LeadDetailInsert = Database['public']['Tables']['lead_details']['Insert']
export type LeadDetailUpdate = Database['public']['Tables']['lead_details']['Update']

export type LeadRequirement = Database['public']['Tables']['lead_requirements']['Row']
export type LeadRequirementInsert = Database['public']['Tables']['lead_requirements']['Insert']
export type LeadRequirementUpdate = Database['public']['Tables']['lead_requirements']['Update']

export type LeadDocument = Database['public']['Tables']['lead_documents']['Row']
export type LeadDocumentInsert = Database['public']['Tables']['lead_documents']['Insert']
export type LeadDocumentUpdate = Database['public']['Tables']['lead_documents']['Update']

export type LeadInteraction = Database['public']['Tables']['lead_interactions']['Row']
export type LeadInteractionInsert = Database['public']['Tables']['lead_interactions']['Insert']
export type LeadInteractionUpdate = Database['public']['Tables']['lead_interactions']['Update']

export type ContactList = Database['public']['Tables']['contact_lists']['Row']
export type ContactListInsert = Database['public']['Tables']['contact_lists']['Insert']
export type ContactListUpdate = Database['public']['Tables']['contact_lists']['Update']

export type ContactListMembership = Database['public']['Tables']['contact_list_memberships']['Row']
export type ContactListMembershipInsert = Database['public']['Tables']['contact_list_memberships']['Insert']
export type ContactListMembershipUpdate = Database['public']['Tables']['contact_list_memberships']['Update']

export type LeadSummary = Database['public']['Views']['lead_summary']['Row']

// Enum types for better type safety
export type LeadSource = 'website' | 'whatsapp' | 'referral' | 'social_media' | 'trade_show' | 'other'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'converted' | 'lost'
export type ContactMethod = 'whatsapp' | 'email' | 'phone' | 'video_call'
export type Priority = 'high' | 'medium' | 'low'
export type RequirementStatus = 'open' | 'in_progress' | 'completed'
export type InteractionType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'other'
export type CampaignStatus = 'pending' | 'running' | 'completed' | 'failed'
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed'
