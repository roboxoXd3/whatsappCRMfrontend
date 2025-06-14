'use client';

import { useState } from 'react';
import { Bot, User, Trash2, Archive, MoreHorizontal, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBotToggle } from '@/hooks/useBotToggle';
import { Conversation } from '@/lib/types/api';
import { cn } from '@/lib/utils';

interface ConversationBulkActionsProps {
  selectedConversations: Conversation[];
  onClearSelection: () => void;
  className?: string;
}

export function ConversationBulkActions({
  selectedConversations,
  onClearSelection,
  className
}: ConversationBulkActionsProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'enable' | 'disable';
    reason: string;
  } | null>(null);
  const [lastActionResult, setLastActionResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { bulkToggleBot, isToggling } = useBotToggle();

  const selectedCount = selectedConversations.length;

  const handleBulkToggle = async (enabled: boolean) => {
    const action = enabled ? 'enable' : 'disable';
    const reason = enabled 
      ? `Bulk ${action}d bot for ${selectedCount} conversations`
      : `Bulk ${action}d bot - human agents taking over ${selectedCount} conversations`;

    setPendingAction({ type: action, reason });
    setShowConfirmDialog(true);
  };

  const confirmBulkToggle = async () => {
    if (!pendingAction) return;

    try {
      const conversationIds = selectedConversations.map(conv => conv.id);
      const enabled = pendingAction.type === 'enable';

      await bulkToggleBot.mutateAsync({
        conversation_ids: conversationIds,
        enabled,
        reason: pendingAction.reason
      });

      setLastActionResult({
        type: 'success',
        message: `Successfully ${pendingAction.type}d bot for ${selectedCount} conversations`
      });

      // Clear selection after successful action
      setTimeout(() => {
        onClearSelection();
        setLastActionResult(null);
      }, 3000);

    } catch (error: any) {
      setLastActionResult({
        type: 'error',
        message: error.message || `Failed to ${pendingAction.type} bot for conversations`
      });
    } finally {
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  };

  const handleBulkArchive = () => {
    // Placeholder for bulk archive functionality
    alert(`Archive ${selectedCount} conversations - To be implemented`);
  };

  const handleBulkDelete = () => {
    // Placeholder for bulk delete functionality  
    alert(`Delete ${selectedCount} conversations - To be implemented`);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className={cn(
        "bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between",
        className
      )}>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedCount} selected
          </Badge>

          {lastActionResult && (
            <div className={cn(
              "flex items-center gap-2 text-sm",
              lastActionResult.type === 'success' ? "text-green-600" : "text-red-600"
            )}>
              {lastActionResult.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{lastActionResult.message}</span>
            </div>
          )}

          {isToggling && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating conversations...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Bot Toggle Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkToggle(true)}
            disabled={isToggling}
            className="text-green-700 border-green-200 hover:bg-green-50"
          >
            <Bot className="h-4 w-4 mr-1" />
            Enable Bot
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkToggle(false)}
            disabled={isToggling}
            className="text-blue-700 border-blue-200 hover:bg-blue-50"
          >
            <User className="h-4 w-4 mr-1" />
            Human Mode
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => handleBulkToggle(true)}>
                <Bot className="h-4 w-4 mr-2" />
                Enable Bot for All
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => handleBulkToggle(false)}>
                <User className="h-4 w-4 mr-2" />
                Switch to Human Mode
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleBulkArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Conversations
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleBulkDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Conversations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-600"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === 'enable' ? 'Enable' : 'Disable'} Bot for {selectedCount} Conversations?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'enable' ? (
                <>
                  This will enable the AI bot for {selectedCount} selected conversations. 
                  The bot will automatically respond to new messages in these conversations.
                </>
              ) : (
                <>
                  This will disable the AI bot for {selectedCount} selected conversations. 
                  Human agents will need to manually respond to messages in these conversations.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkToggle}
              className={cn(
                pendingAction?.type === 'enable' 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {pendingAction?.type === 'enable' ? 'Enable Bot' : 'Switch to Human'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 