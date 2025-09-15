'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Search, 
  Users, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle,
  User,
  Phone,
  Send,
  MessageSquare,
  // Calendar,
  Eye,
  RefreshCw,
  Copy,
  Clock,
  Repeat,
  Building2,
  Shield,
  MessageCircle,
  Image,
  CheckCircle2
} from 'lucide-react';

interface Contact {
  id: string;
  name?: string;
  notify?: string;
  verified_name?: string;
  phone_number: string;
  jid?: string;
  wasender_jid?: string;
  display_name?: string;
  is_business_account?: boolean;
  status?: string;
  profile_image_url?: string;
  whatsapp_status?: string;
  raw_wasender_data?: {
    raw_data?: {
      id?: string;
      name?: string;
      notify?: string;
      verifiedName?: string;
      imgUrl?: string;
      status?: string;
    };
  };
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  returned: number;
  has_more: boolean;
}

interface ContactSearchResponse {
  success: boolean;
  data: {
    contacts: Contact[];
    pagination: PaginationInfo;
  };
}

interface GroupCreationResponse {
  success: boolean;
  data: {
    group: {
      id: string;
      group_jid: string;
      name: string;
      member_count: number;
      created_at: string | null;
    };
    participants: Array<{
      id: string;
      name: string;
      phone_number: string;
    }>;
    wasender_group_jid: string;
    validation_summary?: {
      missing_contacts_synced: number;
      invalid_contacts: number;
    };
  };
  error?: string;
  details?: {
    missing_contact_ids?: string[];
    invalid_contacts?: string[];
    sync_attempted?: boolean;
    sync_performed?: boolean;
  };
}

interface Group {
  id: string;
  group_jid: string;
  name: string;
  img_url?: string;
  status: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

interface GroupsResponse {
  success: boolean;
  data: {
    groups: Group[];
    total: number;
  };
}

interface SendMessageResponse {
  success: boolean;
  data: {
    message_id: string;
    group_jid: string;
    status: string;
    sent_at: string;
  };
  error?: string;
}

interface ScheduleMessageResponse {
  success: boolean;
  data: {
    scheduled_message_id: string;
    scheduled_at: string;
    next_send_at?: string;
    target_groups: string[];
    recurring_pattern?: string;
    status: string;
  };
  error?: string;
}

// Helper function to get the best available contact information
const getContactInfo = (contact: Contact) => {
  const rawData = contact.raw_wasender_data?.raw_data;
  
  return {
    name: contact.verified_name || rawData?.verifiedName || contact.name || rawData?.name || contact.notify || rawData?.notify || null,
    displayName: contact.notify || rawData?.notify || contact.name || rawData?.name || null,
    verifiedName: contact.verified_name || rawData?.verifiedName || null,
    profileImage: contact.profile_image_url || rawData?.imgUrl || null,
    status: contact.whatsapp_status || rawData?.status || contact.status || null,
    phoneNumber: contact.phone_number,
    jid: contact.wasender_jid || contact.jid || rawData?.id || null,
    isBusiness: contact.is_business_account || false,
    hasProfileImage: !!(contact.profile_image_url || rawData?.imgUrl) && (contact.profile_image_url !== 'changed' && rawData?.imgUrl !== 'changed')
  };
};

export default function GroupCreationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  // Profile picture cache
  const [profilePictureCache, setProfilePictureCache] = useState<Record<string, string | null>>({});
  const [loadingProfilePictures, setLoadingProfilePictures] = useState<Set<string>>(new Set());

  // Groups management state
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [selectedGroupForMessage, setSelectedGroupForMessage] = useState<Group | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  // Scheduling state
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isSchedulingMessage, setIsSchedulingMessage] = useState(false);

  // API base URL from environment
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Manual contact sync state
  const [isSyncingContacts, setIsSyncingContacts] = useState(false);

  // Fetch profile picture for a contact
  const fetchProfilePicture = async (phoneNumber: string) => {
    // Check cache first
    if (profilePictureCache[phoneNumber] !== undefined) {
      return profilePictureCache[phoneNumber];
    }

    // Check if already loading
    if (loadingProfilePictures.has(phoneNumber)) {
      return null;
    }

    // Mark as loading
    setLoadingProfilePictures(prev => new Set(prev).add(phoneNumber));

    try {
      const cleanPhone = phoneNumber.replace('@s.whatsapp.net', '').replace('@c.us', '');
      const response = await fetch(`${API_BASE}/api/group-messaging/contacts/${cleanPhone}/picture`);
      const data = await response.json();

      let pictureUrl = null;
      if (data.success && data.data?.profile_picture_url) {
        pictureUrl = data.data.profile_picture_url;
      }

      // Cache the result (even if null)
      setProfilePictureCache(prev => ({
        ...prev,
        [phoneNumber]: pictureUrl
      }));

      return pictureUrl;
    } catch (error) {
      console.error(`Failed to fetch profile picture for ${phoneNumber}:`, error);
      // Cache null result to avoid repeated requests
      setProfilePictureCache(prev => ({
        ...prev,
        [phoneNumber]: null
      }));
      return null;
    } finally {
      // Remove from loading set
      setLoadingProfilePictures(prev => {
        const newSet = new Set(prev);
        newSet.delete(phoneNumber);
        return newSet;
      });
    }
  };

  // Manual contact sync function (now efficient)
  const syncContactsFromWasender = async () => {
    setIsSyncingContacts(true);
    try {
      // Use the force-sync endpoint for manual sync (user explicitly requested it)
      const response = await fetch(`${API_BASE}/api/group-messaging/contacts/force-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();

      if (data.success) {
        const syncResult = data.data.sync_result;
        let message = `Full contact sync completed!`;
        if (syncResult) {
          message += `\n✅ New: ${syncResult.saved_new || 0}`;
          message += `\n🔄 Updated: ${syncResult.updated_existing || 0}`;
          message += `\n❌ Failed: ${syncResult.failed || 0}`;
          message += `\n📊 Total processed: ${data.data.total_contacts_processed || 0}`;
        }
        if (data.data.warning) {
          message += `\n⚠️ ${data.data.warning}`;
        }
        toast.success(message);
        
        // Refresh the contact search to show updated contacts
        searchContacts(searchTerm);
      } else {
        toast.error('Failed to sync contacts from WASender API');
      }
    } catch (error) {
      console.error('Contact sync error:', error);
      toast.error('Failed to sync contacts. Please check your connection.');
    } finally {
      setIsSyncingContacts(false);
    }
  };

  // Search contacts
  const searchContacts = async (term: string = '', offset: number = 0) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        q: term,
        limit: '50',
        offset: offset.toString(),
        only_wasender: 'true'
      });

      const response = await fetch(`${API_BASE}/api/group-messaging/contacts/search?${params}`);
      const data: ContactSearchResponse = await response.json();

      if (data.success) {
        if (offset === 0) {
          setContacts(data.data.contacts);
        } else {
          setContacts(prev => [...prev, ...data.data.contacts]);
        }
        setPagination(data.data.pagination);
      } else {
        toast.error('Failed to search contacts');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setIsSearching(false);
    }
  };

  // Load more contacts
  const loadMoreContacts = () => {
    if (pagination && pagination.has_more) {
      searchContacts(searchTerm, pagination.offset + pagination.limit);
    }
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchContacts(value);
  };

  // Toggle contact selection
  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  // Remove selected contact
  const removeSelectedContact = (contactId: string) => {
    setSelectedContacts(prev => prev.filter(c => c.id !== contactId));
  };

  // Load groups from API
  const loadGroups = async () => {
    setIsLoadingGroups(true);
    try {
      // Add cache-busting timestamp to ensure fresh data
      const response = await fetch(`${API_BASE}/api/group-messaging/groups?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data: GroupsResponse = await response.json();

      if (data.success) {
        console.log('Groups API Response:', data);
        console.log('Groups data:', data.data.groups);
        data.data.groups.forEach((group, index) => {
          console.log(`Group ${index}: ${group.name} - ${group.member_count} members`);
        });
        setGroups(data.data.groups);
      } else {
        console.error('Failed to load groups:', data);
        toast.error('Failed to load groups');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Send message to group
  const sendMessageToGroup = async (groupJid: string, message: string) => {
    setIsSendingMessage(true);
    try {
      const response = await fetch(`${API_BASE}/api/group-messaging/groups/${groupJid}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_content: message.trim(),
          message_type: 'text',
        }),
      });

      const data: SendMessageResponse = await response.json();

      if (data.success) {
        toast.success(`Message sent to "${selectedGroupForMessage?.name}" successfully!`);
        setMessageContent('');
        setSelectedGroupForMessage(null);
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!selectedGroupForMessage || !messageContent.trim()) {
      toast.error('Please select a group and enter a message');
      return;
    }

    sendMessageToGroup(selectedGroupForMessage.group_jid, messageContent);
  };

  // Schedule message to group
  const scheduleMessageToGroup = async (groupJid: string, message: string, scheduledAt: string, recurring?: string) => {
    setIsSchedulingMessage(true);
    try {
      const response = await fetch(`${API_BASE}/api/group-messaging/schedule-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_content: message.trim(),
          target_groups: [groupJid],
          scheduled_at: scheduledAt,
          message_type: 'text',
          recurring_pattern: recurring || null,
        }),
      });

      const data: ScheduleMessageResponse = await response.json();

      if (data.success) {
        const scheduledTime = new Date(data.data.scheduled_at).toLocaleString();
        const recurringText = data.data.recurring_pattern ? ` (${data.data.recurring_pattern})` : '';
        toast.success(`Message scheduled for ${scheduledTime}${recurringText} to "${selectedGroupForMessage?.name}"`);
        
        // Reset form
        setMessageContent('');
        setSelectedGroupForMessage(null);
        setIsScheduling(false);
        setScheduledDate('');
        setScheduledTime('');
        setIsRecurring(false);
      } else {
        toast.error(data.error || 'Failed to schedule message');
      }
    } catch (error) {
      toast.error('Failed to schedule message');
    } finally {
      setIsSchedulingMessage(false);
    }
  };

  // Handle schedule message
  const handleScheduleMessage = () => {
    if (!selectedGroupForMessage || !messageContent.trim()) {
      toast.error('Please select a group and enter a message');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select a date and time for scheduling');
      return;
    }

    // Combine date and time into ISO format
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const now = new Date();

    if (scheduledDateTime <= now) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    const scheduledAt = scheduledDateTime.toISOString();
    const recurring = isRecurring ? recurringPattern : undefined;

    scheduleMessageToGroup(selectedGroupForMessage.group_jid, messageContent, scheduledAt, recurring);
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get minimum time (if today is selected)
  const getMinTime = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (scheduledDate === today) {
      // Add 5 minutes to current time as minimum
      now.setMinutes(now.getMinutes() + 5);
      return now.toTimeString().slice(0, 5);
    }
    return '';
  };

  // Profile Image Component
  const ProfileImage: React.FC<{ contact: Contact; size?: 'sm' | 'md' }> = ({ contact, size = 'md' }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    
    const contactInfo = getContactInfo(contact);
    const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    
    useEffect(() => {
      const loadProfilePicture = async () => {
        if (!contactInfo.phoneNumber) return;
        
        // Check cache first
        const cached = profilePictureCache[contactInfo.phoneNumber];
        if (cached !== undefined) {
          setImageUrl(cached);
          return;
        }
        
        setIsLoading(true);
        try {
          const url = await fetchProfilePicture(contactInfo.phoneNumber);
          setImageUrl(url);
        } catch (error) {
          console.error('Error loading profile picture:', error);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadProfilePicture();
    }, [contactInfo.phoneNumber, profilePictureCache]);
    
    if (isLoading) {
      return (
        <div className={`${sizeClasses} rounded-full bg-gray-200 animate-pulse flex items-center justify-center`}>
          <Loader2 className={`${iconSize} text-gray-400 animate-spin`} />
        </div>
      );
    }
    
    if (imageUrl && !hasError) {
      return (
        <img
          src={imageUrl}
          alt={contactInfo.name || 'Profile'}
          className={`${sizeClasses} rounded-full object-cover border-2 border-gray-200`}
          onError={() => setHasError(true)}
        />
      );
    }
    
    // Fallback avatar
    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center`}>
        <User className={`${iconSize} text-white`} />
      </div>
    );
  };

  // Copy group JID to clipboard
  const copyGroupJid = async (groupJid: string) => {
    try {
      await navigator.clipboard.writeText(groupJid);
      toast.success('Group JID copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Create group
  const createGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (selectedContacts.length === 0) {
      toast.error('Please select at least one contact');
      return;
    }

    setIsCreatingGroup(true);
    try {
      // Show validation summary before creating
      const validContacts = selectedContacts.filter(c => c.phone_number && c.phone_number.trim());
      const invalidContacts = selectedContacts.filter(c => !c.phone_number || !c.phone_number.trim());
      
      if (invalidContacts.length > 0) {
        toast.error(`Found ${invalidContacts.length} contacts with invalid phone numbers. Please review your selection.`);
        setIsCreatingGroup(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/group-messaging/groups/create-with-contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_name: groupName.trim(),
          contact_ids: selectedContacts.map(c => c.id),
          auto_sync_missing: true, // Enable auto-sync for missing contacts
        }),
      });

      const data: GroupCreationResponse = await response.json();

      if (data.success) {
        const validationSummary = data.data.validation_summary;
        let successMessage = `Group "${data.data.group.name}" created successfully with ${data.data.group.member_count} members`;
        
        // Add validation details to success message
                 if (validationSummary) {
           if (validationSummary.missing_contacts_synced > 0) {
             successMessage += `\n✅ Efficiently synced ${validationSummary.missing_contacts_synced} missing contacts (targeted sync)`;
           }
          if (validationSummary.invalid_contacts > 0) {
            successMessage += `\n⚠️ Skipped ${validationSummary.invalid_contacts} contacts with invalid phone numbers`;
          }
        }
        
        toast.success(successMessage);
        
        // Reset form
        setGroupName('');
        setSelectedContacts([]);
        
        // Reload groups list to show the new group
        loadGroups();
      } else {
        // Enhanced error handling with specific details
        let errorMessage = data.error || 'Failed to create group';
        
        if (data.details) {
          if (data.details.missing_contact_ids) {
            errorMessage += `\n❌ Missing contacts: ${data.details.missing_contact_ids.length} contacts not found`;
          }
          if (data.details.invalid_contacts) {
            errorMessage += `\n❌ Invalid contacts: ${data.details.invalid_contacts.length} contacts have invalid phone numbers`;
          }
          if (data.details.sync_attempted && !data.details.sync_performed) {
            errorMessage += '\n🔄 Auto-sync was attempted but failed. Try syncing contacts manually.';
          }
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Group creation error:', error);
      toast.error('Failed to create group. Please check your connection and try again.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Load initial data
  useEffect(() => {
    searchContacts();
    loadGroups();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Groups Management</h1>
        <p className="text-gray-600">Create new groups from contacts and manage existing groups</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-5 w-5 inline mr-2" />
              Create Group
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="h-5 w-5 inline mr-2" />
              Manage Groups ({groups.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Create Group Tab */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Search & Selection */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Contacts
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={syncContactsFromWasender}
                disabled={isSyncingContacts}
                className="text-xs"
              >
                {isSyncingContacts ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync Contacts
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or phone number..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isSearching && contacts.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Searching...</span>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No contacts found
                </div>
              ) : (
                <>
                  {contacts.map((contact) => {
                    const isSelected = selectedContacts.some(c => c.id === contact.id);
                    const contactInfo = getContactInfo(contact);
                    
                    return (
                      <div
                        key={contact.id}
                        className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'hover:bg-gray-50 border-gray-200 hover:shadow-sm'
                        }`}
                        onClick={() => toggleContactSelection(contact)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {}}
                          className="pointer-events-none mt-1"
                        />
                        
                        {/* Profile Image */}
                        <div className="flex-shrink-0">
                          <ProfileImage contact={contact} size="md" />
                        </div>

                        {/* Contact Details */}
                        <div className="flex-1 min-w-0">
                          {/* Primary Name and Badges */}
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {contactInfo.name || `Contact ${contactInfo.phoneNumber}`}
                            </p>
                            
                            {/* Badges */}
                            <div className="flex items-center gap-1">
                              {contactInfo.verifiedName && (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {contactInfo.isBusiness && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Business
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Secondary Info */}
                          {contactInfo.displayName && contactInfo.displayName !== contactInfo.name && (
                            <div className="flex items-center gap-1 mb-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <p className="text-xs text-gray-600 truncate">
                                Display: {contactInfo.displayName}
                              </p>
                            </div>
                          )}

                          {/* Phone Number */}
                          <div className="flex items-center gap-1 mb-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-600 font-mono">
                              {contactInfo.phoneNumber}
                            </p>
                          </div>

                          {/* WhatsApp Status */}
                          {contactInfo.status && (
                            <div className="flex items-start gap-1">
                              <MessageCircle className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-gray-500 leading-relaxed" style={{ 
                                display: '-webkit-box', 
                                WebkitLineClamp: 2, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden' 
                              }}>
                                {contactInfo.status}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Load More Button */}
                  {pagination && pagination.has_more && (
                    <Button
                      variant="outline"
                      onClick={loadMoreContacts}
                      disabled={isSearching}
                      className="w-full"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Load More ({pagination.total - pagination.offset - pagination.returned} remaining)
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Contact Statistics */}
            {pagination && (
              <div className="text-xs text-gray-500 text-center space-y-1">
                <div>
                  Showing {pagination.returned} of {pagination.total} contacts
                </div>
                {contacts.length > 0 && (
                  <div className="flex justify-center gap-4">
                    <span>
                      🏢 {contacts.filter(c => getContactInfo(c).isBusiness).length} Business
                    </span>
                    <span>
                      ✅ {contacts.filter(c => getContactInfo(c).verifiedName).length} Verified
                    </span>
                    <span>
                      📷 {contacts.filter(c => {
                        const info = getContactInfo(c);
                        return profilePictureCache[info.phoneNumber] !== null && profilePictureCache[info.phoneNumber] !== undefined;
                      }).length} With Photos
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Contacts & Group Creation */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create Group
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Group Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <Input
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            {/* Selected Contacts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Contacts ({selectedContacts.length})
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedContacts.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    No contacts selected
                  </div>
                ) : (
                  selectedContacts.map((contact) => {
                    const contactInfo = getContactInfo(contact);
                    return (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          {/* Profile Image */}
                          <div className="flex-shrink-0">
                            <ProfileImage contact={contact} size="sm" />
                          </div>
                          
                          {/* Contact Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {contactInfo.name || `Contact ${contactInfo.phoneNumber}`}
                              </p>
                              {contactInfo.verifiedName && (
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                              )}
                              {contactInfo.isBusiness && (
                                <Building2 className="h-3 w-3 text-blue-600" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 font-mono">
                              {contactInfo.phoneNumber}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelectedContact(contact.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Create Group Button */}
            <Button
              onClick={createGroup}
              disabled={!groupName.trim() || selectedContacts.length === 0 || isCreatingGroup}
              className="w-full"
              size="lg"
            >
              {isCreatingGroup ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Group...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create WhatsApp Group
                </>
              )}
            </Button>

            {selectedContacts.length > 0 && (
              <p className="text-xs text-gray-500 text-center">
                Group will include you + {selectedContacts.length} selected contact{selectedContacts.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* Manage Groups Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Groups List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Your WhatsApp Groups
              </CardTitle>
              <Button
                variant="outline"
                onClick={loadGroups}
                disabled={isLoadingGroups}
                size="sm"
              >
                {isLoadingGroups ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingGroups ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading groups...</span>
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No groups found</p>
                  <p className="text-sm">Create your first group using the "Create Group" tab</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {group.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {group.member_count || 0} members
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {group.created_at ? new Date(group.created_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                        <Badge 
                          variant={group.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {group.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Input
                          value={group.group_jid}
                          readOnly
                          className="text-xs font-mono bg-gray-50"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyGroupJid(group.group_jid)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(`/groups/${encodeURIComponent(group.group_jid)}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            console.log('Button clicked for group:', group.name);
                            setSelectedGroupForMessage(group);
                            setIsScheduling(false);
                          }}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            console.log('Schedule button clicked for group:', group.name);
                            setSelectedGroupForMessage(group);
                            setIsScheduling(true);
                          }}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Schedule Message
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 p-4 rounded border">
              <p className="text-sm">Debug: selectedGroupForMessage = {selectedGroupForMessage ? selectedGroupForMessage.name : 'null'}</p>
            </div>
          )}

          {/* Send/Schedule Message Modal */}
          {selectedGroupForMessage && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isScheduling ? (
                    <>
                      <Clock className="h-5 w-5" />
                      Schedule Message to "{selectedGroupForMessage.name}"
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message to "{selectedGroupForMessage.name}"
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content
                  </label>
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSendingMessage || isSchedulingMessage}
                  />
                </div>

                {/* Scheduling Options */}
                {isScheduling && (
                  <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Schedule Options
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <Input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={getMinDate()}
                          disabled={isSchedulingMessage}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time
                        </label>
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          min={getMinTime()}
                          disabled={isSchedulingMessage}
                        />
                      </div>
                    </div>

                    {/* Recurring Options */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recurring"
                          checked={isRecurring}
                          onCheckedChange={(checked) => setIsRecurring(!!checked)}
                          disabled={isSchedulingMessage}
                        />
                        <label 
                          htmlFor="recurring" 
                          className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                          <Repeat className="h-4 w-4" />
                          Recurring Message
                        </label>
                      </div>

                      {isRecurring && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Repeat Pattern
                          </label>
                          <select
                            value={recurringPattern}
                            onChange={(e) => setRecurringPattern(e.target.value as 'daily' | 'weekly' | 'monthly')}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isSchedulingMessage}
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {isScheduling ? (
                    <Button
                      onClick={handleScheduleMessage}
                      disabled={!messageContent.trim() || !scheduledDate || !scheduledTime || isSchedulingMessage}
                      className="flex-1"
                    >
                      {isSchedulingMessage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Schedule Message
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || isSendingMessage}
                      className="flex-1"
                    >
                      {isSendingMessage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  )}
                  
                  {isScheduling && (
                    <Button
                      variant="outline"
                      onClick={() => setIsScheduling(false)}
                      disabled={isSchedulingMessage}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedGroupForMessage(null);
                      setMessageContent('');
                      setIsScheduling(false);
                      setScheduledDate('');
                      setScheduledTime('');
                      setIsRecurring(false);
                    }}
                    disabled={isSendingMessage || isSchedulingMessage}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="text-xs text-gray-500">
                  Group JID: {selectedGroupForMessage.group_jid}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
} 