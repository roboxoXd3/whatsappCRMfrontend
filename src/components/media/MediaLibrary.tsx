'use client';

import { useState } from 'react';
import { useMediaLibrary, type MediaLibraryFile } from '@/hooks/useMediaLibrary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Calendar,
  Check,
  Loader2,
  Upload as UploadIcon
} from 'lucide-react';

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: MediaLibraryFile) => void;
  mediaType?: 'image' | 'video' | 'all';
}

export function MediaLibrary({
  isOpen,
  onClose,
  onSelect,
  mediaType = 'all'
}: MediaLibraryProps) {
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>(mediaType);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const { files, total, isLoading, error, loadMore, hasMore, refresh } = useMediaLibrary({
    limit: 20,
    mediaType: filterType,
    sort: sortOrder,
    enabled: isOpen
  });

  const handleSelect = (file: MediaLibraryFile) => {
    onSelect(file);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>
            Select from your previously uploaded media files
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="px-6 pb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Type:</label>
            <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'image' | 'video')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort:</label>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'newest' | 'oldest')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto text-sm text-muted-foreground">
            {total} file{total !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Content */}
        <div className="h-[400px] overflow-y-auto px-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive p-4 mb-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {isLoading && files.length === 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && files.length === 0 && (
            <div className="text-center py-12">
              <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No media files yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your first image or video to get started
              </p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}

          {files.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {files.map((file, index) => (
                  <Card
                    key={`${file.storage_path}-${index}`}
                    className="group relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleSelect(file)}
                  >
                    {/* Media Preview */}
                    <div className="aspect-square relative bg-gray-100">
                      {file.media_type === 'image' ? (
                        <img
                          src={file.media_url}
                          alt="Media preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                            e.currentTarget.style.opacity = '0.5';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <VideoIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-center text-white">
                          <Check className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">Select</p>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 left-2"
                      >
                        {file.media_type === 'image' ? (
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
                    </div>

                    {/* File Info */}
                    <div className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{file.size_mb.toFixed(2)} MB</span>
                        {file.used_in_campaigns > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Used {file.used_in_campaigns}x
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(file.uploaded_at)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center pb-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${total - files.length} remaining)`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Click on any media file to select it
          </p>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

