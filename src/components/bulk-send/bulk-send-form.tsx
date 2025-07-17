'use client';

import { useState, useRef } from 'react';
import { Send, Users, Upload, FileText, Plus, X, CheckCircle, AlertCircle, Clock, FileCheck, AlertTriangle, Sparkles } from 'lucide-react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

export function BulkSendForm() {
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [contactInput, setContactInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<'idle' | 'sending' | 'completed' | 'failed'>('idle');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploadStatus, setCsvUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [isFormattingMessage, setIsFormattingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Parse CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const contacts = parseCsvContacts(results.data as any[]);
          if (contacts.length > 0) {
            setSelectedContacts(prev => [...prev, ...contacts]);
            setCsvUploadStatus('success');
          } else {
            setCsvUploadStatus('error');
            setCsvErrors(['No valid contacts found in CSV file']);
          }
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

  const parseCsvContacts = (data: any[]): Contact[] => {
    const contacts: Contact[] = [];
    const errors: string[] = [];

    // Common phone number field names
    const phoneFields = ['phone', 'phone_number', 'mobile', 'whatsapp', 'number', 'contact'];
    const nameFields = ['name', 'full_name', 'contact_name', 'customer_name'];
    const emailFields = ['email', 'email_address', 'mail'];
    const companyFields = ['company', 'organization', 'business'];

    if (data.length === 0) {
      setCsvErrors(['CSV file is empty']);
      return contacts;
    }

    // Find field mappings
    const headers = Object.keys(data[0]).map(h => h.toLowerCase());
    const phoneField = phoneFields.find(field => headers.includes(field));
    const nameField = nameFields.find(field => headers.includes(field));
    const emailField = emailFields.find(field => headers.includes(field));
    const companyField = companyFields.find(field => headers.includes(field));

    if (!phoneField) {
      setCsvErrors([`No phone number column found. Expected one of: ${phoneFields.join(', ')}`]);
      return contacts;
    }

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

      // Check for duplicates
      const existingContact = selectedContacts.find(c => c.phone === cleanedPhone);
      if (existingContact) {
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

    // Set errors if any
    if (errors.length > 0) {
      setCsvErrors(errors);
    }

    return contacts;
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

  const handleBulkSend = async () => {
    if (!message.trim() || selectedContacts.length === 0) return;

    setIsLoading(true);
    setJobStatus('sending');

    try {
      // Call the new bulk send API endpoint
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/bulk-send/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          contacts: selectedContacts.map(c => c.phone),
          campaign_name: `Bulk Send ${new Date().toLocaleString()}`,
          with_retry: true
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setJobStatus('completed');
        setMessage('');
        setSelectedContacts([]);
        clearCsvUpload();
        
        // Show success message with details
        console.log('Bulk send completed:', result.data);
      } else {
        setJobStatus('failed');
        console.error('Bulk send failed:', result.message);
      }
    } catch (error) {
      console.error('Bulk send failed:', error);
      setJobStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            <div>
              <Label htmlFor="message">Message Content</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
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
                  Estimated cost: ${(selectedContacts.length * 0.01).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Selection */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Select Contacts</h3>
          </div>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="import">Import File</TabsTrigger>
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">CSV Format Guidelines</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Required: Phone number column (phone, mobile, whatsapp, etc.)</li>
                    <li>• Optional: Name, email, company columns</li>
                    <li>• Phone numbers should include country code</li>
                    <li>• Duplicate numbers will be automatically filtered</li>
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Send Button */}
        <Card className="p-6">
          <Button
            onClick={handleBulkSend}
            disabled={!message.trim() || selectedContacts.length === 0 || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Sending to {selectedContacts.length} contacts...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {selectedContacts.length} contacts
              </>
            )}
          </Button>
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
          <h3 className="text-lg font-semibold mb-4">Message Preview</h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
            {message.trim() ? (
              <div className="whitespace-pre-wrap text-sm">{message}</div>
            ) : (
              <div className="text-gray-500 italic">
                Your message will appear here...
              </div>
            )}
          </div>
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
  );
} 