'use client';

import { useState, useRef } from 'react';
import { Send, Users, Upload, FileText, Plus, X, CheckCircle, AlertCircle, Clock, FileCheck, AlertTriangle, Sparkles, RefreshCw, Eye, Database, Download } from 'lucide-react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/lib/stores/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

// CRM contacts from API use different field names
interface CRMContact {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  company?: string;
}

// CSV Preview interfaces
interface CSVPreviewData {
  contacts: Contact[];
  errors: string[];
  detectedColumns: Record<string, string>;
  statistics: {
    totalRows: number;
    valid: number;
    invalid: number;
  };
  file: File;
}

interface ImportResult {
  created: number;
  updated: number;
  failed: number;
}

export function BulkSendForm() {
  const { token } = useAuthStore();
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [contactInput, setContactInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<'idle' | 'sending' | 'completed' | 'failed' | 'cancelled'>('idle');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploadStatus, setCsvUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [isFormattingMessage, setIsFormattingMessage] = useState(false);
  const [useAIPersonalization, setUseAIPersonalization] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMessages, setPreviewMessages] = useState<any[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0, successful: 0, failed: 0 });
  const [isStopping, setIsStopping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // CRM import state
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>([]);
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [selectedCrmContactIds, setSelectedCrmContactIds] = useState<Set<string>>(new Set());
  const [isFetchingCrmContacts, setIsFetchingCrmContacts] = useState(false);
  const [crmFetchError, setCrmFetchError] = useState<string | null>(null);
  
  // CSV Preview state
  const [csvPreviewData, setCsvPreviewData] = useState<CSVPreviewData | null>(null);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [isSavingToCRM, setIsSavingToCRM] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleAddContact = () => {
    if (contactInput.trim()) {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: contactInput.includes('@') ? contactInput.split('@')[0] : contactInput,
        phone: contactInput,
      };
      setSelectedContacts([...selectedContacts, newContact]);
      setContactInput('');
    }
  };

  const handleRemoveContact = (id: string) => {
    setSelectedContacts(selectedContacts.filter(c => c.id !== id));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      handleCsvUpload(file);
    }
  };

  const handleCsvUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvUploadStatus('error');
      setCsvErrors(['Please select a CSV file']);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCsvUploadStatus('error');
      setCsvErrors(['File size must be less than 5MB']);
      return;
    }

    setCsvUploadStatus('uploading');
    setCsvErrors([]);

    try {
      // Parse CSV locally to show preview
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const { contacts, errors: parseErrors, detectedColumns, statistics } = parseCsvContactsWithMetadata(results.data as any[]);
          
          // Show preview dialog with parsed data
          setCsvPreviewData({
            contacts,
            errors: parseErrors,
            detectedColumns,
            statistics,
            file
          });
          setShowCsvPreview(true);
          setCsvUploadStatus('success');
        },
        error: (error) => {
          setCsvUploadStatus('error');
          setCsvErrors([`Error parsing CSV: ${error.message}`]);
        }
      });
    } catch (error) {
      setCsvUploadStatus('error');
      setCsvErrors(['Failed to process CSV file']);
    }
  };

  const parseCsvContactsWithMetadata = (data: any[]) => {
    const contacts: Contact[] = [];
    const errors: string[] = [];
    const detectedColumns: Record<string, string> = {};

    // Common phone number field names
    const phoneFields = ['phone', 'phone_number', 'mobile', 'whatsapp', 'number', 'contact'];
    const nameFields = ['name', 'full_name', 'contact_name', 'customer_name'];
    const emailFields = ['email', 'email_address', 'mail'];
    const companyFields = ['company', 'organization', 'business'];

    if (data.length === 0) {
      return {
        contacts,
        errors: ['CSV file is empty'],
        detectedColumns,
        statistics: { totalRows: 0, valid: 0, invalid: 0 }
      };
    }

    // Find field mappings
    const headers = Object.keys(data[0]).map(h => h.toLowerCase());
    const phoneField = phoneFields.find(field => headers.includes(field));
    const nameField = nameFields.find(field => headers.includes(field));
    const emailField = emailFields.find(field => headers.includes(field));
    const companyField = companyFields.find(field => headers.includes(field));

    if (!phoneField) {
      return {
        contacts,
        errors: [`No phone number column found. Expected one of: ${phoneFields.join(', ')}`],
        detectedColumns,
        statistics: { totalRows: data.length, valid: 0, invalid: data.length }
      };
    }

    // Store detected columns
    if (phoneField) detectedColumns['phone'] = phoneField;
    if (nameField) detectedColumns['name'] = nameField;
    if (emailField) detectedColumns['email'] = emailField;
    if (companyField) detectedColumns['company'] = companyField;

    // Process each row
    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index is 0-based and we skip header
      
      // Get phone number
      const phone = row[phoneField]?.toString().trim();
      if (!phone) {
        errors.push(`Row ${rowNumber}: Phone number is empty`);
        return;
      }

      // Clean phone number
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      if (cleanedPhone.length < 10) {
        errors.push(`Row ${rowNumber}: Invalid phone number format: ${phone}`);
        return;
      }

      // Get other fields
      const name = nameField ? row[nameField]?.toString().trim() : '';
      const email = emailField ? row[emailField]?.toString().trim() : '';
      const company = companyField ? row[companyField]?.toString().trim() : '';

      // Validate email if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push(`Row ${rowNumber}: Invalid email format: ${email}`);
        return;
      }

      // Check for duplicates in current batch
      const isDuplicate = contacts.some(c => c.phone === cleanedPhone);
      if (isDuplicate) {
        errors.push(`Row ${rowNumber}: Duplicate phone number: ${phone}`);
        return;
      }

      // Create contact
      const contact: Contact = {
        id: `csv_${Date.now()}_${index}`,
        name: name || cleanedPhone,
        phone: cleanedPhone,
        email: email || undefined,
        company: company || undefined,
      };

      contacts.push(contact);
    });

    return {
      contacts,
      errors,
      detectedColumns,
      statistics: {
        totalRows: data.length,
        valid: contacts.length,
        invalid: errors.length
      }
    };
  };

  const parseCsvContacts = (data: any[]): Contact[] => {
    const { contacts } = parseCsvContactsWithMetadata(data);
    return contacts;
  };

  const handleAddToCampaign = () => {
    if (csvPreviewData) {
      // Add valid contacts to campaign list
      setSelectedContacts(prev => [...prev, ...csvPreviewData.contacts]);
      setShowCsvPreview(false);
      setCsvPreviewData(null);
    }
  };

  const handleSaveToCRM = async () => {
    if (!csvPreviewData) return;

    setIsSavingToCRM(true);
    setImportResult(null);

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const formData = new FormData();
      formData.append('file', csvPreviewData.file);

      const response = await fetch(`${baseURL}/api/bulk-send/import-contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && (result.status === 'success' || result.status === 'partial_success')) {
        const stats = result.data.statistics;
        setImportResult({
          created: stats.created || 0,
          updated: stats.updated || 0,
          failed: stats.failed || 0,
        });
        
        // If there are errors, update csvErrors
        const allErrors = [
          ...(result.data.invalid_rows?.map((e: any) => e.error) || []),
          ...(result.data.import_errors?.map((e: any) => e.error) || [])
        ];
        if (allErrors.length > 0) {
          setCsvErrors(allErrors);
        }
      } else {
        setCsvErrors([result.message || 'Failed to save contacts to CRM']);
      }
    } catch (error) {
      console.error('Error saving to CRM:', error);
      setCsvErrors(['Failed to save contacts to CRM. Please try again.']);
    } finally {
      setIsSavingToCRM(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setCsvFile(file);
      handleCsvUpload(file);
    }
  };

  const clearCsvUpload = () => {
    setCsvFile(null);
    setCsvUploadStatus('idle');
    setCsvErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormatMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message to format');
      return;
    }

    setIsFormattingMessage(true);

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/bulk-send/format-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          tone: 'professional',
          purpose: 'marketing'
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setMessage(result.data.formatted_message);
        console.log('Message formatted successfully');
      } else {
        console.error('Message formatting failed:', result.message);
        alert('Failed to format message. Please try again.');
      }
    } catch (error) {
      console.error('Message formatting error:', error);
      alert('Failed to format message. Please check your connection.');
    } finally {
      setIsFormattingMessage(false);
    }
  };

  const handlePreview = async () => {
    if (!message.trim() || selectedContacts.length === 0) {
      alert('Please enter a message and add contacts first');
      return;
    }

    setIsLoadingPreview(true);
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/bulk-send/preview-personalization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message.trim(),
          contacts: selectedContacts.slice(0, 5).map(c => ({
            phone: c.phone,
            name: c.name,
            company: c.company || '',
            email: c.email || ''
          })),
          use_ai_personalization: useAIPersonalization,
          sample_size: 5
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setPreviewMessages(result.data.previews);
        setShowPreview(true);
      } else {
        alert('Failed to generate preview');
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert('Failed to generate preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = message;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + `{${variable}}` + after;
      setMessage(newText);
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
      }, 0);
    }
  };

  // Fetch CRM contacts
  const fetchCrmContacts = async () => {
    setIsFetchingCrmContacts(true);
    setCrmFetchError(null);
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/crm/contacts?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setCrmContacts(data.data || []);
      } else {
        setCrmFetchError(data.message || 'Failed to fetch CRM contacts');
      }
    } catch (error) {
      console.error('Error fetching CRM contacts:', error);
      setCrmFetchError('Failed to load contacts. Please try again.');
    } finally {
      setIsFetchingCrmContacts(false);
    }
  };

  // Toggle CRM contact selection
  const toggleCrmContact = (contactId: string) => {
    setSelectedCrmContactIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  // Check if contact is already in selected list (by phone number)
  const isContactAlreadyAdded = (phoneNumber: string): boolean => {
    return selectedContacts.some(c => c.phone === phoneNumber);
  };

  // Import selected contacts from CRM
  const handleImportFromCRM = () => {
    const contactsToImport = crmContacts
      .filter(c => selectedCrmContactIds.has(c.id))
      .map(c => ({
        id: c.id,
        name: c.name || c.phone_number,
        phone: c.phone_number,
        email: c.email || '',
        company: c.company || ''
      }));
    
    // Filter out duplicates
    const newContacts = contactsToImport.filter(c => !isContactAlreadyAdded(c.phone));
    const duplicateCount = contactsToImport.length - newContacts.length;
    
    if (newContacts.length > 0) {
      setSelectedContacts(prev => [...prev, ...newContacts]);
    }
    
    // Clear selection
    setSelectedCrmContactIds(new Set());
    
    // Show feedback
    if (duplicateCount > 0) {
      alert(`Imported ${newContacts.length} contacts. ${duplicateCount} duplicate(s) skipped.`);
    } else {
      console.log(`✅ Imported ${newContacts.length} contacts from CRM`);
    }
  };

  // Filter CRM contacts by search query
  const filteredCrmContacts = crmContacts.filter(contact => {
    if (!crmSearchQuery.trim()) return true;
    const query = crmSearchQuery.toLowerCase();
    return (
      (contact.name || '').toLowerCase().includes(query) ||
      (contact.phone_number || '').toLowerCase().includes(query) ||
      (contact.email || '').toLowerCase().includes(query) ||
      (contact.company || '').toLowerCase().includes(query)
    );
  });

  const handleStopSending = async () => {
    if (!activeCampaignId) return;
    
    setIsStopping(true);
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/bulk-send/cancel/${activeCampaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setJobStatus('cancelled');
        console.log('Campaign cancelled successfully');
        alert('Campaign is stopping. The current message will complete, then it will stop.');
      } else {
        console.error('Failed to cancel campaign:', result.message);
        alert('Failed to stop campaign. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      alert('Error stopping campaign. Please try again.');
    } finally {
      setIsStopping(false);
      setActiveCampaignId(null);
      setIsLoading(false);
    }
  };

  const handleBulkSend = async () => {
    if (!message.trim() || selectedContacts.length === 0) return;

    setIsLoading(true);
    setJobStatus('sending');
    setSendingProgress({ current: 0, total: selectedContacts.length, successful: 0, failed: 0 });

    try {
      // Call the new bulk send API endpoint
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/bulk-send/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message.trim(),
          contacts: selectedContacts.map(c => ({
            phone: c.phone,
            name: c.name,
            company: c.company || '',
            email: c.email || ''
          })),
          campaign_name: `Bulk Send ${new Date().toLocaleString()}`,
          with_retry: true,
          use_ai_personalization: useAIPersonalization,
          personalize_per_contact: true
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        // Store campaign ID for cancellation
        if (result.data.campaign_id) {
          setActiveCampaignId(result.data.campaign_id);
        }
        
        // Update final progress
        setSendingProgress({
          current: result.data.total_contacts,
          total: result.data.total_contacts,
          successful: result.data.successful_sends,
          failed: result.data.failed_sends
        });
        
        setJobStatus('completed');
        setMessage('');
        setSelectedContacts([]);
        clearCsvUpload();
        setActiveCampaignId(null);
        
        // Show success message with details
        console.log('Bulk send completed:', result.data);
        alert(`✅ Bulk send completed!\n✓ Sent: ${result.data.successful_sends}\n✗ Failed: ${result.data.failed_sends}`);
      } else {
        setJobStatus('failed');
        console.error('Bulk send failed:', result.message);
        alert(`❌ Bulk send failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Bulk send failed:', error);
      setJobStatus('failed');
      alert('❌ Bulk send failed. Please check your connection.');
    } finally {
      setIsLoading(false);
      setActiveCampaignId(null);
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Column - Form */}
      <div className="space-y-6">
        {/* Message Composition */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Compose Message</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFormatMessage}
              disabled={isLoading || isFormattingMessage || !message.trim()}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              {isFormattingMessage ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Formatting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Format
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Template Variable Helpers */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-800 mb-2">Insert Variables:</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('name')}
                  className="h-7 text-xs"
                  type="button"
                >
                  + Name
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('company')}
                  className="h-7 text-xs"
                  type="button"
                >
                  + Company
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('email')}
                  className="h-7 text-xs"
                  type="button"
                >
                  + Email
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💡 Variables will be replaced with actual contact data
              </p>
            </div>

            <div>
              <Label htmlFor="message">Message Content</Label>
              <Textarea
                id="message"
                placeholder="Type your message here... Use variables like {name}, {company}"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 min-h-[120px] resize-none"
                disabled={isLoading}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {message.length}/1000 characters
                </span>
                <span className="text-sm text-gray-500">
                  Estimated cost: ${(selectedContacts.length * (useAIPersonalization ? 0.005 : 0.001)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* AI Personalization Toggle */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="ai-personalization"
                  checked={useAIPersonalization}
                  onChange={(e) => setUseAIPersonalization(e.target.checked)}
                  className="mt-1"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <label htmlFor="ai-personalization" className="font-medium text-sm text-purple-900 cursor-pointer">
                    🤖 AI Personalization (Recommended)
                  </label>
                  <p className="text-xs text-purple-700 mt-1">
                    AI creates unique variations for each contact - no two messages are the same!
                    Prevents spam detection and increases engagement.
                  </p>
                  {useAIPersonalization && (
                    <div className="mt-2 text-xs text-purple-600 bg-white bg-opacity-50 rounded p-2">
                      ✨ <strong>Smart Detection:</strong> AI will automatically detect available data
                      (name, company, email) and personalize accordingly
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Button */}
            {selectedContacts.length > 0 && (
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={isLoading || isLoadingPreview || !message.trim()}
                className="w-full"
              >
                {isLoadingPreview ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Preview Personalized Messages (First 5)
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Contact Selection */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Select Contacts</h3>
          </div>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="import">Import File</TabsTrigger>
              <TabsTrigger value="crm" onClick={() => {
                if (crmContacts.length === 0 && !isFetchingCrmContacts) {
                  fetchCrmContacts();
                }
              }}>From CRM</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter phone number (e.g., 7033009600)"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddContact()}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleAddContact}
                  disabled={!contactInput.trim() || isLoading}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                Add contacts one by one or paste multiple numbers separated by commas
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  csvUploadStatus === 'success' ? 'border-green-300 bg-green-50' :
                  csvUploadStatus === 'error' ? 'border-red-300 bg-red-50' :
                  'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {csvUploadStatus === 'uploading' ? (
                  <>
                    <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                    <p className="text-sm text-gray-600 mb-2">Processing CSV file...</p>
                  </>
                ) : csvUploadStatus === 'success' ? (
                  <>
                    <FileCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-sm text-green-600 mb-2">
                      CSV file uploaded successfully!
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      {csvFile?.name} - Contacts added to your selection
                    </p>
                  </>
                ) : csvUploadStatus === 'error' ? (
                  <>
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-sm text-red-600 mb-2">
                      Error uploading CSV file
                    </p>
                    {csvErrors.length > 0 && (
                      <div className="text-xs text-red-500 mb-4 max-h-32 overflow-y-auto">
                        {csvErrors.slice(0, 5).map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                        {csvErrors.length > 5 && (
                          <div>... and {csvErrors.length - 5} more errors</div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drop your CSV file here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supported formats: CSV with phone numbers
                    </p>
                  </>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="flex gap-2 justify-center mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || csvUploadStatus === 'uploading'}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  
                  {csvFile && (
                    <Button 
                      variant="outline" 
                      onClick={clearCsvUpload}
                      disabled={isLoading || csvUploadStatus === 'uploading'}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              
              {csvUploadStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="text-sm font-medium text-green-800">Contacts Saved to CRM</h4>
                  </div>
                  <p className="text-xs text-green-600">
                    Your contacts have been saved to the CRM and are ready to use. You can view them in the CRM page or send messages now.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="crm" className="space-y-4">
              {/* Header with search and refresh */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search contacts by name, phone, email, or company..."
                    value={crmSearchQuery}
                    onChange={(e) => setCrmSearchQuery(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchCrmContacts}
                  disabled={isLoading || isFetchingCrmContacts}
                  title="Refresh contacts"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetchingCrmContacts ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* Loading state */}
              {isFetchingCrmContacts && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Loading CRM contacts...</p>
                </div>
              )}

              {/* Error state */}
              {crmFetchError && !isFetchingCrmContacts && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm font-medium text-red-800">Error Loading Contacts</p>
                  </div>
                  <p className="text-xs text-red-600">{crmFetchError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchCrmContacts}
                    className="mt-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Contact list */}
              {!isFetchingCrmContacts && !crmFetchError && (
                <>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {filteredCrmContacts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>
                          {crmSearchQuery.trim() 
                            ? 'No contacts found matching your search' 
                            : 'No contacts in CRM yet'}
                        </p>
                        {!crmSearchQuery.trim() && (
                          <p className="text-sm mt-1">Upload a CSV to add contacts</p>
                        )}
                      </div>
                    ) : (
                      filteredCrmContacts.map((contact) => {
                        const isSelected = selectedCrmContactIds.has(contact.id);
                        const isAlreadyAdded = isContactAlreadyAdded(contact.phone_number);
                        
                        return (
                          <div
                            key={contact.id}
                            className={`flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                              isAlreadyAdded ? 'bg-gray-50 opacity-60' : ''
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleCrmContact(contact.id)}
                              disabled={isLoading || isAlreadyAdded}
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-sm">
                                  {contact.name || contact.phone_number}
                                </div>
                                {isAlreadyAdded && (
                                  <Badge variant="secondary" className="text-xs">
                                    Already added
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                {contact.phone_number}
                              </div>
                              {(contact.company || contact.email) && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {contact.company && <span>{contact.company}</span>}
                                  {contact.company && contact.email && <span> • </span>}
                                  {contact.email && <span>{contact.email}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Import button */}
                  {filteredCrmContacts.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {selectedCrmContactIds.size} contact{selectedCrmContactIds.size !== 1 ? 's' : ''} selected
                      </div>
                      <Button
                        onClick={handleImportFromCRM}
                        disabled={isLoading || selectedCrmContactIds.size === 0}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Import {selectedCrmContactIds.size} Contact{selectedCrmContactIds.size !== 1 ? 's' : ''}
                      </Button>
                    </div>
                  )}

                  {/* Info banner */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      💡 Tip: Select contacts from your CRM database to quickly add them for bulk sending. 
                      Duplicates will be automatically skipped.
                    </p>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Send Button & Progress */}
        <Card className="p-6">
          {jobStatus === 'sending' && (
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Sending Progress</span>
                <span className="text-gray-600">
                  {sendingProgress.current} / {sendingProgress.total}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${sendingProgress.total > 0 ? (sendingProgress.current / sendingProgress.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex gap-3">
                  <span className="text-green-600">✓ {sendingProgress.successful} sent</span>
                  {sendingProgress.failed > 0 && (
                    <span className="text-red-600">✗ {sendingProgress.failed} failed</span>
                  )}
                </div>
                <span>~{Math.ceil((sendingProgress.total - sendingProgress.current) * 3 / 60)}m remaining</span>
              </div>
              
              {/* Stop Button */}
              <Button
                onClick={handleStopSending}
                disabled={isStopping}
                variant="destructive"
                className="w-full"
                size="sm"
              >
                {isStopping ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Stop Sending
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Send Button */}
          <Button
            onClick={handleBulkSend}
            disabled={!message.trim() || selectedContacts.length === 0 || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Starting bulk send...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {selectedContacts.length} contacts
              </>
            )}
          </Button>
          
          {/* Status Messages */}
          {jobStatus === 'completed' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✅ Bulk send completed successfully!
            </div>
          )}
          
          {jobStatus === 'cancelled' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⚠️ Campaign was stopped by user
            </div>
          )}
          
          {jobStatus === 'failed' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              ❌ Bulk send failed. Please try again.
            </div>
          )}
        </Card>
      </div>

      {/* Right Column - Preview & Status */}
      <div className="space-y-6">
        {/* Selected Contacts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Selected Contacts</h3>
            <Badge variant="secondary">
              {selectedContacts.length} selected
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedContacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No contacts selected</p>
                <p className="text-sm">Add contacts to start sending messages</p>
              </div>
            ) : (
              selectedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.phone}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveContact(contact.id)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Message Preview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {showPreview ? 'Personalized Preview' : 'Message Preview'}
          </h3>
          {showPreview && previewMessages.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {previewMessages.map((preview, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-900">
                      {preview.contact.name || preview.contact.phone}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {preview.personalization_level}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-800 bg-white rounded p-3 mb-2">
                    {preview.personalized_message}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">
                      {preview.available_fields?.length || 0} fields available
                    </span>
                    <span className="text-gray-600">
                      {preview.character_count} chars
                    </span>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="w-full mt-2"
              >
                Close Preview
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
              {message.trim() ? (
                <div className="whitespace-pre-wrap text-sm">{message}</div>
              ) : (
                <div className="text-gray-500 italic">
                  Your message will appear here...
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Job Status */}
        {jobStatus !== 'idle' && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {jobStatus === 'sending' && <Clock className="h-5 w-5 text-blue-600 animate-spin" />}
              {jobStatus === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {jobStatus === 'failed' && <AlertCircle className="h-5 w-5 text-red-600" />}
              <h3 className="text-lg font-semibold">
                {jobStatus === 'sending' && 'Sending Messages...'}
                {jobStatus === 'completed' && 'Messages Sent Successfully!'}
                {jobStatus === 'failed' && 'Send Failed'}
              </h3>
            </div>
            
            {jobStatus === 'sending' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>0 / {selectedContacts.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }} />
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>

    {/* CSV Preview Dialog */}
    <Dialog open={showCsvPreview} onOpenChange={setShowCsvPreview}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>CSV Import Preview</DialogTitle>
          <DialogDescription>
            Review the contacts parsed from your CSV file before importing.
          </DialogDescription>
        </DialogHeader>

        {csvPreviewData && (
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {csvPreviewData.statistics.valid}
                    </div>
                    <div className="text-xs text-gray-600">Valid Contacts</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {csvPreviewData.statistics.invalid}
                    </div>
                    <div className="text-xs text-gray-600">Invalid Rows</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {csvPreviewData.statistics.totalRows}
                    </div>
                    <div className="text-xs text-gray-600">Total Rows</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Detected Columns */}
            {Object.keys(csvPreviewData.detectedColumns).length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Detected Columns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(csvPreviewData.detectedColumns).map(([key, value]) => (
                    <Badge key={key} variant="secondary">
                      {key}: <span className="font-mono ml-1">{value}</span>
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Import Result (if saved to CRM) */}
            {importResult && (
              <Card className="p-4 bg-green-50 border-green-200">
                <h4 className="font-semibold mb-2 text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Import Results
                </h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Created:</span>{' '}
                    <span className="font-semibold">{importResult.created}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Updated:</span>{' '}
                    <span className="font-semibold">{importResult.updated}</span>
                  </div>
                  {importResult.failed > 0 && (
                    <div>
                      <span className="text-red-700 font-medium">Failed:</span>{' '}
                      <span className="font-semibold">{importResult.failed}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Valid Contacts Table */}
            {csvPreviewData.contacts.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Valid Contacts ({csvPreviewData.contacts.length})</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        {csvPreviewData.detectedColumns.email && <TableHead>Email</TableHead>}
                        {csvPreviewData.detectedColumns.company && <TableHead>Company</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvPreviewData.contacts.slice(0, 10).map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.phone}</TableCell>
                          {csvPreviewData.detectedColumns.email && (
                            <TableCell className="text-gray-600">{contact.email || '-'}</TableCell>
                          )}
                          {csvPreviewData.detectedColumns.company && (
                            <TableCell className="text-gray-600">{contact.company || '-'}</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {csvPreviewData.contacts.length > 10 && (
                    <div className="p-2 bg-gray-50 text-center text-sm text-gray-600">
                      Showing 10 of {csvPreviewData.contacts.length} contacts
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Errors List */}
            {csvPreviewData.errors.length > 0 && (
              <Card className="p-4 bg-red-50 border-red-200">
                <h4 className="font-semibold mb-2 text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Errors ({csvPreviewData.errors.length})
                </h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {csvPreviewData.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>{error}</span>
                    </div>
                  ))}
                  {csvPreviewData.errors.length > 10 && (
                    <div className="text-sm text-red-600 italic">
                      ... and {csvPreviewData.errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowCsvPreview(false);
              setCsvPreviewData(null);
              setImportResult(null);
            }}
          >
            Close
          </Button>
          {csvPreviewData && csvPreviewData.contacts.length > 0 && (
            <>
              <Button
                variant="secondary"
                onClick={handleAddToCampaign}
                disabled={isSavingToCRM}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Campaign
              </Button>
              <Button
                onClick={handleSaveToCRM}
                disabled={isSavingToCRM || !!importResult}
              >
                {isSavingToCRM ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : importResult ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Saved to CRM
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Save to CRM
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
} 