'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTestCustomerContext } from '@/hooks/useCustomerContext';
import { CustomerContextCard } from './customer-context-card';

export function CustomerContextTest() {
  const [phoneNumber, setPhoneNumber] = useState('917014020949'); // Anisha Gupta from testing guide
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { testContext } = useTestCustomerContext();

  const testPhoneNumbers = [
    { number: '917014020949', name: 'Anisha Gupta (CEO - Known Customer)' },
    { number: '917033009600', name: 'Rishav (Developer - Known Customer)' },
    { number: '919999999999', name: 'Unknown Customer' },
    { number: '918881616123', name: 'Test Number' },
  ];

  const handleTest = async () => {
    if (!phoneNumber.trim()) return;
    
    setIsLoading(true);
    setTestResult(null);
    setError(null);
    
    try {
      console.log('🧪 Starting customer context test...');
      console.log('📱 Input phone number:', phoneNumber);
      
      // Clean the phone number
      const cleanPhoneNumber = phoneNumber.replace('_s_whatsapp_net', '');
      console.log('🧹 Cleaned phone number:', cleanPhoneNumber);
      
      // Test the API directly first
      console.log('🔍 Testing API directly...');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const directApiResponse = await fetch(`${API_BASE}/api/customer-context/${cleanPhoneNumber}`);
      const directApiData = await directApiResponse.json();
      console.log('📊 Direct API Response:', directApiData);
      
      // Now test through our API client
      console.log('🔄 Testing through API client...');
      const result = await testContext(phoneNumber);
      console.log('✅ API Client Result:', result);
      
      setTestResult(result);
    } catch (err: any) {
      console.error('❌ Test failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Customer Context API Test
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              CRM Integration
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <div className="flex gap-2">
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number (e.g., 917014020949)"
                className="flex-1"
              />
              <Button 
                onClick={handleTest}
                disabled={isLoading || !phoneNumber.trim()}
              >
                {isLoading ? 'Testing...' : 'Test API'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Test Numbers</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {testPhoneNumbers.map((test) => (
                <Button
                  key={test.number}
                  variant="outline"
                  size="sm"
                  onClick={() => setPhoneNumber(test.number)}
                  className="justify-start text-left"
                >
                  <div>
                    <div className="font-medium">{test.number}</div>
                    <div className="text-xs text-gray-500">{test.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">❌ Error:</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {testResult && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">API Response</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>

              {testResult.success && testResult.customer_found && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Customer Context Card Preview</h3>
                  <CustomerContextCard 
                    phoneNumber={phoneNumber}
                    className="max-w-md"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium">Expected Results:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mt-1">
              <li><strong>917014020949 (Anisha Gupta):</strong> CEO at Rian Infotech, contacted status, active deals</li>
              <li><strong>917033009600 (Rishav):</strong> Developer at Tech Solutions, new lead status</li>
              <li><strong>919999999999:</strong> Unknown customer, no CRM data</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium">What to Check:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mt-1">
              <li>API response time (should be under 200ms)</li>
              <li>Customer data accuracy (name, company, lead status)</li>
              <li>Active deals and pending tasks display</li>
              <li>Graceful handling of unknown customers</li>
              <li>Real-time data from your CRM system</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-3 rounded">
            <h4 className="font-medium text-blue-800">💡 Pro Tip:</h4>
            <p className="text-blue-700 text-xs mt-1">
              Open browser console to see detailed API logs and performance metrics.
              The customer context will automatically update in conversation lists!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 