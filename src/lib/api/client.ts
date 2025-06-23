import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/lib/types/api';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    this.instance = axios.create({
      baseURL,
      timeout: 15000, // Increased timeout for production
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Log the API URL in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API Base URL:', baseURL);
    }

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
          if (config.data) {
            console.log('📤 Request Data:', config.data);
          }
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error) => {
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ API Error:`, error.response?.status, error.config?.url, error.response?.data || error.message);
        }

        // Handle common errors
        if (error.response?.status === 401) {
          // Redirect to login or refresh token
          this.handleUnauthorized();
        }
        
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private handleUnauthorized() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // You can add redirect logic here
      // window.location.href = '/auth/login';
    }
  }

  private formatError(error: any) {
    // Log the full error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        }
      });
    }

    if (error.response?.data) {
      return {
        status: 'error',
        message: error.response.data.message || error.response.data.error || 'An error occurred',
        error_code: error.response.data.error_code,
        details: error.response.data.details,
      };
    }

    if (error.code === 'ECONNABORTED') {
      return {
        status: 'error',
        message: 'Request timeout. Please check your connection and try again.',
        error_code: 'TIMEOUT',
      };
    }

    if (error.code === 'ERR_NETWORK') {
      return {
        status: 'error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        error_code: 'NETWORK_ERROR',
      };
    }

    if (error.response?.status >= 500) {
      return {
        status: 'error',
        message: 'Server error. Please try again later.',
        error_code: 'SERVER_ERROR',
      };
    }

    return {
      status: 'error',
      message: error.message || 'An unexpected error occurred. Please try again.',
      error_code: 'UNKNOWN_ERROR',
    };
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.request<ApiResponse<T>>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // GET method
  async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
    });
  }

  // POST method
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
    });
  }

  // PUT method
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
    });
  }

  // DELETE method
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
    });
  }

  // PATCH method
  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export { ApiClient }; 