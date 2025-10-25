/**
 * useMediaUpload Hook
 * 
 * Reusable custom hook for uploading media files.
 * Can be imported and used by any component that needs media upload functionality.
 * 
 * Usage:
 *   const { uploadMedia, isUploading, progress, error } = useMediaUpload();
 *   const result = await uploadMedia(file);
 */

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth';

// Media upload result interface
export interface MediaUploadResult {
  media_url: string;
  media_type: 'image' | 'video';
  original_size_mb: number;
  compressed_size_mb: number;
  compression_applied: boolean;
  compression_ratio: number;
}

// Hook return interface
export interface UseMediaUploadReturn {
  uploadMedia: (file: File) => Promise<MediaUploadResult>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for media upload functionality.
 * Handles file validation, upload to backend, and progress tracking.
 * 
 * @returns Upload functions and state
 */
export function useMediaUpload(): UseMediaUploadReturn {
  const { token } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const uploadMedia = useCallback(async (file: File): Promise<MediaUploadResult> => {
    // Reset state
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'video/mp4',
        'video/mpeg',
        'video/quicktime'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      // Determine media type
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('media_type', mediaType);
      formData.append('compress', 'true');

      // Upload progress simulation (FormData doesn't support onUploadProgress directly)
      setProgress(10);

      // Get API URL
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      
      // Make upload request
      const response = await fetch(`${baseURL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      setProgress(90);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.status !== 'success') {
        throw new Error(result.message || 'Upload failed');
      }

      setProgress(100);
      setIsUploading(false);

      // Return the media upload result
      return {
        media_url: result.data.media_url,
        media_type: result.data.media_type,
        original_size_mb: result.data.original_size_mb,
        compressed_size_mb: result.data.compressed_size_mb,
        compression_applied: result.data.compression_applied,
        compression_ratio: result.data.compression_ratio
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsUploading(false);
      setProgress(0);
      throw err;
    }
  }, [token]);

  return {
    uploadMedia,
    isUploading,
    progress,
    error,
    clearError,
    reset
  };
}

