'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  Trash2, 
  UserCheck, 
  UserX, 
  Download,
  Upload,
  MoreHorizontal
} from 'lucide-react';

interface ContactsBulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onBulkStatusUpdate: (status: string) => void;
  onExport: () => void;
  onImport: () => void;
}

export function ContactsBulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkStatusUpdate,
  onExport,
  onImport,
}: ContactsBulkActionsProps) {
  const hasSelection = selectedCount > 0;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {/* Selection Controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {isAllSelected ? 'All Selected' : selectedCount > 0 ? `${selectedCount} Selected` : 'Select'}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onSelectAll}>
              Select All ({totalCount})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeselectAll}>
              Deselect All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Selection Count Badge */}
        {hasSelection && (
          <Badge variant="secondary">
            {selectedCount} of {totalCount} selected
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Bulk Actions - Only show when items are selected */}
        {hasSelection && (
          <>
            {/* Status Update */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserCheck className="h-4 w-4 mr-1" />
                  Update Status
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onBulkStatusUpdate('lead')}>
                  Mark as Lead
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusUpdate('contacted')}>
                  Mark as Contacted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusUpdate('customer')}>
                  Mark as Customer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusUpdate('converted')}>
                  Mark as Converted
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onBulkStatusUpdate('inactive')}>
                  <UserX className="h-4 w-4 mr-2" />
                  Mark as Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBulkDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selectedCount})
            </Button>
          </>
        )}

        {/* Import/Export Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Contacts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import Contacts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 