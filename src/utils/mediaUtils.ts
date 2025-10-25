/**
 * Media Utilities
 * 
 * Reusable validation and helper functions for media uploads.
 * Can be imported and used by any component that needs media functionality.
 */

// Supported file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime'];
export const MAX_FILE_SIZE_MB = 50; // Frontend warning threshold

// Media validation result interface
export interface MediaValidation {
  isValid: boolean;
  error: string | null;
  mediaType: 'image' | 'video' | null;
}

/**
 * Validate media file on frontend before upload.
 * 
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateMediaFile(file: File): MediaValidation {
  // Check file type
  const mimeType = file.type.toLowerCase();
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);
  
  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error: `Unsupported file type: ${mimeType}. Allowed: JPG, PNG, MP4`,
      mediaType: null
    };
  }
  
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      isValid: false,
      error: `File too large: ${fileSizeMB.toFixed(2)}MB. Maximum: ${MAX_FILE_SIZE_MB}MB`,
      mediaType: null
    };
  }
  
  return {
    isValid: true,
    error: null,
    mediaType: isImage ? 'image' : 'video'
  };
}

/**
 * Generate preview URL for media file.
 * Remember to revoke the URL when done using URL.revokeObjectURL()
 * 
 * @param file - File to create preview for
 * @returns Object URL for preview
 */
export function createMediaPreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Format file size for display.
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "256 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get media type from MIME type.
 * 
 * @param mimeType - MIME type string
 * @returns 'image', 'video', or null
 */
export function getMediaType(mimeType: string): 'image' | 'video' | null {
  const normalized = mimeType.toLowerCase();
  
  if (ALLOWED_IMAGE_TYPES.includes(normalized)) {
    return 'image';
  }
  
  if (ALLOWED_VIDEO_TYPES.includes(normalized)) {
    return 'video';
  }
  
  return null;
}

/**
 * Check if file will need compression.
 * 
 * @param file - File to check
 * @returns true if file exceeds 16MB and will be compressed
 */
export function willBeCompressed(file: File): boolean {
  const COMPRESSION_THRESHOLD_MB = 16;
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB > COMPRESSION_THRESHOLD_MB;
}

