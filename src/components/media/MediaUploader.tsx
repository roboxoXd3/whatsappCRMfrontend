/**
 * MediaUploader Component
 * 
 * Reusable media upload component with drag-drop, preview, and compression feedback.
 * Can be imported and used by any component that needs media upload functionality.
 * 
 * Usage:
 *   <MediaUploader
 *     onUploadComplete={(result) => handleUpload(result)}
 *     showPreview={true}
 *   />
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Video as VideoIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useMediaUpload, MediaUploadResult } from '@/hooks/useMediaUpload';
import { validateMediaFile, formatFileSize, createMediaPreview, willBeCompressed } from '@/utils/mediaUtils';

interface MediaUploaderProps {
  onUploadComplete: (result: MediaUploadResult) => void;
  onUploadError?: (error: string) => void;
  onFileSelect?: (file: File) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  showPreview?: boolean;
  uploadButtonText?: string;
  className?: string;
}

export function MediaUploader({
  onUploadComplete,
  onUploadError,
  onFileSelect,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/mpeg', 'video/quicktime'],
  maxSizeMB = 50,
  showPreview = true,
  uploadButtonText = 'Upload Media',
  className = ''
}: MediaUploaderProps) {
  const { uploadMedia, isUploading, progress, error, clearError } = useMediaUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = useCallback((file: File | null) => {
    // Clear previous states
    setValidationError(null);
    clearError();
    
    if (!file) {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      return;
    }

    // Validate file
    const validation = validateMediaFile(file);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    // Set file
    setSelectedFile(file);
    
    // Create preview if enabled
    if (showPreview) {
      const preview = createMediaPreview(file);
      setPreviewUrl(preview);
    }

    // Notify parent
    onFileSelect?.(file);
  }, [showPreview, previewUrl, onFileSelect, clearError]);

  // Handle file input change
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMedia(selectedFile);
      onUploadComplete(result);
      
      // Clear after successful upload
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      onUploadError?.(errorMessage);
    }
  };

  // Handle clear
  const handleClear = () => {
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle click to browse
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const displayError = validationError || error;

  return (
    <div className={className}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={onInputChange}
        className="hidden"
      />

      {/* No file selected - show drop zone */}
      {!selectedFile && (
        <div
          onClick={handleBrowseClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
          `}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Drop image or video here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Max {maxSizeMB}MB • JPG, PNG, MP4
          </p>
        </div>
      )}

      {/* File selected - show preview and upload */}
      {selectedFile && (
        <Card className="p-4">
          <div className="space-y-4">
            {/* File info header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {selectedFile.type.startsWith('image/') ? (
                    <>
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Image
                    </>
                  ) : (
                    <>
                      <VideoIcon className="h-3 w-3 mr-1" />
                      Video
                    </>
                  )}
                </Badge>
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Preview */}
            {showPreview && previewUrl && (
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="max-h-48 mx-auto"
                  />
                )}
              </div>
            )}

            {/* Compression warning */}
            {willBeCompressed(selectedFile) && !isUploading && (
              <Alert>
                <AlertDescription className="text-xs">
                  This file will be compressed to meet the 16MB limit while maintaining quality.
                </AlertDescription>
              </Alert>
            )}

            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Error display */}
            {displayError && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  {displayError}
                </AlertDescription>
              </Alert>
            )}

            {/* Upload button */}
            {!isUploading && (
              <Button
                onClick={handleUpload}
                disabled={!!displayError}
                className="w-full"
              >
                {uploadButtonText}
              </Button>
            )}

            {/* Uploading state */}
            {isUploading && (
              <Button disabled className="w-full">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

