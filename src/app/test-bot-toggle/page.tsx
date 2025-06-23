'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api/client';

export default function TestBotTogglePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBotToggle = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log('🧪 Testing bot toggle API...');

      // Test bot status first
      const statusResponse = await apiClient.get('/api/bot/status-summary');
      console.log('✅ Bot Status Response:', statusResponse);

      // Test toggle by phone
      const toggleResponse = await apiClient.post('/api/bot/toggle-by-phone', {
        phone_number: '8881616123',
        enabled: false,
        reason: 'Test toggle from frontend'
      });
      console.log('✅ Toggle Response:', toggleResponse);

      setResult({
        status: statusResponse,
        toggle: toggleResponse
      });

    } catch (err) {
      console.error('❌ Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log('🧪 Testing direct fetch...');

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${API_BASE}/api/bot/toggle-by-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: '8881616123',
          enabled: true,
          reason: 'Direct fetch test'
        })
      });

      const data = await response.json();
      console.log('✅ Direct fetch response:', data);

      setResult({ directFetch: data });

    } catch (err) {
      console.error('❌ Direct fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bot Toggle Test</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testBotToggle}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Bot Toggle (API Client)'}
        </button>

        <button
          onClick={testDirectFetch}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          {loading ? 'Testing...' : 'Test Direct Fetch'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="bg-gray-100 border rounded p-4">
          <h2 className="font-semibold mb-2">Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 