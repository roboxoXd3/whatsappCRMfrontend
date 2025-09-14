'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, AlertCircle, RefreshCw, Trash2, Clock, Plus, Activity, Power, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/lib/stores/auth';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { QRCodeScanner } from '@/components/whatsapp/qr-code-scanner';
import { WhatsAppSessionAPI, WhatsAppSession, QRCodeData, SessionStatus, HealthCheckResult, LiveSessionStatus } from '@/lib/api/whatsapp-session';

// Types are now imported from the API module

export default function WhatsAppConnectPage() {
  const { user, token } = useAuthStore();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [currentQR, setCurrentQR] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  
  useEffect(() => {
    if (user && token) {
      loadSessions();
    }
  }, [user, token]);

  // Auto-sync sessions every 30 seconds
  useEffect(() => {
    if (!autoSyncEnabled || !user || !token) return;

    const syncInterval = setInterval(async () => {
      try {
        const syncResult = await WhatsAppSessionAPI.syncAllStatuses();
        
        // If any sessions were updated, refresh the sessions list
        if (syncResult.updated_sessions > 0 || syncResult.deleted_sessions > 0) {
          console.log('🔄 Auto-sync: Sessions updated, refreshing list');
          loadSessions();
          
          // Show toast for significant changes
          if (syncResult.updated_sessions > 0) {
            toast({
              title: "Sessions updated",
              description: `${syncResult.updated_sessions} session(s) status changed`,
            });
          }
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
        // Don't show error toast for auto-sync failures to avoid spam
      }
    }, 30000); // 30 seconds

    return () => clearInterval(syncInterval);
  }, [autoSyncEnabled, user, token, toast]);

  const loadSessions = async () => {
    try {
      const data = await WhatsAppSessionAPI.listSessions();
      console.log('🔍 DEBUG - API Response:', data);
      console.log('🔍 DEBUG - Sessions:', data.sessions);
      if (data.sessions && data.sessions.length > 0) {
        console.log('🔍 DEBUG - First session:', data.sessions[0]);
        console.log('🔍 DEBUG - First session webhook_url:', data.sessions[0].webhook_url);
        console.log('🔍 DEBUG - First session metadata:', data.sessions[0].metadata);
      }
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

  const performHealthCheck = async () => {
    setHealthLoading(true);
    try {
      const health = await WhatsAppSessionAPI.healthCheck();
      setHealthData(health);
      
      // Update sessions with health info
      setSessions(prev => prev.map(session => {
        const healthInfo = health.sessions.find(h => h.session_id === session.session_id);
        if (healthInfo && healthInfo.live_status && healthInfo.live_status !== session.status) {
          return { ...session, status: healthInfo.live_status as any };
        }
        return session;
      }));

      toast({
        title: "Health check completed",
        description: `${health.connected}/${health.total_sessions} sessions are healthy`,
      });
    } catch (err) {
      console.error('Error performing health check:', err);
      toast({
        title: "Health check failed",
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: "destructive",
      });
    } finally {
      setHealthLoading(false);
    }
  };

  const performManualSync = async () => {
    setHealthLoading(true);
    try {
      const syncResult = await WhatsAppSessionAPI.syncAllStatuses();
      
      // Refresh sessions list
      loadSessions();
      
      toast({
        title: "Sync completed",
        description: `${syncResult.synced_sessions} sessions synced, ${syncResult.updated_sessions} updated, ${syncResult.deleted_sessions} removed`,
      });
    } catch (err) {
      console.error('Error performing manual sync:', err);
      toast({
        title: "Sync failed",
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: "destructive",
      });
    } finally {
      setHealthLoading(false);
    }
  };

  const disconnectSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to disconnect this WhatsApp session?')) {
      return;
    }

    try {
      await WhatsAppSessionAPI.disconnectSession(sessionId);

      // Update session status locally
      setSessions(prev => prev.map(session => 
        session.session_id === sessionId 
          ? { ...session, status: 'expired' }
          : session
      ));

      toast({
        title: "Session disconnected",
        description: "WhatsApp session has been successfully disconnected.",
      });
    } catch (err) {
      console.error('Error disconnecting session:', err);
      toast({
        title: "Failed to disconnect session",
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: "destructive",
      });
    }
  };

  const checkLiveStatus = async (sessionId: string) => {
    try {
      const liveStatus = await WhatsAppSessionAPI.checkLiveStatus(sessionId);
      
      // Update session with live status
      setSessions(prev => prev.map(session => 
        session.session_id === sessionId 
          ? { 
              ...session, 
              status: liveStatus.live_status as any,
              phone_number: liveStatus.phone_number || session.phone_number,
              connected_at: liveStatus.connected_at || session.connected_at
            }
          : session
      ));

      toast({
        title: "Status updated",
        description: `Live status: ${liveStatus.live_status}`,
      });
    } catch (err) {
      console.error('Error checking live status:', err);
      toast({
        title: "Failed to check live status",
        description: err instanceof Error ? err.message : 'Please try again.',
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
      // Find the session to determine if it needs reconnection or just QR refresh
      const session = sessions.find(s => s.session_id === sessionId);
      const needsReconnection = session?.status === 'expired' || session?.status === 'failed' || session?.status === 'logged_out';
      
      let refreshedData;
      
      if (needsReconnection) {
        // Use reconnect endpoint for expired/failed sessions
        refreshedData = await WhatsAppSessionAPI.reconnectSession(sessionId);
        toast({
          title: "Reconnection initiated",
          description: "Session reconnection started. Please scan the QR code.",
        });
      } else {
        // Use regular QR refresh for pending sessions
        refreshedData = await WhatsAppSessionAPI.refreshQRCode(sessionId);
        
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
        
        toast({
          title: "QR Code refreshed",
          description: "New QR code generated. Please scan with your WhatsApp.",
        });
      }
      
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

      // Update session status to pending
      setSessions(prev => prev.map(s => 
        s.session_id === sessionId 
          ? { ...s, status: 'pending' }
          : s
      ));

      // Debug: Log QR data to console
      console.log('QR Data received:', qrData);
      console.log('QR Code length:', qrData.qr_code?.length || 0);
      console.log('QR Code preview:', qrData.qr_code?.substring(0, 50) + '...');
      console.log('Current time:', new Date().toISOString());
      console.log('Expires at:', qrData.expires_at);
      console.log('Is expired?', qrData.expires_at ? new Date(qrData.expires_at) < new Date() : false);

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
      case 'logged_out':
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1" />{statusInfo.label}</Badge>;
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

      {/* Health Dashboard */}
      {sessions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Session Health Dashboard
                </CardTitle>
                <CardDescription>
                  Monitor the status of all your WhatsApp sessions
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={performHealthCheck}
                  disabled={healthLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
                  {healthLoading ? 'Checking...' : 'Health Check'}
                </Button>
                <Button
                  onClick={performManualSync}
                  disabled={healthLoading}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
                  Sync Now
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-sync"
                  checked={autoSyncEnabled}
                  onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="auto-sync" className="text-sm text-gray-600">
                  Auto-sync every 30 seconds
                </label>
              </div>
              {autoSyncEnabled && (
                <div className="text-xs text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Auto-sync active
                </div>
              )}
            </div>
            {healthData ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{healthData.connected}</div>
                  <div className="text-sm text-green-700">Connected</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{healthData.pending}</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{healthData.expired}</div>
                  <div className="text-sm text-gray-700">Expired</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{healthData.failed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Click "Health Check" to monitor session status
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your WhatsApp Sessions</CardTitle>
              <CardDescription>
                Manage your connected WhatsApp accounts
              </CardDescription>
            </div>
            <Button
              onClick={loadSessions}
              disabled={loading}
              size="sm"
              variant="outline"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Sessions
            </Button>
          </div>
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
                      {session.webhook_url && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Webhook Active</span>
                          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">
                            {session.webhook_url.split('/').pop()}
                          </code>
                        </div>
                      )}
                      {/* Debug info - remove in production */}
                      {process.env.NODE_ENV === 'development' && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 cursor-pointer">Debug Info</summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify({
                              webhook_url: session.webhook_url,
                              has_metadata: !!session.metadata,
                              webhook_config: session.metadata?.webhook_config
                            }, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(session.status === 'pending' || session.status === 'expired' || session.status === 'failed' || session.status === 'logged_out') && (
                      <Button
                        onClick={() => refreshQR(session.session_id)}
                        disabled={loading}
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        {session.status === 'pending' ? 'Show QR' : 'Reconnect'}
                      </Button>
                    )}
                    
                    {session.status === 'connected' && (
                      <Button
                        onClick={() => disconnectSession(session.session_id)}
                        disabled={loading}
                        size="sm"
                        variant="outline"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <Power className="w-4 h-4 mr-1" />
                        Disconnect
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => checkLiveStatus(session.session_id)}
                      disabled={loading}
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Wifi className="w-4 h-4 mr-1" />
                      Check Status
                    </Button>
                    
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
