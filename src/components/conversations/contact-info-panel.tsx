'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  X, 
  Phone, 
  Video, 
  Mail, 
  Building, 
  MapPin, 
  Calendar,
  Star,
  Plus,
  Download,
  Edit,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Conversation } from '@/lib/types/api';

interface ContactInfoPanelProps {
  conversation: Conversation;
  onClose: () => void;
}

export function ContactInfoPanel({ conversation, onClose }: ContactInfoPanelProps) {
  const { contact } = conversation;
  const [isEditing, setIsEditing] = useState(false);

  const formatPhoneNumber = (phone: string) => {
    // Remove WhatsApp suffix and format
    const cleanPhone = phone.replace('_s_whatsapp_net', '');
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      return `+91 ${cleanPhone.slice(2, 7)} ${cleanPhone.slice(7)}`;
    }
    return cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Contact Info</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Contact Avatar and Basic Info */}
        <div className="p-6 text-center border-b border-gray-100">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            {contact.profile_image_url ? (
              <img 
                src={contact.profile_image_url} 
                alt={contact.verified_name || contact.name || 'Contact'}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <AvatarFallback className="text-2xl font-semibold bg-blue-100 text-blue-700">
                {contact.verified_name || contact.name ? getInitials(contact.verified_name || contact.name) : <User className="w-8 h-8" />}
              </AvatarFallback>
            )}
          </Avatar>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {contact.verified_name || contact.name || 'Unknown Contact'}
            {contact.is_business_account && (
              <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                Business
              </span>
            )}
          </h3>
          
          {contact.company && (
            <p className="text-sm text-gray-600 mb-3">{contact.company}</p>
          )}
          
          {contact.whatsapp_status && (
            <p className="text-xs text-gray-500 italic mb-3">"{contact.whatsapp_status}"</p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mb-4">
            <Button size="sm" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video
            </Button>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Contact Information</h4>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatPhoneNumber(contact.phone_number)}
                </p>
                <p className="text-xs text-gray-500">Mobile</p>
              </div>
            </div>
            
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{contact.email}</p>
                  <p className="text-xs text-gray-500">Email</p>
                </div>
              </div>
            )}
            
            {contact.company && (
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{contact.company}</p>
                  <p className="text-xs text-gray-500">Company</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conversation Stats */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="font-medium text-gray-900 mb-3">Conversation Stats</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Messages</span>
              <span className="text-sm font-medium text-gray-900">
                {conversation.message_count || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <Badge variant="outline" className="text-xs">
                {conversation.status || 'Active'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Activity</span>
              <span className="text-xs text-gray-500">
                {conversation.last_message_at 
                  ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                  : 'No activity'
                }
              </span>
            </div>

            {contact.lead_status && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lead Status</span>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {contact.lead_status}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Tags - Only show if they exist in the conversation */}
        {conversation.tags && conversation.tags.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Tags</h4>
              <Button variant="ghost" size="sm" className="text-blue-600">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {conversation.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 