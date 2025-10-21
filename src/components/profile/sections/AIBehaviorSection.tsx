'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TenantProfile, CalendlyTrigger } from '@/lib/types/profile';
import { Sparkles, Save } from 'lucide-react';
import { useState } from 'react';

interface AIBehaviorSectionProps {
  profile: TenantProfile;
  onSave: (data: Partial<TenantProfile['ai_settings']>) => Promise<void>;
}

export function AIBehaviorSection({ profile, onSave }: AIBehaviorSectionProps) {
  const [aiTone, setAiTone] = useState(profile.ai_settings.ai_tone);
  const [responseLength, setResponseLength] = useState(profile.ai_settings.ai_response_length);
  const [technicalDepth, setTechnicalDepth] = useState(profile.ai_settings.ai_technical_depth);
  const [triggers, setTriggers] = useState<CalendlyTrigger[]>(profile.ai_settings.calendly_offer_triggers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const triggerOptions: { value: CalendlyTrigger; label: string; description: string }[] = [
    { value: 'pricing_inquiry', label: 'Pricing Inquiry', description: 'When customer asks about pricing' },
    { value: 'high_interest', label: 'High Interest', description: 'When customer shows strong interest' },
    { value: 'technical_questions', label: 'Technical Questions', description: 'When customer has technical questions' },
    { value: 'after_3_messages', label: 'After 3 Messages', description: 'After exchanging 3+ messages' },
    { value: 'explicit_request', label: 'Explicit Request', description: 'Only when customer explicitly asks' },
  ];
  
  const handleToggleTrigger = (trigger: CalendlyTrigger) => {
    setTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await onSave({
      ai_tone: aiTone,
      ai_response_length: responseLength,
      ai_technical_depth: technicalDepth,
      calendly_offer_triggers: triggers,
    });
    
    setIsSubmitting(false);
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">AI Behavior Settings</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label>AI Tone *</Label>
            <Select value={aiTone} onValueChange={(value: 'professional' | 'friendly' | 'casual' | 'formal') => setAiTone(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">Overall communication style</p>
          </div>
          
          <div>
            <Label>Response Length *</Label>
            <Select value={responseLength} onValueChange={(value: 'concise' | 'balanced' | 'detailed') => setResponseLength(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise (100-150 words)</SelectItem>
                <SelectItem value="balanced">Balanced (150-200 words)</SelectItem>
                <SelectItem value="detailed">Detailed (200-300 words)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">How verbose responses should be</p>
          </div>
          
          <div>
            <Label>Technical Depth *</Label>
            <Select value={technicalDepth} onValueChange={(value: 'non_technical' | 'balanced' | 'technical') => setTechnicalDepth(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="non_technical">Non-technical</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">Level of technical detail</p>
          </div>
        </div>
        
        <div>
          <Label className="mb-3 block">When to Offer Calendly Link *</Label>
          <div className="space-y-3">
            {triggerOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={option.value}
                  checked={triggers.includes(option.value)}
                  onCheckedChange={() => handleToggleTrigger(option.value)}
                />
                <div className="flex-1">
                  <label
                    htmlFor={option.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                  <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save AI Settings'}
          </Button>
        </div>
      </form>
    </Card>
  );
}


