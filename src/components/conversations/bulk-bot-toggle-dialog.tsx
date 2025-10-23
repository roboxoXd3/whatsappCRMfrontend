'use client';

import { useState } from 'react';
import { Bot, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Conversation } from '@/lib/types/api';

interface BulkBotToggleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'enable' | 'disable';
  conversations: Conversation[];
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function BulkBotToggleDialog({
  isOpen,
  onClose,
  action,
  conversations,
  onConfirm,
  isLoading = false,
}: BulkBotToggleDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const conversationCount = conversations.length;
  const displayConversations = conversations.slice(0, 5);
  const remainingCount = Math.max(0, conversationCount - 5);

  const handleConfirm = async () => {
    try {
      setError(null);
      setSuccess(false);
      await onConfirm();
      setSuccess(true);
      
      // Close dialog after short delay to show success message
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle bot status');
    }
  };

  const getContactDisplayName = (conversation: Conversation) => {
    const contact = conversation.contact;
    if (contact.verified_name) return contact.verified_name;
    if (contact.name && !contact.name.endsWith('_s_whatsapp_net')) return contact.name;
    if (contact.company) return `Contact from ${contact.company}`;
    return contact.display_phone || contact.phone_number;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'enable' ? (
              <>
                <Bot className="h-5 w-5 text-green-600" />
                <span>Enable Bot for All Conversations</span>
              </>
            ) : (
              <>
                <User className="h-5 w-5 text-blue-600" />
                <span>Disable Bot for All Conversations</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {action === 'enable' 
              ? 'The AI bot will automatically respond to messages in the selected conversations.'
              : 'The AI bot will be paused and you will need to respond manually to messages.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Conversation Count */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Total Conversations:
            </span>
            <Badge variant="outline" className="text-base px-3 py-1">
              {conversationCount}
            </Badge>
          </div>

          {/* Conversation List Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Affected Conversations:</p>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {displayConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                    {getContactDisplayName(conversation).charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 truncate text-gray-900">
                    {getContactDisplayName(conversation)}
                  </span>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    {conversation.message_count || 0} msgs
                  </Badge>
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  and {remainingCount} more conversation{remainingCount !== 1 ? 's' : ''}...
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">
                Bot {action === 'enable' ? 'enabled' : 'disabled'} successfully!
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Failed to toggle bot status</p>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || success}
            className={
              action === 'enable'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Done
              </>
            ) : (
              <>
                {action === 'enable' ? (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Enable Bot
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Disable Bot
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

