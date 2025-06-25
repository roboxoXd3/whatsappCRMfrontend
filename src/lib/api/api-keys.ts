/**
 * API Key Management API Client
 * ============================
 * TypeScript client for managing tenant API keys
 */

import { apiClient } from './client';

export interface ApiKey {
  id: string;
  key_type: 'openai' | 'whatsapp';
  key_name: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
}

export interface AddApiKeyRequest {
  key_type: 'openai' | 'whatsapp';
  key_name: string;
  api_key: string;
}

export interface UpdateApiKeyRequest {
  key_name?: string;
  is_active?: boolean;
}

export interface ApiKeyTestResult {
  is_valid: boolean;
  key_type: string;
  message: string;
}

export interface ApiKeysResponse {
  status: 'success' | 'error';
  data?: {
    api_keys: ApiKey[];
  };
  message?: string;
}

export interface AddApiKeyResponse {
  status: 'success' | 'error';
  data?: {
    id: string;
    key_type: string;
    key_name: string;
    is_active: boolean;
  };
  message?: string;
}

export interface TestApiKeyResponse {
  status: 'success' | 'error';
  data?: ApiKeyTestResult;
  message?: string;
}

/**
 * Get all API keys for the current tenant
 */
export const getApiKeys = async (): Promise<ApiKeysResponse> => {
  const response = await apiClient.get('/api/api-keys');
  return response.data;
};

/**
 * Add a new API key
 */
export const addApiKey = async (apiKeyData: AddApiKeyRequest): Promise<AddApiKeyResponse> => {
  const response = await apiClient.post('/api/api-keys', apiKeyData);
  return response.data;
};

/**
 * Update an existing API key
 */
export const updateApiKey = async (keyId: string, updateData: UpdateApiKeyRequest): Promise<{ status: string; message?: string }> => {
  const response = await apiClient.put(`/api/api-keys/${keyId}`, updateData);
  return response.data;
};

/**
 * Delete an API key
 */
export const deleteApiKey = async (keyId: string): Promise<{ status: string; message?: string }> => {
  const response = await apiClient.delete(`/api/api-keys/${keyId}`);
  return response.data;
};

/**
 * Test an API key to verify it's working
 */
export const testApiKey = async (keyId: string): Promise<TestApiKeyResponse> => {
  const response = await apiClient.post(`/api/api-keys/test/${keyId}`);
  return response.data;
}; 