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
import { TenantProfile } from '@/lib/types/profile';
import { Building2, Save } from 'lucide-react';

const schema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  industry: z.string().min(1, 'Please select an industry'),
  company_size: z.string().min(1, 'Please select company size'),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  company_description: z.string().min(20, 'Description should be at least 20 characters'),
  value_proposition: z.string().min(10, 'Value proposition should be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

interface BusinessInfoSectionProps {
  profile: TenantProfile;
  onSave: (data: Partial<TenantProfile['business_info']>) => Promise<void>;
}

export function BusinessInfoSection({ profile, onSave }: BusinessInfoSectionProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: profile.business_info,
  });
  
  const websiteUrl = watch('website_url');
  
  const onSubmit = async (data: FormData) => {
    await onSave(data);
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Business Information</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Company Name *</Label>
            <Input {...register('company_name')} placeholder="Acme Inc" />
            {errors.company_name && (
              <p className="text-sm text-red-600 mt-1">{errors.company_name.message}</p>
            )}
          </div>
          
          <div>
            <Label>Industry *</Label>
            <Select 
              value={watch('industry')} 
              onValueChange={(value) => setValue('industry', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="real_estate">Real Estate</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-sm text-red-600 mt-1">{errors.industry.message}</p>
            )}
          </div>
          
          <div>
            <Label>Company Size *</Label>
            <Select 
              value={watch('company_size')} 
              onValueChange={(value) => setValue('company_size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo (1)</SelectItem>
                <SelectItem value="small">Small (2-10)</SelectItem>
                <SelectItem value="medium">Medium (11-50)</SelectItem>
                <SelectItem value="large">Large (51-200)</SelectItem>
                <SelectItem value="enterprise">Enterprise (201+)</SelectItem>
              </SelectContent>
            </Select>
            {errors.company_size && (
              <p className="text-sm text-red-600 mt-1">{errors.company_size.message}</p>
            )}
          </div>
          
          <div>
            <URLInput
              label="Website URL"
              value={websiteUrl || ''}
              onChange={(value) => setValue('website_url', value)}
              placeholder="https://yourcompany.com"
              helpText="Your company website"
            />
            {errors.website_url && (
              <p className="text-sm text-red-600 mt-1">{errors.website_url.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <Label>Company Description *</Label>
          <Textarea 
            {...register('company_description')} 
            placeholder="Describe what your company does..."
            rows={4}
          />
          {errors.company_description && (
            <p className="text-sm text-red-600 mt-1">{errors.company_description.message}</p>
          )}
        </div>
        
        <div>
          <Label>Value Proposition *</Label>
          <Input 
            {...register('value_proposition')} 
            placeholder="What makes your company unique?"
          />
          <p className="text-sm text-gray-500 mt-1">One-liner that captures your unique value</p>
          {errors.value_proposition && (
            <p className="text-sm text-red-600 mt-1">{errors.value_proposition.message}</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Business Info'}
          </Button>
        </div>
      </form>
    </Card>
  );
}


