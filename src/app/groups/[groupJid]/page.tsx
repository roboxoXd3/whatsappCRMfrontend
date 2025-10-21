'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import { 
  ArrowLeft,
  Users, 
  Settings, 
  Send,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  MessageSquare,
  Edit3,
  Save,
  X,
  Loader2,
  Copy,
  Phone,
  Mail,
  MoreVertical,
  Trash2,
  UserCheck,
  Volume2,
  VolumeX,
  Lock,
  Unlock
} from 'lucide-react';

// Types
interface GroupParticipant {
  id: string;
  jid: string;
  admin: 'superadmin' | 'admin' | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface GroupMetadata {
  jid: string;
  subject: string;
  creation: number;
  owner: string;
  desc?: string;
  participants: GroupParticipant[];
  announce?: boolean;
  restrict?: boolean;
  size?: number;
}

interface Contact {
  id: string;
  name?: string;
  notify?: string;
  phone_number: string;
  jid?: string;
  is_manual?: boolean;  // Flag for manually added numbers
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupJid = decodeURIComponent(params.groupJid as string);
  
  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  
  // State management
  const [groupMetadata, setGroupMetadata] = useState<GroupMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [apiCallStatus, setApiCallStatus] = useState<string>('');
  
  // Form states
  const [editedSubject, setEditedSubject] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedAnnounce, setEditedAnnounce] = useState(false);
  const [editedRestrict, setEditedRestrict] = useState(false);
  
  // Message state
  const [messageContent, setMessageContent] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [showMentionsDropdown, setShowMentionsDropdown] = useState(false);
  
  // Participant management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  // Sequential API call helper with delay
  const makeApiCallWithDelay = async (url: string, delay: number = 1000) => {
    if (delay > 0) {
      setApiCallStatus(`Waiting ${delay/1000}s to prevent rate limiting...`);
      console.log(`Waiting ${delay}ms before API call to: ${url}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setApiCallStatus('Making API call...');
    console.log(`Making API call to: ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    console.log(`API response from ${url}:`, data);
    setApiCallStatus('');
    return { response, data };
  };

  // Load group metadata with aggressive rate limiting protection
  const loadGroupMetadata = async () => {
    // Prevent too frequent API calls (minimum 5 seconds between calls)
    const now = Date.now();
    if (now - lastLoadTime < 5000) {
      console.log('Skipping API call - too frequent (minimum 5s gap required)');
      return;
    }
    setLastLoadTime(now);
    
    setIsLoading(true);
    setErrorType(null);
    
    try {
      console.log('Starting group metadata loading with aggressive rate limiting...');
      
      // Step 1: Load basic group metadata with significant delay to avoid rate limiting
      const { response, data } = await makeApiCallWithDelay(
        `${API_BASE}/api/group-messaging/groups/${encodeURIComponent(groupJid)}/metadata?_t=${Date.now()}`,
        3000 // 3 second delay even for first call
      );

      if (data.success && data.data) {
        setGroupMetadata(data.data);
        setEditedSubject(data.data.subject || '');
        setEditedDescription(data.data.desc || '');
        setEditedAnnounce(data.data.announce || false);
        setEditedRestrict(data.data.restrict || false);
        setErrorType(null); // Clear any previous errors
      } else if (data.rate_limited || response.status === 429) {
        const retryAfterSeconds = data.retry_after || 45; // Default to 45 seconds
        setRetryAfter(retryAfterSeconds);
        setErrorType('rate_limited');
        toast.error(`Rate limit exceeded. Auto-retrying in ${retryAfterSeconds} seconds...`);
        
        console.log(`Rate limited. Will retry in ${retryAfterSeconds} seconds`);
        
        // Auto-retry after the specified time with additional buffer
        const totalWaitTime = retryAfterSeconds + 5; // Add 5 second buffer
        
        // Countdown timer
        const countdownInterval = setInterval(() => {
          setRetryAfter(prev => {
            if (prev && prev > 1) {
              return prev - 1;
            } else {
              clearInterval(countdownInterval);
              return null;
            }
          });
        }, 1000);
        
        setTimeout(() => {
          clearInterval(countdownInterval);
          setRetryAfter(null);
          setErrorType(null);
          console.log('Retrying after rate limit cooldown...');
          loadGroupMetadata();
        }, totalWaitTime * 1000);
      } else if (data.connection_error || data.db_error) {
        setErrorType('connection');
        toast.error('Connection issue detected. Retrying in 10 seconds...');
        
        // Auto-retry for connection errors
        setTimeout(() => {
          loadGroupMetadata();
        }, 10000);
      } else if (data.timeout_error) {
        setErrorType('timeout');
        toast.error('Request timed out. Retrying in 5 seconds...');
        
        // Auto-retry for timeout errors
        setTimeout(() => {
          loadGroupMetadata();
        }, 5000);
      } else if (data.network_error) {
        setErrorType('network');
        toast.error('Network error. Please check your connection and try again.');
      } else {
        setErrorType('general');
        toast.error(data.error || 'Failed to load group metadata');
      }
    } catch (error) {
      console.error('Error loading group metadata:', error);
      
      // Check if it's a network error or server error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to load group details. Please try again later.');
      }
      
      // Set a retry mechanism for network errors
      setTimeout(() => {
        if (groupJid) {
          loadGroupMetadata();
        }
      }, 5000); // Retry after 5 seconds
    } finally {
      setIsLoading(false);
    }
  };

  // Update group settings with sequential approach
  const updateGroupSettings = async () => {
    if (!groupMetadata) return;
    
    setIsSaving(true);
    try {
      console.log('Updating group settings with delay...');
      
      // Add delay before making the API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      const response = await fetch(`${API_BASE}/api/group-messaging/groups/${encodeURIComponent(groupJid)}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: editedSubject.trim(),
          description: editedDescription.trim(),
          announce: editedAnnounce,
          restrict: editedRestrict,
        }),
      });

      const data = await response.json();
      console.log('Update settings response:', data);

      if (data.success) {
        toast.success('Group settings updated successfully');
        setIsEditing(false);
        loadGroupMetadata(); // Refresh metadata
      } else {
        toast.error(data.error || 'Failed to update group settings');
      }
    } catch (error) {
      console.error('Error updating group settings:', error);
      toast.error('Failed to connect to server');
    } finally {
      setIsSaving(false);
    }
  };

  // Send message to group with sequential approach
  const sendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSendingMessage(true);
    try {
      console.log('Sending message with delay...');
      
      // Add delay before making the API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
      
      // Build mentions array (NO TEXT MODIFICATION)
      const mentionsArray = selectedMentions.map(jid => {
        // Ensure JID format: phonenumber@s.whatsapp.net
        if (!jid.includes('@')) {
          return `${jid}@s.whatsapp.net`;
        }
        return jid;
      });
      
      // Use message content as-is (user controls where @mentions go)
      const payload: any = {
        message_content: messageContent.trim(),  // No modification!
        message_type: 'text',
      };
      
      // Add mentions array for notifications
      if (mentionsArray.length > 0) {
        payload.mentions = mentionsArray;
      }
      
      const response = await fetch(`${API_BASE}/api/group-messaging/groups/${encodeURIComponent(groupJid)}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Send message response:', data);

      if (data.success) {
        toast.success('Message sent successfully');
        setMessageContent('');
        setSelectedMentions([]);
        setShowMentionsDropdown(false);
      } else if (data.rate_limited) {
        const retryAfterSeconds = data.retry_after || 60;
        toast.error(`Rate limit exceeded. Please wait ${retryAfterSeconds} seconds before trying again.`);
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to connect to server');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Search contacts with sequential approach
  const searchContacts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        limit: '20',
        offset: '0',
        only_wasender: 'false'  // Changed to false to search ALL database contacts
      });

      // Use sequential API call with delay to prevent rate limiting
      const { response, data } = await makeApiCallWithDelay(
        `${API_BASE}/api/group-messaging/contacts/search?${params}`,
        1500 // 1.5 second delay
      );

      if (data.success) {
        setSearchResults(data.data.contacts || []);
      } else {
        setSearchResults([]);
        if (data.rate_limited) {
          toast.error('Rate limited. Please wait before searching again.');
        }
      }
    } catch (error) {
      console.error('Error searching contacts:', error);
      setSearchResults([]);
      toast.error('Failed to search contacts. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Add participants to group with sequential approach
  const addParticipants = async () => {
    if (selectedContacts.length === 0) {
      toast.error('Please select contacts to add');
      return;
    }

    setIsAddingParticipant(true);
    try {
      const participants = selectedContacts.map(contact => 
        contact.phone_number.replace('+', '').replace('@s.whatsapp.net', '')
      );

      console.log('Adding participants with delay...');
      
      // Add delay before making the API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      const response = await fetch(`${API_BASE}/api/group-messaging/groups/${encodeURIComponent(groupJid)}/participants/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: participants,
        }),
      });

      const data = await response.json();
      console.log('Add participants response:', data);

      if (data.success) {
        toast.success(`Added ${selectedContacts.length} participant(s) successfully`);
        setSelectedContacts([]);
        setSearchQuery('');
        setSearchResults([]);
        loadGroupMetadata(); // Refresh metadata
      } else {
        toast.error(data.error || 'Failed to add participants');
      }
    } catch (error) {
      console.error('Error adding participants:', error);
      toast.error('Failed to connect to server');
    } finally {
      setIsAddingParticipant(false);
    }
  };

  // Remove participant from group with sequential approach
  const removeParticipant = async (participantJid: string, participantName?: string) => {
    const phoneNumber = participantJid.replace('@s.whatsapp.net', '').replace('@lid', '');
    
    try {
      console.log('Removing participant with delay...');
      
      // Add delay before making the API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      const response = await fetch(`${API_BASE}/api/group-messaging/groups/${encodeURIComponent(groupJid)}/participants/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: [phoneNumber],
        }),
      });

      const data = await response.json();
      console.log('Remove participant response:', data);

      if (data.success) {
        toast.success(`Removed ${participantName || 'participant'} successfully`);
        loadGroupMetadata(); // Refresh metadata
      } else {
        toast.error(data.error || 'Failed to remove participant');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to connect to server');
    }
  };

  // Handle search input change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchContacts(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load metadata on component mount
  useEffect(() => {
    if (groupJid) {
      loadGroupMetadata();
    }
  }, [groupJid]);

  // Cancel editing
  const cancelEditing = () => {
    if (groupMetadata) {
      setEditedSubject(groupMetadata.subject || '');
      setEditedDescription(groupMetadata.desc || '');
      setEditedAnnounce(groupMetadata.announce || false);
      setEditedRestrict(groupMetadata.restrict || false);
    }
    setIsEditing(false);
  };

  // Format creation date
  const formatCreationDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get participant display name
  const getParticipantName = (participant: GroupParticipant) => {
    const phoneNumber = participant.jid.replace('@s.whatsapp.net', '').replace('@lid', '');
    return phoneNumber;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {retryAfter 
              ? `Rate limited. Auto-retrying in ${retryAfter} seconds...` 
              : apiCallStatus
              ? apiCallStatus
              : errorType === 'rate_limited'
              ? 'Rate limit detected. Waiting for cooldown...'
              : errorType === 'connection'
              ? 'Connection issue detected. Retrying...'
              : errorType === 'timeout'
              ? 'Request timed out. Retrying...'
              : errorType === 'network'
              ? 'Network error. Retrying...'
              : 'Loading group details...'
            }
          </p>
          {(retryAfter || errorType === 'rate_limited') && (
            <p className="text-xs text-gray-500 mt-2">
              The API is currently rate-limited. Please be patient while we wait for the cooldown period.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!groupMetadata && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {errorType ? 'Failed to load group details' : 'Group not found'}
          </p>
          <div className="flex space-x-2 justify-center">
            {errorType && !retryAfter && (
              <Button 
                onClick={() => loadGroupMetadata()} 
                variant="outline"
                disabled={errorType === 'rate_limited'}
              >
                <Loader2 className="h-4 w-4 mr-2" />
                {errorType === 'rate_limited' ? 'Please Wait' : 'Retry'}
              </Button>
            )}
            {retryAfter && (
              <Button variant="outline" disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Retrying in {retryAfter}s
              </Button>
            )}
            <Button onClick={() => router.push('/group-creation')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Add null check for TypeScript
  if (!groupMetadata) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/group-creation')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {groupMetadata.subject}
              </h1>
              <p className="text-sm text-gray-500">
                Created {formatCreationDate(groupMetadata.creation)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(groupJid)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy ID
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadGroupMetadata}
            >
              <Loader2 className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Group Info & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Group Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Group Information
                </CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEditing}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={updateGroupSettings}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Group Name</Label>
                  {isEditing ? (
                    <Input
                      id="subject"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      placeholder="Enter group name"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{groupMetadata.subject}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Enter group description"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-600">
                      {groupMetadata.desc || 'No description'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {editedAnnounce ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      <Label htmlFor="announce">Announce Mode</Label>
                    </div>
                    {isEditing ? (
                      <Switch
                        id="announce"
                        checked={editedAnnounce}
                        onCheckedChange={setEditedAnnounce}
                      />
                    ) : (
                      <Badge variant={groupMetadata.announce ? "destructive" : "secondary"}>
                        {groupMetadata.announce ? "Only Admins" : "Everyone"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {editedRestrict ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      <Label htmlFor="restrict">Edit Restriction</Label>
                    </div>
                    {isEditing ? (
                      <Switch
                        id="restrict"
                        checked={editedRestrict}
                        onCheckedChange={setEditedRestrict}
                      />
                    ) : (
                      <Badge variant={groupMetadata.restrict ? "destructive" : "secondary"}>
                        {groupMetadata.restrict ? "Admin Only" : "Everyone"}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Group ID:</span>
                    <p className="text-gray-600 break-all">{groupJid}</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Members:</span>
                    <p className="text-gray-600">{groupMetadata.participants?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Send Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Send Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Message</Label>
                      {selectedMentions.length > 0 && (
                        <span className="text-xs text-blue-600">
                          {selectedMentions.length} mention{selectedMentions.length > 1 ? 's' : ''} will be notified
                        </span>
                      )}
                    </div>
                    <Textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type your message here... Use @phonenumber to mention participants"
                      rows={4}
                    />
                  </div>
                  
                  {/* Mention Participants Section */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Mention Participants (Optional)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMentionsDropdown(!showMentionsDropdown)}
                      >
                        {showMentionsDropdown ? 'Hide' : 'Show'} Participants
                      </Button>
                    </div>
                    
                    {/* Selected Mentions Display */}
                    {selectedMentions.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">
                          Selected mentions (click to copy @mention):
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedMentions.map((jid) => {
                            const participant = groupMetadata?.participants.find(p => p.jid === jid);
                            const phoneNumber = jid.replace('@s.whatsapp.net', '').replace('@lid', '');
                            const displayName = participant ? getParticipantName(participant) : phoneNumber;
                            
                            return (
                              <Badge 
                                key={jid} 
                                variant="secondary" 
                                className="flex items-center gap-1 cursor-pointer hover:bg-gray-200"
                                onClick={() => {
                                  navigator.clipboard.writeText(`@${phoneNumber}`);
                                  toast.success(`Copied @${phoneNumber}`);
                                }}
                              >
                                @{displayName} ({phoneNumber})
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMentions(prev => prev.filter(m => m !== jid));
                                  }}
                                />
                              </Badge>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500">
                          💡 Tip: Click a badge to copy @mention, then paste it anywhere in your message
                        </p>
                      </div>
                    )}
                    
                    {/* Participants Dropdown */}
                    {showMentionsDropdown && groupMetadata && (
                      <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                        {groupMetadata.participants.map((participant) => (
                          <div key={participant.jid} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                              checked={selectedMentions.includes(participant.jid)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMentions(prev => [...prev, participant.jid]);
                                } else {
                                  setSelectedMentions(prev => prev.filter(jid => jid !== participant.jid));
                                }
                              }}
                            />
                            <span className="text-sm">{getParticipantName(participant)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={sendMessage}
                    disabled={isSendingMessage || !messageContent.trim()}
                    className="w-full"
                  >
                    {isSendingMessage ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Participants */}
          <div className="space-y-6">
            {/* Add Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2">Search Database Contacts</Label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search contacts by name or phone..."
                  />
                </div>

                {/* Manual Phone Number Entry - NEW */}
                <div className="border-t pt-4">
                  <Label className="mb-2">Or Add by Phone Number</Label>
                  <PhoneNumberInput 
                    onAdd={(phone) => {
                      const manualContact: Contact = {
                        id: `manual-${phone}`,
                        phone_number: phone,
                        name: `+${phone}`,
                        jid: `${phone}@s.whatsapp.net`,
                        is_manual: true
                      };
                      setSelectedContacts(prev => [...prev, manualContact]);
                      toast.success(`Added ${phone} to selection`);
                    }}
                    placeholder="Enter phone number"
                  />
                </div>

                {isSearching && (
                  <div className="text-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Searching contacts...</p>
                  </div>
                )}

                {!isSearching && searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    <p>No contacts found for "{searchQuery}"</p>
                    <p className="text-xs mt-1">Try a different search or add by phone number below</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {searchResults.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {contact.name || contact.notify || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">{contact.phone_number}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!selectedContacts.find(c => c.id === contact.id)) {
                              setSelectedContacts([...selectedContacts, contact]);
                              toast.success(`Added ${contact.name || contact.phone_number}`);
                            }
                          }}
                          disabled={selectedContacts.some(c => c.id === contact.id)}
                        >
                          {selectedContacts.some(c => c.id === contact.id) ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedContacts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected ({selectedContacts.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedContacts.map((contact) => (
                        <Badge
                          key={contact.id}
                          variant={contact.is_manual ? "outline" : "secondary"}
                          className="flex items-center space-x-1"
                        >
                          {contact.is_manual && <span>📱</span>}
                          <span>{contact.name || contact.notify || contact.phone_number}</span>
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setSelectedContacts(
                              selectedContacts.filter(c => c.id !== contact.id)
                            )}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Button
                      onClick={addParticipants}
                      disabled={isAddingParticipant}
                      className="w-full"
                      size="sm"
                    >
                      {isAddingParticipant ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Add {selectedContacts.length} Participant(s)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participants List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Participants ({groupMetadata.participants?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {groupMetadata.participants?.map((participant) => (
                    <div
                      key={participant.jid}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {participant.admin === 'superadmin' ? (
                            <Crown className="h-5 w-5 text-yellow-500" />
                          ) : participant.admin === 'admin' ? (
                            <Shield className="h-5 w-5 text-blue-500" />
                          ) : (
                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {getParticipantName(participant).charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {getParticipantName(participant)}
                          </p>
                          <div className="flex items-center space-x-2">
                            {participant.admin === 'superadmin' && (
                              <Badge variant="default" className="text-xs">Super Admin</Badge>
                            )}
                            {participant.admin === 'admin' && (
                              <Badge variant="secondary" className="text-xs">Admin</Badge>
                            )}
                            {participant.jid === groupMetadata.owner && (
                              <Badge variant="outline" className="text-xs">Owner</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {participant.jid !== groupMetadata.owner && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeParticipant(participant.jid, getParticipantName(participant))}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
