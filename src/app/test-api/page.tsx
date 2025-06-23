'use client';

import { useState, useEffect } from 'react';

export default function TestApiPage() {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [conversations, setConversations] = useState<any>(null);
  const [botStatus, setBotStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  useEffect(() => {
    async function testApis() {
      try {
        setLoading(true);
        setError(null);

        // Test health endpoint
        console.log('Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        setApiStatus(healthData);

        // Test conversations endpoint
        console.log('Testing conversations endpoint...');
        const conversationsResponse = await fetch(`${API_BASE}/api/conversations/unique`);
        const conversationsData = await conversationsResponse.json();
        setConversations(conversationsData);

        // Test bot status endpoint
        console.log('Testing bot status endpoint...');
        const botStatusResponse = await fetch(`${API_BASE}/api/bot/status-summary`);
        const botStatusData = await botStatusResponse.json();
        setBotStatus(botStatusData);

      } catch (err) {
        console.error('API Test Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    testApis();
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Testing API Connection...</h1>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className="mb-4">
        <strong>API Base URL:</strong> {API_BASE}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Health Status */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Health Check</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(apiStatus, null, 2)}
          </pre>
        </div>

        {/* Conversations */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Conversations</h2>
          <div className="mb-2">
            <strong>Status:</strong> {conversations?.status}
          </div>
          <div className="mb-2">
            <strong>Total Conversations:</strong> {conversations?.data?.length || 0}
          </div>
          <details>
            <summary className="cursor-pointer text-blue-600">View Raw Data</summary>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto mt-2">
              {JSON.stringify(conversations, null, 2)}
            </pre>
          </details>
        </div>

        {/* Bot Status */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Bot Status</h2>
          <div className="mb-2">
            <strong>Status:</strong> {botStatus?.status}
          </div>
          {botStatus?.data?.summary && (
            <div className="mb-2">
              <strong>Total Conversations:</strong> {botStatus.data.summary.total_conversations}
              <br />
              <strong>Bot Enabled:</strong> {botStatus.data.summary.bot_enabled}
              <br />
              <strong>Bot Disabled:</strong> {botStatus.data.summary.bot_disabled}
              <br />
              <strong>Enabled Percentage:</strong> {botStatus.data.summary.enabled_percentage}%
            </div>
          )}
          <details>
            <summary className="cursor-pointer text-blue-600">View Raw Data</summary>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto mt-2">
              {JSON.stringify(botStatus, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
} 