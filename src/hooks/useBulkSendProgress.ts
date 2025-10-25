import { useState, useEffect, useRef, useCallback } from 'react';

interface BulkSendProgress {
  campaign_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    current: number;
    total: number;
    successful: number;
    failed: number;
    success_rate: number;
  };
  estimated_time_remaining: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  message_content: string;
  campaign_name: string;
}

interface UseBulkSendProgressReturn {
  progress: BulkSendProgress | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to poll bulk send campaign status
 * Automatically polls every 2 seconds while campaign is running
 * Stops polling when campaign is completed, failed, or cancelled
 */
export function useBulkSendProgress(
  campaignId: string | null,
  options?: {
    enabled?: boolean;
    pollInterval?: number;
    onComplete?: (progress: BulkSendProgress) => void;
    onError?: (error: string) => void;
  }
): UseBulkSendProgressReturn {
  const [progress, setProgress] = useState<BulkSendProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStatusRef = useRef<string | null>(null);
  
  const {
    enabled = true,
    pollInterval = 2000, // 2 seconds
    onComplete,
    onError
  } = options || {};

  const fetchProgress = useCallback(async () => {
    if (!campaignId || !enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(
        `${baseURL}/api/bulk-send/campaigns/${campaignId}/status`
      );

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const newProgress = data.data as BulkSendProgress;
        setProgress(newProgress);

        // Check if status changed to completed/failed/cancelled
        const isTerminalStatus = ['completed', 'failed', 'cancelled'].includes(newProgress.status);
        const statusChanged = previousStatusRef.current !== newProgress.status;
        
        if (isTerminalStatus && statusChanged && previousStatusRef.current === 'running') {
          // Campaign just completed
          if (onComplete) {
            onComplete(newProgress);
          }
        }
        
        previousStatusRef.current = newProgress.status;

        // Stop polling if campaign is in terminal state
        if (isTerminalStatus && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        const errorMessage = data.message || 'Failed to fetch campaign status';
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaign status';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, enabled, onComplete, onError]);

  // Setup polling
  useEffect(() => {
    if (!campaignId || !enabled) {
      return;
    }

    // Fetch immediately
    fetchProgress();

    // Setup polling interval
    intervalRef.current = setInterval(() => {
      fetchProgress();
    }, pollInterval);

    // Cleanup on unmount or when campaignId changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [campaignId, enabled, pollInterval, fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress
  };
}

