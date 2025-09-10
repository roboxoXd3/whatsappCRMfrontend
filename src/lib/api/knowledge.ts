/**
 * Knowledge Base API Client
 * Handles document upload, management, and knowledge base operations
 */

import { apiClient } from './client';
import { ApiResponse } from '@/lib/types/api';

export interface KnowledgeDocument {
  id: string;
  title: string;
  source: string;
  category: string;
  content?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  content_preview?: string;
  content_length?: number;
}

export interface KnowledgeStats {
  total_documents: number;
  total_categories: number;
  avg_content_length: number;
  status: string;
  categories: Record<string, number>;
  subscription_limits?: {
    max_documents: number;
    current_plan: string;
  };
}

export interface UploadResponse {
  status: string;
  message?: string;
  data?: {
    source: string;
    category: string;
    title: string;
    content_length: number;
  };
}

export interface QueryResult {
  title: string;
  category: string;
  source: string;
  similarity_score: number;
  content_preview: string;
}

export class KnowledgeAPI {
  /**
   * Get knowledge base statistics
   */
  static async getStats(): Promise<KnowledgeStats> {
    const response = await apiClient.get<KnowledgeStats>('/api/knowledge/stats');
    return response.data!;
  }

  /**
   * List all documents in knowledge base
   */
  static async listDocuments(): Promise<{ documents: KnowledgeDocument[]; total_count: number }> {
    const response = await apiClient.get<{ documents: KnowledgeDocument[]; total_count: number }>('/api/knowledge/documents');
    return response.data!;
  }

  /**
   * Get a single document with full content
   */
  static async getDocument(documentId: string): Promise<KnowledgeDocument> {
    const response = await apiClient.get<KnowledgeDocument>(`/api/knowledge/documents/${documentId}`);
    return response.data!;
  }

  /**
   * Upload a file to knowledge base
   */
  static async uploadFile(
    file: File,
    category: string = 'general',
    title?: string
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (title) {
      formData.append('title', title);
    }

    const response = await apiClient.request({
      method: 'POST',
      url: '/api/knowledge/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response as UploadResponse;
  }

  /**
   * Upload content from URL
   */
  static async uploadFromUrl(
    url: string,
    category: string = 'website',
    title?: string
  ): Promise<UploadResponse> {
    const response = await apiClient.post('/api/knowledge/upload', {
      url,
      category,
      title,
    });

    return response as UploadResponse;
  }

  /**
   * Upload manual text content
   */
  static async uploadText(
    text: string,
    category: string = 'manual',
    title: string = 'Manual Input'
  ): Promise<UploadResponse> {
    const response = await apiClient.post('/api/knowledge/upload', {
      text,
      category,
      title,
    });

    return response as UploadResponse;
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: string): Promise<{ status: string; message?: string }> {
    const response = await apiClient.delete(`/api/knowledge/documents/${documentId}`);
    return response as { status: string; message?: string };
  }

  /**
   * Test query against knowledge base
   */
  static async testQuery(query: string): Promise<{
    query: string;
    results: QueryResult[];
    total_found: number;
  }> {
    const response = await apiClient.post<{
      query: string;
      results: QueryResult[];
      total_found: number;
    }>('/api/knowledge/test', { query });

    return response.data!;
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<{ categories: string[] }> {
    const response = await apiClient.get<{ categories: string[] }>('/api/knowledge/categories');
    return response.data!;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type icon
   */
  static getFileTypeIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
      case 'md':
        return '📋';
      case 'html':
        return '🌐';
      default:
        return '📄';
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/html', 'text/markdown'];
    const allowedExtensions = ['txt', 'pdf', 'docx', 'md', 'html'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 10MB'
      };
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File type not supported. Allowed: ${allowedExtensions.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Validate URL
   */
  static validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          valid: false,
          error: 'URL must use HTTP or HTTPS protocol'
        };
      }
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: 'Please enter a valid URL'
      };
    }
  }
}
