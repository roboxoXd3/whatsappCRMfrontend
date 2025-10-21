import { create } from 'zustand';
import { TenantProfile, ProfileUpdatePayload } from '@/lib/types/profile';
import { profileApi } from '@/lib/api/profile';

interface ProfileState {
  profile: TenantProfile | null;
  isLoading: boolean;
  error: string | null;
  currentSection: 'business_info' | 'meeting_settings' | 'ai_settings';
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>;
  setCurrentSection: (section: ProfileState['currentSection']) => void;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  currentSection: 'business_info',
  
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileApi.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load profile', isLoading: false });
    }
  },
  
  updateProfile: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await profileApi.updateProfile(payload);
      set({ profile: updated, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update profile', isLoading: false });
    }
  },
  
  setCurrentSection: (section) => set({ currentSection: section }),
  clearError: () => set({ error: null }),
}));


