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
  status: 'pending' | 'connected' | 'expired' | 'failed';
  created_at: string;
  connected_at?: string;
  phone_number?: string;
  expires_at?: string;
}

export interface QRCodeData {
  session_id: string;
  session_name: string;
  qr_code: string;
  qr_url?: string;
  expires_at: string;
  webhook_url: string;
  status: string;
}

export interface SessionStatus {
  session_id: string;
  status: 'pending' | 'connected' | 'expired' | 'failed';
  connected_at?: string;
  phone_number?: string;
  last_activity: string;
  expires_at?: string;
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

/**
 * WhatsApp Session API Client
 */
export class WhatsAppSessionAPI {
  
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
      default:
        return { label: status, color: 'gray' };
    }
  }

  /**
   * Helper to format datetime for display
   */
  static formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
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
