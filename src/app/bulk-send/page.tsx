'use client';

import { useState } from 'react';
import { Send, CheckCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkSendForm } from '@/components/bulk-send/bulk-send-form';
import { BulkSendHistory } from '@/components/bulk-send/bulk-send-history';
import { BulkSendStats } from '@/components/bulk-send/bulk-send-stats';

export default function BulkSendPage() {
  const [activeTab, setActiveTab] = useState('send');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bulk Send</h1>
              <p className="text-sm text-gray-500">Send messages to multiple contacts efficiently</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-500">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-xs text-gray-500">Sent Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-xs text-gray-500">Total Contacts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Messages
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 h-full">
            <TabsContent value="send" className="h-full">
              <BulkSendForm />
            </TabsContent>

            <TabsContent value="history" className="h-full">
              <BulkSendHistory />
            </TabsContent>

            <TabsContent value="stats" className="h-full">
              <BulkSendStats />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 