'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Plus, Key, TestTube, Trash2, Edit, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getApiKeys, addApiKey, updateApiKey, deleteApiKey, testApiKey, type ApiKey, type AddApiKeyRequest } from '@/lib/api/api-keys';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [testingKeys, setTestingKeys] = useState<Set<string>>(new Set());

  // Add API Key Form State
  const [newKeyData, setNewKeyData] = useState<AddApiKeyRequest>({
    key_type: 'openai',
    key_name: '',
    api_key: ''
  });
  const [addingKey, setAddingKey] = useState(false);

  // Load API keys
  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await getApiKeys();
      if (response.status === 'success' && response.data) {
        setApiKeys(response.data.api_keys);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load API keys',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new API key
  const handleAddApiKey = async () => {
    if (!newKeyData.key_name.trim() || !newKeyData.api_key.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAddingKey(true);
      const response = await addApiKey(newKeyData);
      
      if (response.status === 'success') {
        toast({
          title: 'Success',
          description: 'API key added successfully',
        });
        setAddDialogOpen(false);
        setNewKeyData({ key_type: 'openai', key_name: '', api_key: '' });
        loadApiKeys();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to add API key',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to add API key',
        variant: 'destructive',
      });
    } finally {
      setAddingKey(false);
    }
  };

  // Toggle API key active status
  const handleToggleActive = async (keyId: string, currentStatus: boolean) => {
    try {
      const response = await updateApiKey(keyId, { is_active: !currentStatus });
      
      if (response.status === 'success') {
        toast({
          title: 'Success',
          description: `API key ${!currentStatus ? 'activated' : 'deactivated'}`,
        });
        loadApiKeys();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update API key',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to update API key',
        variant: 'destructive',
      });
    }
  };

  // Test API key
  const handleTestApiKey = async (keyId: string) => {
    try {
      setTestingKeys(prev => new Set(prev).add(keyId));
      const response = await testApiKey(keyId);
      
      if (response.status === 'success' && response.data) {
        const { is_valid, message } = response.data;
        toast({
          title: is_valid ? 'API Key Valid' : 'API Key Invalid',
          description: message,
          variant: is_valid ? 'default' : 'destructive',
        });
      } else {
        toast({
          title: 'Test Failed',
          description: response.message || 'Failed to test API key',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to test API key',
        variant: 'destructive',
      });
    } finally {
      setTestingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyId);
        return newSet;
      });
    }
  };

  // Delete API key
  const handleDeleteApiKey = async (keyId: string) => {
    try {
      const response = await deleteApiKey(keyId);
      
      if (response.status === 'success') {
        toast({
          title: 'Success',
          description: 'API key deleted successfully',
        });
        loadApiKeys();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete API key',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-gray-600 mt-2">Manage your OpenAI and WhatsApp API keys</p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>
                Add a new API key for your workspace. Keys are encrypted and stored securely.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="key_type">API Key Type</Label>
                <Select value={newKeyData.key_type} onValueChange={(value: 'openai' | 'whatsapp') => 
                  setNewKeyData(prev => ({ ...prev, key_type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select API key type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="key_name">Key Name</Label>
                <Input
                  id="key_name"
                  placeholder="e.g., Production OpenAI Key"
                  value={newKeyData.key_name}
                  onChange={(e) => setNewKeyData(prev => ({ ...prev, key_name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  placeholder="sk-..."
                  value={newKeyData.api_key}
                  onChange={(e) => setNewKeyData(prev => ({ ...prev, api_key: e.target.value }))}
                />
                <p className="text-sm text-gray-500">
                  {newKeyData.key_type === 'openai' ? 
                    'Your OpenAI API key (starts with sk-)' : 
                    'Your WhatsApp API key'
                  }
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddApiKey} disabled={addingKey}>
                {addingKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {apiKeys.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Key className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
                <p className="text-gray-600 text-center mb-4">
                  Add your first API key to start using the AI chatbot features.
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Key className="h-5 w-5 text-gray-500" />
                      <div>
                        <CardTitle className="text-lg">{apiKey.key_name}</CardTitle>
                        <CardDescription>
                          {apiKey.key_type.toUpperCase()} API Key
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                        {apiKey.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Created: {formatDate(apiKey.created_at)}</span>
                      </div>
                      {apiKey.last_used_at && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Last used: {formatDate(apiKey.last_used_at)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={apiKey.is_active}
                        onCheckedChange={() => handleToggleActive(apiKey.id, apiKey.is_active)}
                      />
                      
                      {apiKey.key_type === 'openai' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestApiKey(apiKey.id)}
                          disabled={testingKeys.has(apiKey.id)}
                        >
                          {testingKeys.has(apiKey.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{apiKey.key_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteApiKey(apiKey.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
} 