'use client';

import { useEffect } from 'react';
import { useProfileStore } from '@/lib/stores/profile';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompletionBadge } from '@/components/profile/CompletionBadge';
import { AIPreview } from '@/components/profile/AIPreview';
import { BusinessInfoSection } from '@/components/profile/sections/BusinessInfoSection';
import { MeetingLinksSection } from '@/components/profile/sections/MeetingLinksSection';
import { AIBehaviorSection } from '@/components/profile/sections/AIBehaviorSection';
import { Building2, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, isLoading, fetchProfile, updateProfile } = useProfileStore();
  
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  const handleSaveBusinessInfo = async (data: any) => {
    try {
      await updateProfile({ section: 'business_info', data });
      toast.success('Business information updated successfully!');
    } catch (error) {
      toast.error('Failed to update business information');
    }
  };
  
  const handleSaveMeetingSettings = async (data: any) => {
    try {
      await updateProfile({ section: 'meeting_settings', data });
      toast.success('Meeting settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update meeting settings');
    }
  };
  
  const handleSaveAISettings = async (data: any) => {
    try {
      await updateProfile({ section: 'ai_settings', data });
      toast.success('AI settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update AI settings');
    }
  };
  
  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Configure your business information and AI behavior to personalize customer interactions
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CompletionBadge percentage={profile.profile_completion} />
        </div>
        <div className="lg:col-span-1">
          <Card className="p-4">
            <p className="text-sm text-gray-600">
              Complete your profile to help AI provide better, more personalized responses to customers.
            </p>
          </Card>
        </div>
      </div>
      
      <AIPreview profile={profile} />
      
      <div className="mt-6">
        <Tabs defaultValue="business" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Business Info</span>
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Meeting Links</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Behavior</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="business" className="mt-6">
            <BusinessInfoSection profile={profile} onSave={handleSaveBusinessInfo} />
          </TabsContent>
          
          <TabsContent value="meetings" className="mt-6">
            <MeetingLinksSection profile={profile} onSave={handleSaveMeetingSettings} />
          </TabsContent>
          
          <TabsContent value="ai" className="mt-6">
            <AIBehaviorSection profile={profile} onSave={handleSaveAISettings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


