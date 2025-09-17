'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, AlertCircle, RefreshCw, Trash2, Clock, Plus, Activity, Power, Wifi, Shield, Zap, Users, MessageCircle, Settings, Globe, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/lib/stores/auth';
import { useToast } from '@/hooks/use-toast';
import { QRCodeScanner } from '@/components/whatsapp/qr-code-scanner';
import { WhatsAppSessionAPI, WhatsAppSession, QRCodeData, SessionStatus, HealthCheckResult, LiveSessionStatus, ExistingSessionCheck, WebhookConfig, UpdateWebhookRequest, WebhookEventInfo, WebhookEventType, AVAILABLE_WEBHOOK_EVENTS } from '@/lib/api/whatsapp-session';

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
  const [existingSession, setExistingSession] = useState<ExistingSessionCheck | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  
  // Webhook management state
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [currentWebhookSession, setCurrentWebhookSession] = useState<string | null>(null);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookEventInfo, setWebhookEventInfo] = useState<WebhookEventInfo | null>(null);
  const [webhookForm, setWebhookForm] = useState({
    webhook_url: '',
    webhook_enabled: false,
    webhook_events: [] as WebhookEventType[]
  });
  
  useEffect(() => {
    if (user && token) {
      loadSessions();
      checkExistingSession();
      loadWebhookEventInfo();
    }
  }, [user, token]);

  const loadWebhookEventInfo = async () => {
    try {
      const eventInfo = await WhatsAppSessionAPI.getAvailableWebhookEvents();
      setWebhookEventInfo(eventInfo);
    } catch (err) {
      console.error('Error loading webhook event info:', err);
    }
  };

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

  const checkExistingSession = async () => {
    setCheckingExisting(true);
    try {
      const data = await WhatsAppSessionAPI.checkExistingSession();
      setExistingSession(data);
    } catch (err) {
      console.error('Error checking existing session:', err);
      // Don't show error toast for this as it's not critical
    } finally {
      setCheckingExisting(false);
    }
  };

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

      // Refresh existing session check
      checkExistingSession();

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

      // Refresh sessions list and existing session check
      loadSessions();
      checkExistingSession();
    } catch (err) {
      console.error('Error creating session:', err);
      
      // Handle specific error cases from backend
      const errorMessage = err instanceof Error ? err.message : 'Please check your connection and try again.';
      
      if (errorMessage.includes('already connected') || errorMessage.includes('already exists')) {
        toast({
          title: "Session Already Exists",
          description: errorMessage,
          variant: "destructive",
        });
        // Refresh to show the existing session
        loadSessions();
        checkExistingSession();
      } else {
        toast({
          title: "Failed to create session",
          description: errorMessage,
          variant: "destructive",
        });
      }
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

      // Refresh existing session check
      checkExistingSession();
      
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

  // Webhook management functions
  const openWebhookModal = async (sessionId: string) => {
    setCurrentWebhookSession(sessionId);
    setWebhookLoading(true);
    setShowWebhookModal(true);
    
    try {
      const config = await WhatsAppSessionAPI.getWebhookConfig(sessionId);
      setWebhookConfig(config);
      setWebhookForm({
        webhook_url: config.webhook_url || '',
        webhook_enabled: config.webhook_enabled !== false, // Default to true if not explicitly false
        webhook_events: config.webhook_events && config.webhook_events.length > 0 
          ? config.webhook_events 
          : (webhookEventInfo?.available_events || [...AVAILABLE_WEBHOOK_EVENTS])
      });
    } catch (err) {
      console.error('Error loading webhook config:', err);
      toast({
        title: "Failed to load webhook configuration",
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: "destructive",
      });
      // Set default values with all events enabled by default
      setWebhookForm({
        webhook_url: '',
        webhook_enabled: true,
        webhook_events: webhookEventInfo?.available_events || [...AVAILABLE_WEBHOOK_EVENTS]
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  const closeWebhookModal = () => {
    setShowWebhookModal(false);
    setCurrentWebhookSession(null);
    setWebhookConfig(null);
    setWebhookForm({
      webhook_url: '',
      webhook_enabled: true,
      webhook_events: webhookEventInfo?.available_events || [...AVAILABLE_WEBHOOK_EVENTS]
    });
  };

  const updateWebhookConfig = async () => {
    if (!currentWebhookSession) return;
    
    setWebhookLoading(true);
    
    try {
      const updateData: UpdateWebhookRequest = {
        webhook_url: webhookForm.webhook_url,
        webhook_enabled: webhookForm.webhook_enabled,
        webhook_events: webhookForm.webhook_events
      };
      
      const updatedConfig = await WhatsAppSessionAPI.updateWebhookConfig(currentWebhookSession, updateData);
      setWebhookConfig(updatedConfig);
      
      toast({
        title: "Webhook configuration updated",
        description: "Your webhook settings have been successfully updated.",
      });
      
      // Refresh sessions to show updated webhook status
      loadSessions();
      closeWebhookModal();
    } catch (err) {
      console.error('Error updating webhook config:', err);
      toast({
        title: "Failed to update webhook configuration",
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: "destructive",
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  const toggleWebhookEvent = (event: WebhookEventType) => {
    setWebhookForm(prev => ({
      ...prev,
      webhook_events: prev.webhook_events.includes(event)
        ? prev.webhook_events.filter(e => e !== event)
        : [...prev.webhook_events, event]
    }));
  };

  const selectAllWebhookEvents = () => {
    if (!webhookEventInfo) return;
    setWebhookForm(prev => ({
      ...prev,
      webhook_events: [...webhookEventInfo.available_events]
    }));
  };

  const deselectAllWebhookEvents = () => {
    setWebhookForm(prev => ({
      ...prev,
      webhook_events: []
    }));
  };

  const selectDefaultWebhookEvents = () => {
    if (!webhookEventInfo) return;
    setWebhookForm(prev => ({
      ...prev,
      webhook_events: [...webhookEventInfo.default_events]
    }));
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-4 sm:mb-6 shadow-lg">
              <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Connect WhatsApp
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Seamlessly integrate your WhatsApp account to unlock powerful automation features and streamline your business communications.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="text-center p-4 sm:p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-green-100 hover:border-green-200 transition-colors">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Automation</h3>
              <p className="text-sm text-gray-600">Automate responses and workflows</p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-blue-100 hover:border-blue-200 transition-colors">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Bulk Messaging</h3>
              <p className="text-sm text-gray-600">Reach multiple contacts efficiently</p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-purple-100 hover:border-purple-200 transition-colors">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-sm text-gray-600">Enterprise-grade security</p>
            </div>
          </div>

          {/* QR Code Display */}
          {currentQR && (
            <div className="mb-8 sm:mb-12">
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  {/* Show QR Code Button */}
                  <div className="flex justify-center mb-6">
                    <Button
                      onClick={() => refreshQR(currentQR.session_id)}
                      disabled={loading}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                    >
                      <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      {loading ? 'Refreshing QR Code...' : 'Show QR Code'}
                    </Button>
                  </div>
                  
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
                    className=""
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Existing Session Status */}
          {checkingExisting && (
            <Card className="mb-8 sm:mb-12 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-3 text-green-600" />
                  <span className="text-lg font-medium text-gray-700">Checking existing WhatsApp connection...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {existingSession?.has_session && existingSession.session && (
            <Card className="mb-8 sm:mb-12 border-0 shadow-xl bg-gradient-to-r from-green-50 to-blue-50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-gray-800">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Active WhatsApp Connection</h3>
                    <p className="text-sm font-normal text-gray-600 mt-1">Your account is already connected</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg mb-2">{existingSession.session.session_name}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        {getStatusBadge(existingSession.session.live_status || existingSession.session.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {existingSession.session.phone_number && (
                        <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
                          <Smartphone className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700">{existingSession.session.phone_number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {WhatsAppSessionAPI.formatRelativeTime(existingSession.session.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 lg:justify-end lg:items-start">
                    {(existingSession.session.live_status === 'need_scan' || existingSession.session.status === 'pending') && (
                      <Button
                        onClick={() => refreshQR(existingSession.session!.session_id)}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Show QR Code
                      </Button>
                    )}
                    <Button
                      onClick={() => openWebhookModal(existingSession.session!.session_id)}
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Webhook Settings
                    </Button>
                    <Button
                      onClick={() => deleteSession(existingSession.session!.session_id)}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Connection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Creation Form - Only show if no existing session */}
          {!currentQR && !existingSession?.has_session && !checkingExisting && (
            <Card className="mb-8 sm:mb-12 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                  Connect Your WhatsApp
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Enter your details to create a secure connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="sessionName" className="block text-sm font-semibold text-gray-700">
                      Session Name
                    </label>
                    <div className="relative">
                      <input
                        id="sessionName"
                        type="text"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        placeholder="My Business WhatsApp"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80"
                      />
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Give your WhatsApp session a memorable name
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700">
                      WhatsApp Phone Number
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1234567890"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80"
                      />
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Include country code (e.g., +1 for US, +91 for India)
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={createSession} 
                    disabled={loading || !phoneNumber.trim() || !sessionName.trim()} 
                    className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                        Creating Connection...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-3" />
                        Connect WhatsApp Account
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Information Alert when existing session exists */}
          {!currentQR && existingSession?.has_session && !checkingExisting && (
            <Alert className="mb-8 sm:mb-12 border-amber-200 bg-amber-50/80 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-800 font-medium">
                You can only have one WhatsApp connection per account. To connect a different number, please remove the existing connection first.
              </AlertDescription>
            </Alert>
          )}

          {/* Health Dashboard */}
          {sessions.length > 0 && (
            <Card className="mb-8 sm:mb-12 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                      Session Health Dashboard
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      Monitor the status of all your WhatsApp sessions
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={performHealthCheck}
                      disabled={healthLoading}
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
                      {healthLoading ? 'Checking...' : 'Health Check'}
                    </Button>
                    <Button
                      onClick={performManualSync}
                      disabled={healthLoading}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
                      Sync Now
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="auto-sync"
                      checked={autoSyncEnabled}
                      onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <label htmlFor="auto-sync" className="text-sm font-medium text-gray-700">
                      Auto-sync every 30 seconds
                    </label>
                  </div>
                  {autoSyncEnabled && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-green-700">Auto-sync active</span>
                    </div>
                  )}
                </div>
                {healthData ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-2">{healthData.connected}</div>
                      <div className="text-sm font-medium text-green-700 flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Connected
                      </div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">{healthData.pending}</div>
                      <div className="text-sm font-medium text-yellow-700 flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        Pending
                      </div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className="text-3xl font-bold text-gray-600 mb-2">{healthData.expired}</div>
                      <div className="text-sm font-medium text-gray-700 flex items-center justify-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Expired
                      </div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                      <div className="text-3xl font-bold text-red-600 mb-2">{healthData.failed}</div>
                      <div className="text-sm font-medium text-red-700 flex items-center justify-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Failed
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No Health Data Available</p>
                    <p className="text-sm">Click "Health Check" to monitor session status</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sessions List */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Smartphone className="w-6 h-6 text-purple-600" />
                    </div>
                    Your WhatsApp Sessions
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Manage your connected WhatsApp accounts
                  </CardDescription>
                </div>
                <Button
                  onClick={loadSessions}
                  disabled={loading}
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Sessions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <Smartphone className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No WhatsApp Accounts Connected</h3>
                  <p className="text-gray-500 mb-4">Connect your first account to get started with automation.</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>Secure • Encrypted • Reliable</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <Card
                      key={session.session_id}
                      className="border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-white/60"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">{session.session_name}</h3>
                              {getStatusBadge(session.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="font-medium text-gray-700">Created</p>
                                  <p className="text-gray-600">{WhatsAppSessionAPI.formatRelativeTime(session.created_at)}</p>
                                </div>
                              </div>
                              
                              {session.connected_at && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <div>
                                    <p className="font-medium text-gray-700">Connected</p>
                                    <p className="text-gray-600">{WhatsAppSessionAPI.formatRelativeTime(session.connected_at)}</p>
                                  </div>
                                </div>
                              )}
                              
                              {session.phone_number && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                  <Smartphone className="w-4 h-4 text-blue-500" />
                                  <div>
                                    <p className="font-medium text-gray-700">Phone</p>
                                    <p className="text-gray-600">{session.phone_number}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {session.webhook_url && (
                              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-green-700">Webhook Active</span>
                                <code className="text-xs bg-white px-2 py-1 rounded border font-mono text-green-600">
                                  {session.webhook_url.split('/').pop()}
                                </code>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[200px]">
                            {(session.status === 'pending' || session.status === 'expired' || session.status === 'failed' || session.status === 'logged_out') && (
                              <Button
                                onClick={() => refreshQR(session.session_id)}
                                disabled={loading}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {session.status === 'pending' ? 'Show QR' : 'Reconnect'}
                              </Button>
                            )}
                            
                            {session.status === 'connected' && (
                              <Button
                                onClick={() => disconnectSession(session.session_id)}
                                disabled={loading}
                                variant="outline"
                                className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <Power className="w-4 h-4 mr-2" />
                                Disconnect
                              </Button>
                            )}
                            
                            <Button
                              onClick={() => openWebhookModal(session.session_id)}
                              variant="outline"
                              className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Webhook
                            </Button>
                            
                            <Button
                              onClick={() => checkLiveStatus(session.session_id)}
                              disabled={loading}
                              variant="outline"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <Wifi className="w-4 h-4 mr-2" />
                              Check Status
                            </Button>
                            
                            <Button
                              onClick={() => deleteSession(session.session_id)}
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-8 sm:mt-12 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                Need Help?
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Common questions and troubleshooting tips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Troubleshooting
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <Wifi className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Make sure you have a stable internet connection</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>QR codes expire after 5 minutes - refresh if needed</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Only one WhatsApp connection is allowed per account</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <RefreshCw className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>To connect a different number, disconnect the existing session first</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Smartphone className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>If scanning fails, try refreshing the QR code</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Security & Privacy
                  </h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="font-medium text-green-800 mb-2">Enterprise-Grade Security</p>
                      <p className="text-green-700">
                        Your WhatsApp connection is encrypted and secure. We never store your messages or personal data.
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="font-medium text-amber-800 mb-2">Terms of Service</p>
                      <p className="text-amber-700">
                        By connecting your WhatsApp account, you agree to our terms of service. 
                        WhatsApp may restrict accounts that violate their usage policies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Configuration Modal */}
          {showWebhookModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Globe className="w-6 h-6 text-blue-600" />
                      </div>
                      Webhook Configuration
                    </CardTitle>
                    <Button
                      onClick={closeWebhookModal}
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription className="mt-2">
                    Configure webhook settings for real-time notifications and updates
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {webhookLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mr-3 text-blue-600" />
                      <span className="text-lg font-medium text-gray-700">Loading webhook configuration...</span>
                    </div>
                  ) : (
                    <>
                      {/* Webhook URL */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Webhook URL
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="url"
                            value={webhookForm.webhook_url}
                            onChange={(e) => setWebhookForm(prev => ({ ...prev, webhook_url: e.target.value }))}
                            placeholder="https://your-domain.com/webhook"
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                          />
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Enter the URL where you want to receive webhook notifications
                        </p>
                      </div>

                      {/* Webhook Enabled Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <h4 className="font-semibold text-gray-900">Enable Webhooks</h4>
                          <p className="text-sm text-gray-600">Receive real-time notifications for events</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="webhook-enabled"
                            checked={webhookForm.webhook_enabled}
                            onChange={(e) => setWebhookForm(prev => ({ ...prev, webhook_enabled: e.target.checked }))}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <label htmlFor="webhook-enabled" className="text-sm font-medium text-gray-700">
                            {webhookForm.webhook_enabled ? 'Enabled' : 'Disabled'}
                          </label>
                        </div>
                      </div>

                      {/* Webhook Events */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-600" />
                            Webhook Events
                          </h4>
                          <div className="flex gap-2">
                            <Button
                              onClick={selectAllWebhookEvents}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              Select All
                            </Button>
                            <Button
                              onClick={selectDefaultWebhookEvents}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              Default
                            </Button>
                            <Button
                              onClick={deselectAllWebhookEvents}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              Clear All
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Select which events you want to receive notifications for. 
                          {webhookEventInfo && (
                            <span className="text-blue-600 ml-1">
                              ({webhookForm.webhook_events.length}/{webhookEventInfo.available_events.length} selected)
                            </span>
                          )}
                        </p>
                        
                        {webhookEventInfo ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                            {webhookEventInfo.available_events.map((event) => (
                              <div
                                key={event}
                                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                  webhookForm.webhook_events.includes(event)
                                    ? 'border-blue-300 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                                onClick={() => toggleWebhookEvent(event)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 text-sm truncate">
                                      {event.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </h5>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                      {webhookEventInfo.event_descriptions[event]}
                                    </p>
                                    {webhookEventInfo.default_events.includes(event) && (
                                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={webhookForm.webhook_events.includes(event)}
                                    onChange={() => toggleWebhookEvent(event)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ml-3"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-gray-400" />
                            <span className="text-gray-500">Loading available events...</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        <Button
                          onClick={updateWebhookConfig}
                          disabled={webhookLoading}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {webhookLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Configuration
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={closeWebhookModal}
                          variant="outline"
                          className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
  );
}
