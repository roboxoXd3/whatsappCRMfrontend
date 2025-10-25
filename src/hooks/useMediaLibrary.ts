import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth';

export interface MediaLibraryFile {
  media_url: string;
  media_type: 'image' | 'video';
  size_mb: number;
  uploaded_at: string;
  used_in_campaigns: number;
  storage_path: string;
  filename: string;
}

interface UseMediaLibraryOptions {
  limit?: number;
  mediaType?: 'image' | 'video' | 'all';
  dateFrom?: string;
  dateTo?: string;
  sort?: 'newest' | 'oldest';
  enabled?: boolean;
}

interface MediaLibraryResponse {
  files: MediaLibraryFile[];
  total: number;
  limit: number;
  offset: number;
}

export function useMediaLibrary(options?: UseMediaLibraryOptions) {
  const { token } = useAuthStore();
  const [files, setFiles] = useState<MediaLibraryFile[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const {
    limit = 50,
    mediaType = 'all',
    dateFrom,
    dateTo,
    sort = 'newest',
    enabled = true
  } = options || {};

  const fetchLibrary = useCallback(async (reset: boolean = false) => {
    if (!token || !enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      
      // Build query parameters
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (reset ? 0 : offset).toString(),
        media_type: mediaType,
        sort: sort
      });

      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await fetch(`${baseURL}/api/media/library?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch media library');
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        const data: MediaLibraryResponse = result.data;
        
        if (reset) {
          setFiles(data.files);
        } else {
          // Append for "load more"
          setFiles(prev => [...prev, ...data.files]);
        }
        
        setTotal(data.total);
      } else {
        throw new Error(result.message || 'Failed to fetch media library');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Media library fetch error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token, enabled, limit, offset, mediaType, dateFrom, dateTo, sort]);

  const loadMore = useCallback(() => {
    setOffset(prev => prev + limit);
  }, [limit]);

  const refresh = useCallback(() => {
    setOffset(0);
    fetchLibrary(true);
  }, [fetchLibrary]);

  useEffect(() => {
    if (enabled) {
      fetchLibrary(offset === 0);
    }
  }, [enabled, offset, mediaType, dateFrom, dateTo, sort]);

  const hasMore = files.length < total;

  return {
    files,
    total,
    isLoading,
    error,
    loadMore,
    refresh,
    hasMore
  };
}

