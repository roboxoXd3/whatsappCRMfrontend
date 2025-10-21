'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { URLInput } from '../URLInput';
import { profileApi } from '@/lib/api/profile';
import { TenantProfile } from '@/lib/types/profile';
import { Calendar, Save } from 'lucide-react';

const schema = z.object({
  primary_calendly_url: z.string().url('Must be a valid Calendly URL'),
  calendly_link_label: z.string().min(3, 'Label is required'),
  auto_offer_meeting: z.enum(['never', 'qualified_only', 'all_interested']),
  meeting_duration: z.number(),
  availability_note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface MeetingLinksSectionProps {
  profile: TenantProfile;
  onSave: (data: Partial<TenantProfile['meeting_settings']>) => Promise<void>;
}

export function MeetingLinksSection({ profile, onSave }: MeetingLinksSectionProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: profile.meeting_settings,
  });
  
  const calendlyUrl = watch('primary_calendly_url');
  
  const onSubmit = async (data: FormData) => {
    await onSave(data);
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Meeting & Scheduling</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <URLInput
          label="Primary Calendly Link *"
          value={calendlyUrl}
          onChange={(value) => setValue('primary_calendly_url', value)}
          placeholder="https://calendly.com/your-company/discovery-call"
          helpText="Your main scheduling link for customer meetings"
          validateFn={profileApi.validateCalendlyUrl}
        />
        {errors.primary_calendly_url && (
          <p className="text-sm text-red-600">{errors.primary_calendly_url.message}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Link Label *</Label>
            <Input {...register('calendly_link_label')} placeholder="Discovery Call" />
            <p className="text-sm text-gray-500 mt-1">How the AI will refer to this meeting</p>
            {errors.calendly_link_label && (
              <p className="text-sm text-red-600 mt-1">{errors.calendly_link_label.message}</p>
            )}
          </div>
          
          <div>
            <Label>Meeting Duration *</Label>
            <Select 
              value={watch('meeting_duration').toString()} 
              onValueChange={(value) => setValue('meeting_duration', parseInt(value) as 15 | 30 | 45 | 60)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label>When should AI offer meeting link? *</Label>
          <Select 
            value={watch('auto_offer_meeting')} 
            onValueChange={(value: 'never' | 'qualified_only' | 'all_interested') => setValue('auto_offer_meeting', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never automatically</SelectItem>
              <SelectItem value="qualified_only">Qualified leads only</SelectItem>
              <SelectItem value="all_interested">All interested customers</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Controls when AI proactively shares your scheduling link
          </p>
        </div>
        
        <div>
          <Label>Availability Note</Label>
          <Textarea 
            {...register('availability_note')} 
            placeholder="Usually available Mon-Fri 9AM-5PM EST"
            rows={2}
          />
          <p className="text-sm text-gray-500 mt-1">
            Optional context about your availability
          </p>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Meeting Settings'}
          </Button>
        </div>
      </form>
    </Card>
  );
}


