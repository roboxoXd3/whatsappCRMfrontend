'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase';

interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  contactsCount: number | null;
  conversationsCount: number | null;
}

export default function SupabaseTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: false,
    error: null,
    contactsCount: null,
    conversationsCount: null,
  });

  const testConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Test basic connection
      const { data, error } = await supabase.from('contacts').select('count').limit(1);
      
      if (error) {
        throw error;
      }

      // If we get here, connection is working. Now get some stats
      const [contactsResult, conversationsResult] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }),
        supabase.from('conversations').select('*', { count: 'exact', head: true })
      ]);

      setStatus({
        isConnected: true,
        isLoading: false,
        error: null,
        contactsCount: contactsResult.count || 0,
        conversationsCount: conversationsResult.count || 0,
      });

    } catch (error: any) {
      console.error('Supabase connection error:', error);
      setStatus({
        isConnected: false,
        isLoading: false,
        error: error.message || 'Failed to connect to Supabase',
        contactsCount: null,
        conversationsCount: null,
      });
    }
  };

  const createTestContact = async () => {
    try {
      const testContact = {
        phone_number: `+1${Date.now()}`, // Unique phone number
        name: 'Test Contact',
        email: 'test@example.com',
        metadata: { source: 'supabase-test' }
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([testContact])
        .select();

      if (error) {
        throw error;
      }

      console.log('Test contact created:', data);
      alert('Test contact created successfully!');
      
      // Refresh connection status to update counts
      testConnection();

    } catch (error: any) {
      console.error('Error creating test contact:', error);
      alert(`Error creating test contact: ${error.message}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Supabase Connection Test
          {status.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!status.isLoading && status.isConnected && <CheckCircle className="h-4 w-4 text-green-500" />}
          {!status.isLoading && !status.isConnected && status.error && <XCircle className="h-4 w-4 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status:</span>
            <span className={`text-sm ${status.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {status.isLoading ? 'Testing...' : status.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {status.contactsCount !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Contacts:</span>
              <span className="text-sm text-gray-600">{status.contactsCount}</span>
            </div>
          )}
          
          {status.conversationsCount !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Conversations:</span>
              <span className="text-sm text-gray-600">{status.conversationsCount}</span>
            </div>
          )}
          
          {status.error && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <p className="text-sm text-red-600">{status.error}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button 
            onClick={testConnection} 
            disabled={status.isLoading}
            className="w-full"
            variant="outline"
          >
            {status.isLoading ? 'Testing...' : 'Test Connection'}
          </Button>
          
          {status.isConnected && (
            <Button 
              onClick={createTestContact}
              className="w-full"
              variant="default"
            >
              Create Test Contact
            </Button>
          )}
        </div>

        <div className="bg-gray-50 rounded p-3 space-y-1">
          <p className="text-xs text-gray-600 font-medium">Connection Details:</p>
          <p className="text-xs text-gray-500">URL: https://supabase-6421998587235257.kloudbeansite.com</p>
          <p className="text-xs text-gray-500">Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
        </div>
      </CardContent>
    </Card>
  );
}
