'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, AlertCircle, RefreshCw, Trash2, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/lib/stores/auth';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { QRCodeScanner } from '@/components/whatsapp/qr-code-scanner';
import { WhatsAppSessionAPI, WhatsAppSession, QRCodeData, SessionStatus } from '@/lib/api/whatsapp-session';

// Types are now imported from the API module

export default function WhatsAppConnectPage() {
  const { user, token } = useAuthStore();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [currentQR, setCurrentQR] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sessionName, setSessionName] = useState('');
  
  useEffect(() => {
    if (user && token) {
      loadSessions();
    }
  }, [user, token]);

  const loadSessions = async () => {
    try {
      const data = await WhatsAppSessionAPI.listSessions();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
      toast({
        title: "Failed to load WhatsApp sessions",
        description: err instanceof Error ? err.message : 'Please check your connection and try again.',
        variant: "destructive",
      });
    }
  };

  const createSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: "Session name required",
        description: "Please enter a name for your WhatsApp session",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your WhatsApp phone number",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.startsWith('+')) {
      toast({
        title: "Invalid phone number",
        description: "Phone number must include country code (e.g., +1234567890)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const qrData = await WhatsAppSessionAPI.createSession(phoneNumber, sessionName);
      
      // Handle different response scenarios
      if (qrData.status === 'connected') {
        // Session is already connected
        setCurrentQR(null);
        toast({
          title: "WhatsApp already connected!",
          description: "Your WhatsApp is already connected for this number.",
        });
      } else if (qrData.qr_code) {
        // QR code available for scanning
        setCurrentQR(qrData);
        toast({
          title: "QR Code generated",
          description: "Scan the QR code with your WhatsApp to connect.",
        });
      } else {
        // Unexpected response
        toast({
          title: "Session created",
          description: "Session created but no QR code available. Please try refreshing.",
          variant: "destructive",
        });
      }

      // Refresh sessions list
      loadSessions();
    } catch (err) {
      console.error('Error creating session:', err);
      toast({
        title: "Failed to create session",
        description: err instanceof Error ? err.message : 'Please check your connection and try again.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshQR = async (sessionId: string) => {
    setLoading(true);

    try {
      const refreshedData = await WhatsAppSessionAPI.refreshQRCode(sessionId);
      
      // Check if session is already connected
      if (refreshedData.message === 'Session is already connected') {
        toast({
          title: "Session Already Connected",
          description: "This WhatsApp session is already connected and active.",
          variant: "default",
        });
        
        // Update session status in the list
        setSessions(prev => prev.map(session => 
          session.session_id === sessionId 
            ? { ...session, status: 'connected' }
            : session
        ));
        
        setCurrentQR(null); // Clear QR display since it's connected
        
        // Refresh the session list to get updated status
        loadSessions();
        return;
      }
      
      // Find the session to get its name
      const session = sessions.find(s => s.session_id === sessionId);
      
      // Create or update current QR with refreshed data
      const qrData = {
        session_id: sessionId,
        session_name: session?.session_name || 'WhatsApp Session',
        qr_code: refreshedData.qr_code || '',
        qr_url: refreshedData.qr_url || '',
        expires_at: refreshedData.expires_at || '',
        webhook_url: '',
        status: 'pending'
      };
      
      setCurrentQR(qrData);

      // Debug: Log QR data to console
      console.log('QR Data received:', qrData);
      console.log('QR Code length:', qrData.qr_code?.length || 0);
      console.log('QR Code preview:', qrData.qr_code?.substring(0, 50) + '...');
      console.log('Current time:', new Date().toISOString());
      console.log('Expires at:', qrData.expires_at);
      console.log('Is expired?', qrData.expires_at ? new Date(qrData.expires_at) < new Date() : false);

      toast({
        title: "QR Code refreshed",
        description: "New QR code generated. Please scan with your WhatsApp.",
      });
    } catch (err) {
      console.error('Error refreshing QR:', err);
      
      // Check if it's an authentication error
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
        toast({
          title: "Authentication Error",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
        // Optionally redirect to login or refresh the page
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast({
          title: "Failed to refresh QR code",
          description: err instanceof Error ? err.message : 'Please try again.',
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this WhatsApp session?')) {
      return;
    }

    try {
      await WhatsAppSessionAPI.deleteSession(sessionId);

      // Remove from local state
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));

      // Clear current QR if it matches
      if (currentQR && currentQR.session_id === sessionId) {
        setCurrentQR(null);
      }
      
      toast({
        title: "Session deleted",
        description: "WhatsApp session has been successfully deleted.",
      });
    } catch (err) {
      console.error('Error deleting session:', err);
      toast({
        title: "Failed to delete session",
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: "destructive",
      });
    }
  };

  // Handle status updates from QR scanner
  const handleStatusUpdate = (status: SessionStatus) => {
    // Update current QR status
    if (currentQR && currentQR.session_id === status.session_id) {
      setCurrentQR(prev => prev ? { ...prev, status: status.status } : null);
    }

    // Update sessions list
    setSessions(prev => prev.map(session => 
      session.session_id === status.session_id 
        ? { 
            ...session, 
            status: status.status,
            phone_number: status.phone_number || session.phone_number,
            connected_at: status.connected_at || session.connected_at
          }
        : session
    ));
  };

  // Handle successful connection
  const handleConnected = () => {
    setCurrentQR(null); // Hide QR code on successful connection
    loadSessions(); // Refresh sessions list
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = WhatsAppSessionAPI.formatStatus(status);
    
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{statusInfo.label}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />{statusInfo.label}</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />{statusInfo.label}</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />{statusInfo.label}</Badge>;
      default:
        return <Badge variant="outline">{statusInfo.label}</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Connect WhatsApp</h1>
        <p className="text-gray-600">
          Scan the QR code with your WhatsApp to connect your account and start using our automation features.
        </p>
      </div>

      {/* QR Code Display */}
      {currentQR && (
        <QRCodeScanner
          qrData={currentQR}
          onStatusUpdate={handleStatusUpdate}
          onConnected={handleConnected}
          onError={(error) => toast({
            title: "QR Code Error",
            description: error,
            variant: "destructive",
          })}
          onRefresh={() => refreshQR(currentQR.session_id)}
          autoRefresh={true}
          className="mb-8"
        />
      )}

      {/* Session Name & Phone Number Input */}
      {!currentQR && (
        <div className="mb-8 space-y-4">
          <div>
            <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 mb-2">
              Session Name
            </label>
            <input
              id="sessionName"
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="My Business WhatsApp"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Give your WhatsApp session a memorable name
            </p>
          </div>
          
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Include country code (e.g., +1 for US, +91 for India)
            </p>
          </div>
          
          <Button 
            onClick={createSession} 
            disabled={loading || !phoneNumber.trim() || !sessionName.trim()} 
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Connect WhatsApp Account'}
          </Button>
        </div>
      )}

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your WhatsApp Sessions</CardTitle>
          <CardDescription>
            Manage your connected WhatsApp accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No WhatsApp accounts connected yet.</p>
              <p className="text-sm text-gray-400 mt-1">Connect your first account to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{session.session_name}</h3>
                      {getStatusBadge(session.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Created: {WhatsAppSessionAPI.formatDateTime(session.created_at)}</p>
                      {session.connected_at && (
                        <p>Connected: {WhatsAppSessionAPI.formatDateTime(session.connected_at)}</p>
                      )}
                      {session.phone_number && (
                        <p>Phone: {session.phone_number}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.status === 'pending' && (
                      <Button
                        onClick={() => refreshQR(session.session_id)}
                        disabled={loading}
                        size="sm"
                        variant="outline"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Show QR
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => deleteSession(session.session_id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>Troubleshooting:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Make sure you have a stable internet connection</li>
              <li>QR codes expire after 5 minutes - refresh if needed</li>
              <li>Only one WhatsApp account can be connected per session</li>
              <li>If scanning fails, try refreshing the QR code</li>
            </ul>
            
            <p className="mt-4"><strong>Important:</strong></p>
            <p className="ml-4">
              By connecting your WhatsApp account, you agree to our terms of service. 
              WhatsApp may restrict accounts that violate their usage policies.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </ProtectedRoute>
  );
}
