/**
 * WhatsApp Session API Client
 * 
 * Handles QR code generation, session management, and WhatsApp connection
 * for user authentication with WasenderAPI.
 */

// Base API client
import { apiClient } from './client';

// Types
export interface WhatsAppSession {
  session_id: string;
  session_name: string;
  status: 'pending' | 'connected' | 'expired' | 'failed' | 'logged_out';
  created_at: string;
  connected_at?: string;
  phone_number?: string;
  expires_at?: string;
  webhook_url?: string;
  metadata?: {
    webhook_config?: {
      webhook_url: string;
      webhook_events: string[];
      webhook_enabled: boolean;
      configured_at: string;
    };
  };
}

export interface QRCodeData {
  session_id: string;
  session_name: string;
  qr_code: string;
  qr_url?: string;
  expires_at: string;
  webhook_url: string;
  webhook_events?: string[];
  status: string;
}

export interface SessionStatus {
  session_id: string;
  status: 'pending' | 'connected' | 'expired' | 'failed' | 'logged_out';
  connected_at?: string;
  phone_number?: string;
  last_activity: string;
  expires_at?: string;
}

export interface LiveSessionStatus {
  session_id: string;
  live_status: string;
  database_status: string;
  last_checked: string;
  phone_number?: string;
  user_info?: {
    id: string;
    name: string;
    lid?: string;
  };
  connected_at?: string;
  created_at?: string;
}

export interface HealthCheckResult {
  total_sessions: number;
  connected: number;
  pending: number;
  expired: number;
  failed: number;
  sessions: SessionHealthInfo[];
}

export interface SessionHealthInfo {
  session_id: string;
  session_name: string;
  database_status: string;
  live_status?: string;
  phone_number?: string;
  last_checked: string;
  health_status: 'healthy' | 'needs_attention' | 'unhealthy' | 'api_error' | 'network_error' | 'unknown';
}

export interface CreateSessionResponse {
  status: 'success';
  data: QRCodeData;
}

export interface SessionStatusResponse {
  status: 'success';
  data: SessionStatus;
}

export interface ListSessionsResponse {
  status: 'success';
  data: {
    sessions: WhatsAppSession[];
    total: number;
  };
}

export interface RefreshQRResponse {
  status: 'success';
  data: {
    session_id: string;
    qr_code: string;
    qr_url?: string;
    expires_at: string;
  };
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface ExistingSessionCheck {
  has_session: boolean;
  session?: WhatsAppSession & {
    live_status?: string;
  };
}

// Available webhook events from WasenderAPI
export const AVAILABLE_WEBHOOK_EVENTS = [
  // Core messaging events
  "message.sent",
  "messages.received", 
  "messages.upsert",
  "messages.update",
  "messages.delete",
  "message-receipt.update",
  "messages.reaction",
  
  // Session events
  "session.status",
  "qrcode.updated",
  
  // Chat events
  "chats.upsert",
  "chats.update", 
  "chats.delete",
  
  // Group events
  "groups.upsert",
  "groups.update",
  "group-participants.update",
  
  // Contact events
  "contacts.upsert",
  "contacts.update",
  
  // Poll events
  "poll.results"
] as const;

export type WebhookEventType = typeof AVAILABLE_WEBHOOK_EVENTS[number];

export interface WebhookEventInfo {
  available_events: WebhookEventType[];
  default_events: WebhookEventType[];
  event_descriptions: Record<WebhookEventType, string>;
}

export interface WebhookConfig {
  webhook_url: string;
  webhook_enabled: boolean;
  webhook_events: WebhookEventType[];
}

export interface UpdateWebhookRequest {
  webhook_url?: string;
  webhook_enabled?: boolean;
  webhook_events?: WebhookEventType[];
}

/**
 * WhatsApp Session API Client
 */
export class WhatsAppSessionAPI {
  
  /**
   * Check if tenant has an existing WhatsApp session
   */
  static async checkExistingSession(): Promise<ExistingSessionCheck> {
    const response = await apiClient.get<ExistingSessionCheck>('/api/whatsapp/session/check-existing');
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to check existing session');
    }
    
    return response.data;
  }

  /**
   * Check existing sessions or create a new WhatsApp session and get QR code
   */
  static async createSession(phoneNumber: string, sessionName: string): Promise<QRCodeData> {
    const response = await apiClient.post<QRCodeData>('/api/whatsapp/session/check-or-create', {
      phone_number: phoneNumber,
      session_name: sessionName
    });
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to create WhatsApp session');
    }
    
    return response.data;
  }

  /**
   * Get current status of a WhatsApp session
   */
  static async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    const response = await apiClient.get<SessionStatus>(`/api/whatsapp/session/status/${sessionId}`);
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to get session status');
    }
    
    return response.data;
  }

  /**
   * Refresh QR code for an existing session
   */
  static async refreshQRCode(sessionId: string): Promise<{ qr_code?: string; qr_url?: string; expires_at?: string; message?: string; current_status?: string }> {
    const response = await apiClient.post<{ qr_code: string; qr_url?: string; expires_at: string }>(`/api/whatsapp/session/refresh-qr/${sessionId}`);
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to refresh QR code');
    }
    
    return response.data;
  }

  /**
   * List all WhatsApp sessions for the current user
   */
  static async listSessions(): Promise<{ sessions: WhatsAppSession[]; total: number }> {
    const response = await apiClient.get<{ sessions: WhatsAppSession[]; total: number }>('/api/whatsapp/sessions');
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to list sessions');
    }
    
    return response.data;
  }

  /**
   * Delete a WhatsApp session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    const response = await apiClient.delete<void>(`/api/whatsapp/session/delete/${sessionId}`);
    
    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to delete session');
    }
  }

  /**
   * Check live session status by calling WasenderAPI directly
   */
  static async checkLiveStatus(sessionId: string): Promise<LiveSessionStatus> {
    const response = await apiClient.get<LiveSessionStatus>(`/api/whatsapp/session/status-check/${sessionId}`);
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to check live session status');
    }
    
    return response.data;
  }

  /**
   * Disconnect a WhatsApp session
   */
  static async disconnectSession(sessionId: string): Promise<{ session_id: string; message: string }> {
    const response = await apiClient.post<{ session_id: string; message: string }>(`/api/whatsapp/session/disconnect/${sessionId}`);
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to disconnect session');
    }
    
    return response.data;
  }

  /**
   * Perform health check on all user sessions
   */
  static async healthCheck(): Promise<HealthCheckResult> {
    const response = await apiClient.get<HealthCheckResult>('/api/whatsapp/session/health-check');
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to perform health check');
    }
    
    return response.data;
  }

  /**
   * Reconnect a disconnected/expired WhatsApp session
   */
  static async reconnectSession(sessionId: string): Promise<QRCodeData> {
    const response = await apiClient.post<QRCodeData>(`/api/whatsapp/session/reconnect/${sessionId}`);
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to reconnect session');
    }
    
    return response.data;
  }

  /**
   * Sync all session statuses with WasenderAPI
   */
  static async syncAllStatuses(): Promise<{
    synced_sessions: number;
    updated_sessions: number;
    deleted_sessions: number;
    sessions: Array<{
      session_id: string;
      session_name: string;
      old_status: string;
      new_status: string;
      updated: boolean;
      reason?: string;
    }>;
  }> {
    const response = await apiClient.post<{
      synced_sessions: number;
      updated_sessions: number;
      deleted_sessions: number;
      sessions: Array<{
        session_id: string;
        session_name: string;
        old_status: string;
        new_status: string;
        updated: boolean;
        reason?: string;
      }>;
    }>('/api/whatsapp/session/sync-all-statuses');
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to sync session statuses');
    }
    
    return response.data;
  }

  /**
   * Poll session status until connected or timeout
   * @param sessionId Session ID to poll
   * @param onStatusUpdate Callback for status updates
   * @param timeoutMs Polling timeout in milliseconds (default: 5 minutes)
   * @param intervalMs Polling interval in milliseconds (default: 3 seconds)
   * @returns Promise that resolves when connected or rejects on timeout/error
   */
  static async pollSessionStatus(
    sessionId: string,
    onStatusUpdate?: (status: SessionStatus) => void,
    timeoutMs: number = 5 * 60 * 1000, // 5 minutes
    intervalMs: number = 3000 // 3 seconds
  ): Promise<SessionStatus> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkStatus = async () => {
        try {
          const status = await this.getSessionStatus(sessionId);
          
          // Notify callback
          if (onStatusUpdate) {
            onStatusUpdate(status);
          }
          
          // Check if we're done
          if (status.status === 'connected') {
            resolve(status);
            return;
          }
          
          if (status.status === 'failed' || status.status === 'expired') {
            reject(new Error(`Session ${status.status}`));
            return;
          }
          
          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            reject(new Error('Polling timeout'));
            return;
          }
          
          // Continue polling
          setTimeout(checkStatus, intervalMs);
          
        } catch (error) {
          reject(error);
        }
      };
      
      // Start polling
      checkStatus();
    });
  }

  /**
   * Helper to check if QR code is expired
   */
  static isQRExpired(expiresAt?: string): boolean {
    if (!expiresAt) return false;
    
    // Parse the expiration time - ensure it's treated as UTC
    const expirationTime = new Date(expiresAt);
    const currentTime = new Date();
    
    // Add 5 minute buffer to prevent premature expiration
    const bufferMinutes = 5;
    const expirationWithBuffer = new Date(expirationTime.getTime() - (bufferMinutes * 60 * 1000));
    
    // Add debug logging
    console.log('QR Expiration Check:', {
      expiresAt,
      expirationTime: expirationTime.toISOString(),
      currentTime: currentTime.toISOString(),
      expirationWithBuffer: expirationWithBuffer.toISOString(),
      timeDiffMinutes: (expirationTime.getTime() - currentTime.getTime()) / (1000 * 60),
      isExpired: currentTime > expirationWithBuffer
    });
    
    return currentTime > expirationWithBuffer;
  }

  /**
   * Helper to format session status for display
   */
  static formatStatus(status: string): { label: string; color: string; icon?: string } {
    switch (status) {
      case 'connected':
        return { label: 'Connected', color: 'green', icon: 'check-circle' };
      case 'pending':
        return { label: 'Pending', color: 'yellow', icon: 'clock' };
      case 'expired':
        return { label: 'Expired', color: 'gray', icon: 'alert-circle' };
      case 'failed':
        return { label: 'Failed', color: 'red', icon: 'alert-circle' };
      case 'logged_out':
        return { label: 'Logged Out', color: 'orange', icon: 'alert-circle' };
      default:
        return { label: status.charAt(0).toUpperCase() + status.slice(1), color: 'gray' };
    }
  }

  /**
   * Helper to format datetime for display
   */
  static formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }

  /**
   * Get webhook configuration for a session
   */
  static async getWebhookConfig(sessionId: string): Promise<WebhookConfig> {
    const response = await apiClient.get<WebhookConfig>(`/api/whatsapp/session/webhook/${sessionId}`);
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to get webhook configuration');
    }
    
    return response.data;
  }

  /**
   * Update webhook configuration for a session
   */
  static async updateWebhookConfig(sessionId: string, config: UpdateWebhookRequest): Promise<WebhookConfig> {
    const response = await apiClient.put<WebhookConfig>(`/api/whatsapp/session/webhook/${sessionId}`, config);
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to update webhook configuration');
    }
    
    return response.data;
  }

  /**
   * Get available webhook events and descriptions
   */
  static async getAvailableWebhookEvents(): Promise<WebhookEventInfo> {
    const response = await apiClient.get<WebhookEventInfo>('/api/whatsapp/webhook/available-events');
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to get available webhook events');
    }
    
    return response.data;
  }

  /**
   * Helper to format relative time
   */
  static formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
}

// Export default instance
export const whatsAppSessionAPI = WhatsAppSessionAPI;
