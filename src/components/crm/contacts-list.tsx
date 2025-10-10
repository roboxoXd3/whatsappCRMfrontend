'use client';

import React, { useState } from 'react';
import { useContacts } from '@/hooks/useCRM';
import { Contact } from '@/lib/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Phone, 
  Mail, 
  Building,
  Calendar,
  Star
} from 'lucide-react';
import { ContactEditDialog } from './contact-edit-dialog';
import { ContactsBulkActions } from './contacts-bulk-actions';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';

interface ContactsListProps {
  className?: string;
}

export function ContactsList({ className }: ContactsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const router = useRouter();

  // Fetch all contacts once (client-side filtering for better performance)
  const { data: contactsResponse, isLoading, error } = useContacts({
    limit: 1000, // Fetch all contacts
  });

  const allContacts = contactsResponse?.data || [];

  // Client-side filtering for instant search
  const contacts = React.useMemo(() => {
    let filtered = allContacts;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.lead_status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(contact => {
        const name = (contact.name || '').toLowerCase();
        const phone = (contact.phone_number || '').toLowerCase();
        const email = (contact.email || '').toLowerCase();
        const company = (contact.company || '').toLowerCase();
        
        return name.includes(query) || 
               phone.includes(query) || 
               email.includes(query) || 
               company.includes(query);
      });
    }

    return filtered;
  }, [allContacts, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'contacted':
        return 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-200';
      case 'qualified':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'lost':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== 'string') {
      return '??';
    }
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPhone = (phone: string) => {
    // Format Indian phone numbers
    if (phone.startsWith('91') && phone.length === 12) {
      return `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setIsAddDialogOpen(true);
  };

  // Bulk selection handlers
  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedContacts(new Set(contacts.map(c => c.id)));
  };

  const handleDeselectAll = () => {
    setSelectedContacts(new Set());
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedContacts.size} contacts?`)) {
      alert('Bulk delete functionality will be implemented with API integration');
      setSelectedContacts(new Set());
    }
  };

  const handleBulkStatusUpdate = (status: string) => {
    if (confirm(`Update ${selectedContacts.size} contacts to status: ${status}?`)) {
      alert(`Bulk status update to ${status} will be implemented with API integration`);
      setSelectedContacts(new Set());
    }
  };

  const handleExport = () => {
    alert('Export functionality will be implemented');
  };

  const handleImport = () => {
    alert('Import functionality will be implemented');
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading contacts: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contacts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your leads and customers
              </p>
            </div>
            <Button onClick={handleAddContact}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions */}
          <ContactsBulkActions
            selectedCount={selectedContacts.size}
            totalCount={contacts.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBulkDelete={handleBulkDelete}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onExport={handleExport}
            onImport={handleImport}
          />

          {/* Search and Filters */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts by name, phone, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Status: {statusFilter === 'all' ? 'All' : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    All Contacts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('new')}>
                    New Leads
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('contacted')}>
                    Contacted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('qualified')}>
                    Qualified
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('negotiation')}>
                    Negotiation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('lost')}>
                    Lost
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Results count */}
            {(searchQuery || statusFilter !== 'all') && (
              <p className="text-sm text-muted-foreground">
                Showing {contacts.length} of {allContacts.length} contacts
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            )}
          </div>

          {/* Contacts Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No contacts found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedContacts.size === contacts.length && contacts.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSelectAll();
                          } else {
                            handleDeselectAll();
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lead Score</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow
                      key={contact.id}
                      className="cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={(e) => {
                        // Prevent navigation if clicking on a checkbox or menu button
                        if ((e.target as HTMLElement).closest('button, input[type=checkbox]')) return;
                        router.push(`/crm/user/${contact.id}`);
                      }}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedContacts.has(contact.id)}
                          onCheckedChange={(checked) => 
                            handleSelectContact(contact.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(contact.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{contact.name || 'Unknown Contact'}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contact.display_phone || formatPhone(contact.phone_number || '')}
                            </div>
                            {contact.email && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {contact.company && (
                            <>
                              <Building className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{contact.company}</span>
                            </>
                          )}
                          {contact.position && (
                            <span className="text-xs text-muted-foreground">
                              • {contact.position}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(contact.lead_status || 'lead')}>
                          {contact.lead_status || 'lead'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm font-medium">{contact.lead_score || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {contact.last_contacted_at ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatDate(contact.last_contacted_at)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.source && (
                          <Badge variant="outline" className="text-xs">
                            {contact.source}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Contact
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Contact Dialog */}
      <ContactEditDialog
        contact={selectedContact}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Add Contact Dialog */}
      <ContactEditDialog
        contact={null}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
} 