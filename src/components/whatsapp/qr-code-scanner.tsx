'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, CheckCircle, AlertCircle, Clock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WhatsAppSessionAPI, QRCodeData, SessionStatus } from '@/lib/api/whatsapp-session';

interface QRCodeScannerProps {
  qrData: QRCodeData;
  onStatusUpdate?: (status: SessionStatus) => void;
  onConnected?: (status: SessionStatus) => void;
  onError?: (error: string) => void;
  onRefresh?: () => void;
  autoRefresh?: boolean;
  className?: string;
}

export function QRCodeScanner({
  qrData,
  onStatusUpdate,
  onConnected,
  onError,
  onRefresh,
  autoRefresh = false,
  className = ""
}: QRCodeScannerProps) {
  const [currentStatus, setCurrentStatus] = useState(qrData.status);
  const [isPolling, setIsPolling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Start polling when component mounts
  useEffect(() => {
    if (qrData.session_id && currentStatus === 'pending') {
      startPolling();
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [qrData.session_id, currentStatus]);

  // Auto-refresh expired QR codes
  useEffect(() => {
    if (autoRefresh && WhatsAppSessionAPI.isQRExpired(qrData.expires_at) && currentStatus === 'pending') {
      handleRefreshQR();
    }
  }, [qrData.expires_at, currentStatus, autoRefresh]);

  const startPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    setIsPolling(true);

    const interval = setInterval(async () => {
      try {
        const status = await WhatsAppSessionAPI.getSessionStatus(qrData.session_id);
        
        setCurrentStatus(status.status);
        
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }

        // Handle completion states
        if (status.status === 'connected') {
          setIsPolling(false);
          clearInterval(interval);
          setPollingInterval(null);
          
          if (onConnected) {
            onConnected(status);
          }
        } else if (status.status === 'failed' || status.status === 'expired') {
          setIsPolling(false);
          clearInterval(interval);
          setPollingInterval(null);
          
          if (onError) {
            onError(`Session ${status.status}`);
          }
        }
      } catch (error) {
        console.error('Error polling session status:', error);
        if (onError) {
          onError(error instanceof Error ? error.message : 'Failed to check session status');
        }
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);

    // Auto-stop polling after 5 minutes
    setTimeout(() => {
      setIsPolling(false);
      clearInterval(interval);
      setPollingInterval(null);
    }, 5 * 60 * 1000);
  };

  const handleRefreshQR = async () => {
    setIsRefreshing(true);
    
    try {
      if (onRefresh) {
        onRefresh();
      } else {
        // Default refresh behavior
        await WhatsAppSessionAPI.refreshQRCode(qrData.session_id);
      }
      
      // Restart polling if QR was refreshed
      if (currentStatus === 'pending') {
        startPolling();
      }
    } catch (error) {
      console.error('Error refreshing QR code:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to refresh QR code');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = WhatsAppSessionAPI.formatStatus(status);
    
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        );
      default:
        return <Badge variant="outline">{statusInfo.label}</Badge>;
    }
  };

  const isExpired = WhatsAppSessionAPI.isQRExpired(qrData.expires_at);
  const showRefreshButton = (currentStatus === 'pending' && isExpired) || currentStatus === 'expired';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Scan QR Code
        </CardTitle>
        <CardDescription>
          Open WhatsApp on your phone and scan this QR code to connect your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* QR Code Display */}
          <div className="flex-shrink-0 relative">
            {qrData.qr_code ? (
              <img
                src={`data:image/png;base64,${qrData.qr_code}`}
                alt="WhatsApp QR Code"
                className={`w-64 h-64 border border-gray-200 rounded-lg ${
                  isExpired || currentStatus === 'expired' ? 'opacity-50' : ''
                }`}
              />
            ) : qrData.qr_url ? (
              <img
                src={qrData.qr_url}
                alt="WhatsApp QR Code"
                className={`w-64 h-64 border border-gray-200 rounded-lg ${
                  isExpired || currentStatus === 'expired' ? 'opacity-50' : ''
                }`}
              />
            ) : (
              <div className="w-64 h-64 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">QR Code not available</p>
              </div>
            )}

            {/* Overlay for expired QR */}
            {(isExpired || currentStatus === 'expired') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-center text-white">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">QR Code Expired</p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions and Status */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Open WhatsApp on your phone</li>
                <li>Tap on the three dots (⋮) in the top right corner</li>
                <li>Select "Linked Devices"</li>
                <li>Tap "Link a Device"</li>
                <li>Point your camera at this QR code</li>
              </ol>
            </div>

            {/* Webhook Configuration Info */}
            {qrData.webhook_url && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Webhook Configuration
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Endpoint:</span>
                    <code className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono break-all">
                      {qrData.webhook_url}
                    </code>
                  </div>
                  {qrData.webhook_events && qrData.webhook_events.length > 0 && (
                    <div>
                      <span className="text-blue-700 font-medium">Events:</span>
                      <div className="ml-2 flex flex-wrap gap-1 mt-1">
                        {qrData.webhook_events.map((event, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-blue-600 text-xs">
                    Real-time updates will be sent to this endpoint when your session status changes.
                  </p>
                </div>
              </div>
            )}

            {/* Status and Actions */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                {getStatusBadge(currentStatus)}
              </div>
              
              {showRefreshButton && (
                <Button
                  onClick={handleRefreshQR}
                  disabled={isRefreshing}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh QR'}
                </Button>
              )}
            </div>

            {/* Expiration Info */}
            {qrData.expires_at && (
              <p className="text-xs text-gray-500">
                {isExpired ? 'Expired at: ' : 'Expires at: '}
                {WhatsAppSessionAPI.formatDateTime(qrData.expires_at)}
              </p>
            )}

            {/* Polling Status */}
            {isPolling && currentStatus === 'pending' && (
              <Alert className="border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2 text-blue-800">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <AlertDescription>
                    Waiting for QR code scan...
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Connected Status */}
            {currentStatus === 'connected' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  WhatsApp connected successfully! You can now use all features.
                </AlertDescription>
              </Alert>
            )}

            {/* Failed Status */}
            {currentStatus === 'failed' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Connection failed. Please try creating a new session.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Mobile-specific instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Mobile App Instructions</h4>
              <p className="text-sm text-gray-600 mb-2">
                If you're viewing this on your phone, save this page and open WhatsApp:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Switch to your WhatsApp app</li>
                <li>• Go to Settings → Linked Devices</li>
                <li>• Tap "Link a Device"</li>
                <li>• Switch back to this page and scan the QR code</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
