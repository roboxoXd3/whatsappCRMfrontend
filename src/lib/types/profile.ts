export interface TenantProfile {
  id: string;
  tenant_id: string;
  user_id: string;
  
  // Business Information
  business_info: {
    company_name: string;
    industry: string;
    company_size: string;
    website_url: string;
    company_description: string;
    value_proposition: string;
  };
  
  // Meeting Links
  meeting_settings: {
    primary_calendly_url: string;
    calendly_link_label: string;
    auto_offer_meeting: 'never' | 'qualified_only' | 'all_interested';
    meeting_duration: 15 | 30 | 45 | 60;
    availability_note: string;
  };
  
  // AI Behavior Settings
  ai_settings: {
    ai_tone: 'professional' | 'friendly' | 'casual' | 'formal';
    ai_response_length: 'concise' | 'balanced' | 'detailed';
    ai_technical_depth: 'non_technical' | 'balanced' | 'technical';
    calendly_offer_triggers: CalendlyTrigger[];
  };
  
  // Metadata
  profile_completion: number;
  created_at: string;
  updated_at: string;
}

export type CalendlyTrigger = 
  | 'pricing_inquiry' 
  | 'high_interest' 
  | 'technical_questions' 
  | 'after_3_messages'
  | 'explicit_request';

export interface ProfileUpdatePayload {
  section: 'business_info' | 'meeting_settings' | 'ai_settings';
  data: Partial<TenantProfile[keyof Pick<TenantProfile, 'business_info' | 'meeting_settings' | 'ai_settings'>]>;
}


