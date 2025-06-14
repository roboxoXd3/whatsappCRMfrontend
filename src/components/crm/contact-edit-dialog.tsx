'use client';

import React, { useState, useEffect } from 'react';
import { useCreateContact, useUpdateContact } from '@/hooks/useCRM';
import { Contact, CreateContactRequest, UpdateContactRequest } from '@/lib/types/crm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
// import { toast } from 'sonner';

interface ContactEditDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactEditDialog({ contact, open, onOpenChange }: ContactEditDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    company: '',
    position: '',
    source: '',
    lead_status: 'lead' as 'lead' | 'contacted' | 'customer' | 'converted' | 'inactive',
    notes: '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');

  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();

  const isEditing = !!contact;
  const isLoading = createContactMutation.isPending || updateContactMutation.isPending;

  // Reset form when dialog opens/closes or contact changes
  useEffect(() => {
    if (open) {
      if (contact) {
        setFormData({
          name: contact.name || '',
          phone_number: contact.phone_number || '',
          email: contact.email || '',
          company: contact.company || '',
          position: contact.position || '',
          source: contact.source || '',
          lead_status: contact.lead_status || 'lead',
          notes: contact.notes || '',
          tags: contact.tags || [],
        });
      } else {
        setFormData({
          name: '',
          phone_number: '',
          email: '',
          company: '',
          position: '',
          source: '',
          lead_status: 'lead',
          notes: '',
          tags: [],
        });
      }
    }
  }, [open, contact]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone_number.trim()) {
      alert('Name and phone number are required');
      return;
    }

    try {
      if (isEditing && contact) {
        const updateData: UpdateContactRequest = {
          name: formData.name,
          email: formData.email || undefined,
          company: formData.company || undefined,
          position: formData.position || undefined,
          source: formData.source || undefined,
          lead_status: formData.lead_status,
          notes: formData.notes || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
        };

        await updateContactMutation.mutateAsync({
          contactId: contact.id,
          contactData: updateData,
        });

        alert('Contact updated successfully');
      } else {
        const createData: CreateContactRequest = {
          name: formData.name,
          phone_number: formData.phone_number,
          email: formData.email || undefined,
          company: formData.company || undefined,
          position: formData.position || undefined,
          source: formData.source || undefined,
          lead_status: formData.lead_status,
          notes: formData.notes || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
        };

        await createContactMutation.mutateAsync(createData);
        alert('Contact created successfully');
      }

      onOpenChange(false);
    } catch (error: any) {
      alert(error.message || 'Failed to save contact');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Contact' : 'Add New Contact'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="919876543210"
                required
                disabled={isEditing} // Don't allow phone number changes
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="contact@example.com"
            />
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Job title"
              />
            </div>
          </div>

          {/* Lead Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.lead_status}
                onValueChange={(value: string) => handleInputChange('lead_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="e.g., Website, Facebook, Referral"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this contact..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Contact' : 'Create Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 