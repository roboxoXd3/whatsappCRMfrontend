'use client';

import { useState } from 'react';
import { Bot, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBotStatus, useBotToggle } from '@/hooks/useBotToggle';
import { cn } from '@/lib/utils';

interface BotToggleProps {
  conversationId: string;
  phoneNumber: string;
  contactName?: string;
  className?: string;
  variant?: 'compact' | 'full';
}

export function BotToggle({ 
  conversationId, 
  phoneNumber, 
  contactName,
  className,
  variant = 'compact'
}: BotToggleProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: botStatus, isLoading: isLoadingStatus, error: statusError } = useBotStatus(conversationId);
  const { toggleBotByPhone, isToggling, error: toggleError } = useBotToggle();

  // Clean phone number for API call
  const cleanPhoneNumber = phoneNumber.replace('_s_whatsapp_net', '').replace(/\D/g, '');

  const handleToggle = async (enabled: boolean) => {
    try {
      const reason = enabled 
        ? 'Bot re-enabled by user' 
        : 'Human agent taking over conversation';

      await toggleBotByPhone.mutateAsync({
        phone_number: cleanPhoneNumber,
        enabled,
        reason
      });

      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to toggle bot:', error);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Loading bot status...</span>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600">Failed to load bot status</span>
      </div>
    );
  }

  const isEnabled = botStatus?.bot_enabled ?? true;
  const statusText = botStatus?.status_text ?? (isEnabled ? 'Bot is active' : 'Human is handling');

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-2", className)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isEnabled}
                  onCheckedChange={handleToggle}
                  disabled={isToggling}
                  className="data-[state=checked]:bg-green-600"
                />
                <div className="flex items-center gap-1">
                  {isEnabled ? (
                    <Bot className="h-4 w-4 text-green-600" />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                  <Badge 
                    variant={isEnabled ? "default" : "secondary"}
                    className={cn(
                      "text-xs",
                      isEnabled 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    )}
                  >
                    {isEnabled ? 'Bot' : 'Human'}
                  </Badge>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{statusText}</p>
            </TooltipContent>
          </Tooltip>

          {isToggling && (
            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
          )}

          {showSuccess && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}

          {toggleError && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Error: {toggleError.message}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  }

  // Full variant with more details
  return (
    <div className={cn("bg-white border rounded-lg p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <Bot className="h-5 w-5 text-green-600" />
          ) : (
            <User className="h-5 w-5 text-blue-600" />
          )}
          <h3 className="font-medium text-gray-900">
            {isEnabled ? 'AI Bot Active' : 'Human Handling'}
          </h3>
        </div>

        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={isToggling}
          className="data-[state=checked]:bg-green-600"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">{statusText}</p>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={isEnabled ? "default" : "secondary"}
            className={cn(
              isEnabled 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-blue-100 text-blue-800 border-blue-200"
            )}
          >
            {isEnabled ? '🤖 Automated Responses' : '👤 Manual Responses'}
          </Badge>

          {isToggling && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Updating...</span>
            </div>
          )}

          {showSuccess && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Updated!</span>
            </div>
          )}
        </div>

        {toggleError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            <span>Error: {toggleError.message}</span>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 border-t pt-2">
        <p>
          {isEnabled 
            ? 'AI will automatically respond to new messages' 
            : 'You need to manually respond to messages'
          }
        </p>
      </div>
    </div>
  );
} 