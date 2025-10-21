'use client';

import { Card } from '@/components/ui/card';
import { MessageSquare, Sparkles } from 'lucide-react';
import { TenantProfile } from '@/lib/types/profile';

interface AIPreviewProps {
  profile: TenantProfile | null;
}

export function AIPreview({ profile }: AIPreviewProps) {
  if (!profile) return null;
  
  const generatePreview = () => {
    const { business_info, meeting_settings, ai_settings } = profile;
    
    if (meeting_settings.primary_calendly_url && ai_settings.calendly_offer_triggers.includes('pricing_inquiry')) {
      return `"I'd love to discuss our pricing options with you!

📅 ${meeting_settings.calendly_link_label}: ${meeting_settings.primary_calendly_url}

This ${meeting_settings.meeting_duration}-minute call will help me understand your needs better."`;
    }
    
    return `"Hello! I'm here to help you with ${business_info.company_name || 'our services'}. How can I assist you today?"`;
  };
  
  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Sparkles className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">AI Preview</span>
          </div>
          <p className="text-sm text-gray-600 italic leading-relaxed whitespace-pre-line">
            {generatePreview()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This is how your AI will respond based on current settings
          </p>
        </div>
      </div>
    </Card>
  );
}


