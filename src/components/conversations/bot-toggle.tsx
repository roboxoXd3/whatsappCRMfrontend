'use client';

import { useState, useEffect } from 'react';
import { Bot, User, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBotStatus, useBotToggle, botToggleKeys } from '@/hooks/useBotToggle';
import { useQueryClient } from '@tanstack/react-query';
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
  className,
  variant = 'compact'
}: Omit<BotToggleProps, 'phoneNumber'>) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  const queryClient = useQueryClient();
  const { 
    data: botStatus, 
    isLoading: isLoadingStatus, 
    error: statusError,
    refetch: refetchBotStatus 
  } = useBotStatus(conversationId);
  const { 
    toggleBotByConversation, 
    isToggling, 
    error: toggleError 
  } = useBotToggle();

  // We use conversation ID for toggle, but keep phone number for display
  // const cleanPhoneNumber = phoneNumber.replace('_s_whatsapp_net', '').replace(/\D/g, '');

  // Watch for successful mutations and refresh status
  useEffect(() => {
    if (toggleBotByConversation.isSuccess && !isToggling) {
      console.log('🔄 Mutation successful, refreshing bot status...');
      // Small delay to ensure backend has processed the change
      setTimeout(() => {
        refetchBotStatus();
      }, 500);
    }
  }, [toggleBotByConversation.isSuccess, isToggling, refetchBotStatus]);



  const handleToggle = async (enabled: boolean) => {
    try {
      const reason = enabled 
        ? 'Bot re-enabled by user' 
        : 'Human agent taking over conversation';

      console.log('🔄 Toggling bot by conversation ID:', {
        conversationId,
        enabled,
        currentStatus: botStatus?.bot_enabled,
        reason
      });

      const result = await toggleBotByConversation.mutateAsync({
        conversationId,
        enabled,
        reason
      });

      console.log('✅ Toggle successful:', result);

      // Force clear cache and refetch to ensure UI updates
      console.log('🔄 Clearing cache and refetching bot status...');
      queryClient.removeQueries({ queryKey: botToggleKeys.status(conversationId) });
      await refetchBotStatus();
      
      // Force immediate re-render
      setForceRender(prev => prev + 1);
      
      // Wait a bit and refetch again to ensure we get the updated data
      setTimeout(async () => {
        console.log('🔄 Second refetch to ensure data is fresh...');
        queryClient.removeQueries({ queryKey: botToggleKeys.status(conversationId) });
        await refetchBotStatus();
        // Force re-render after data is fresh
        setForceRender(prev => prev + 1);
      }, 1000);



      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('❌ Failed to toggle bot:', error);

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

  // Use actual status from API
  const isEnabled = botStatus?.bot_enabled ?? true;
  const statusText = botStatus?.status_text ?? (isEnabled ? 'Bot is active' : 'Human is handling');

  // Debug logging
  console.log('🔍 BotToggle render:', {
    conversationId,
    botStatusData: botStatus?.bot_enabled,
    finalIsEnabled: isEnabled,
    isToggling
  });

  if (variant === 'compact') {
    return (
      <TooltipProvider key={`tooltip-${conversationId}-${isEnabled}-${forceRender}`}>
        <div className={cn("flex items-center gap-2", className)} key={`${conversationId}-${isEnabled}-${forceRender}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Switch
                  key={`switch-${conversationId}-${isEnabled}-${forceRender}`}
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

          {/* Manual refresh button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={() => refetchBotStatus()}
                disabled={isLoadingStatus}
              >
                <RefreshCw className={cn(
                  "h-3 w-3 text-gray-400 hover:text-gray-600",
                  isLoadingStatus && "animate-spin"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh status</p>
            </TooltipContent>
          </Tooltip>
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