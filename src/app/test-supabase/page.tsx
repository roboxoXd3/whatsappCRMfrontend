'use client';

import React from 'react';
import SupabaseTest from '@/components/test/supabase-test';

export default function TestSupabasePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Integration Test</h1>
          <p className="text-gray-600">
            Test your connection to the self-hosted Supabase instance and verify database operations.
          </p>
        </div>

        <div className="grid gap-6">
          <SupabaseTest />
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Integration Guide</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h3 className="font-medium text-gray-900">1. Import Supabase Client</h3>
                <pre className="bg-gray-100 rounded p-2 mt-1 overflow-x-auto">
                  <code>{`import { supabase } from '@/integrations/supabase';`}</code>
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">2. Query Data</h3>
                <pre className="bg-gray-100 rounded p-2 mt-1 overflow-x-auto">
                  <code>{`const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .limit(10);`}</code>
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">3. Insert Data</h3>
                <pre className="bg-gray-100 rounded p-2 mt-1 overflow-x-auto">
                  <code>{`const { data, error } = await supabase
  .from('contacts')
  .insert([
    { phone_number: '+1234567890', name: 'John Doe' }
  ]);`}</code>
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">4. TypeScript Support</h3>
                <pre className="bg-gray-100 rounded p-2 mt-1 overflow-x-auto">
                  <code>{`import type { Contact, ContactInsert } from '@/integrations/supabase';

const newContact: ContactInsert = {
  phone_number: '+1234567890',
  name: 'John Doe'
};`}</code>
                </pre>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Available Tables</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <div>• contacts</div>
              <div>• conversations</div>
              <div>• bulk_campaigns</div>
              <div>• message_results</div>
              <div>• lead_details</div>
              <div>• lead_requirements</div>
              <div>• lead_documents</div>
              <div>• lead_interactions</div>
              <div>• contact_lists</div>
              <div>• contact_list_memberships</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
