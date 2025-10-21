import { TenantProfile, ProfileUpdatePayload } from '@/lib/types/profile';

// Mock data for development
const mockProfile: TenantProfile = {
  id: '1',
  tenant_id: 'tenant-123',
  user_id: 'user-123',
  business_info: {
    company_name: '',
    industry: '',
    company_size: '',
    website_url: '',
    company_description: '',
    value_proposition: '',
  },
  meeting_settings: {
    primary_calendly_url: '',
    calendly_link_label: 'Discovery Call',
    auto_offer_meeting: 'qualified_only',
    meeting_duration: 30,
    availability_note: '',
  },
  ai_settings: {
    ai_tone: 'professional',
    ai_response_length: 'balanced',
    ai_technical_depth: 'balanced',
    calendly_offer_triggers: ['pricing_inquiry', 'high_interest'],
  },
  profile_completion: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function calculateCompletion(profile: TenantProfile): number {
  const fields = [
    profile.business_info.company_name,
    profile.business_info.industry,
    profile.business_info.website_url,
    profile.business_info.company_description,
    profile.meeting_settings.primary_calendly_url,
    profile.ai_settings.ai_tone,
  ];
  
  const filled = fields.filter(f => f && f.trim() !== '').length;
  return Math.round((filled / fields.length) * 100);
}

export const profileApi = {
  getProfile: async (): Promise<TenantProfile> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Load from localStorage for persistence during development
    const stored = localStorage.getItem('tenant_profile');
    return stored ? JSON.parse(stored) : mockProfile;
  },
  
  updateProfile: async (payload: ProfileUpdatePayload): Promise<TenantProfile> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const current = await profileApi.getProfile();
    const updated = {
      ...current,
      [payload.section]: { ...current[payload.section], ...payload.data },
      updated_at: new Date().toISOString(),
    };
    
    // Calculate completion percentage
    updated.profile_completion = calculateCompletion(updated);
    
    localStorage.setItem('tenant_profile', JSON.stringify(updated));
    return updated;
  },
  
  validateCalendlyUrl: async (url: string): Promise<{ valid: boolean; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!url.includes('calendly.com')) {
      return { valid: false, message: 'Must be a valid Calendly URL' };
    }
    return { valid: true };
  },
};


