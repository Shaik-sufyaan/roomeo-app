// lib/api.ts - Mobile-native authenticated API helper
import { supabase } from '../services/supabase';
import { Platform } from 'react-native';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

class AuthenticatedAPI {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.access_token) {
        throw new Error('No valid session found');
      }

      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'User-Agent': this.getUserAgent()
      };
    } catch (error) {
      console.error('❌ Error getting auth headers:', error);
      throw error;
    }
  }

  private getUserAgent(): string {
    // Generate appropriate user agent for mobile
    if (Platform.OS === 'ios') {
      return 'Roomio-Mobile/1.0.0 (iOS)';
    } else if (Platform.OS === 'android') {
      return 'Roomio-Mobile/1.0.0 (Android)';
    } else {
      return 'Roomio-Mobile/1.0.0 (Web)';
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const contentType = response.headers.get('content-type');
      let data: T | undefined;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      if (response.ok) {
        return {
          success: true,
          data,
          status: response.status
        };
      } else {
        return {
          success: false,
          error: typeof data === 'string' ? data : `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        };
      }
    } catch (error) {
      console.error('❌ Error handling API response:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse response',
        status: response.status
      };
    }
  }

  async get<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      console.log('🔄 API GET:', url);
      const headers = await this.getAuthHeaders();

      const response = await fetch(url, {
        method: 'GET',
        headers: { ...headers, ...options.headers },
        ...options
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('❌ API GET error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'GET request failed'
      };
    }
  }

  async post<T = any>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      console.log('🔄 API POST:', url);
      const headers = await this.getAuthHeaders();

      const response = await fetch(url, {
        method: 'POST',
        headers: { ...headers, ...options.headers },
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('❌ API POST error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'POST request failed'
      };
    }
  }

  async patch<T = any>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      console.log('🔄 API PATCH:', url);
      const headers = await this.getAuthHeaders();

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { ...headers, ...options.headers },
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('❌ API PATCH error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PATCH request failed'
      };
    }
  }

  async put<T = any>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      console.log('🔄 API PUT:', url);
      const headers = await this.getAuthHeaders();

      const response = await fetch(url, {
        method: 'PUT',
        headers: { ...headers, ...options.headers },
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('❌ API PUT error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PUT request failed'
      };
    }
  }

  async delete<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      console.log('🔄 API DELETE:', url);
      const headers = await this.getAuthHeaders();

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { ...headers, ...options.headers },
        ...options
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('❌ API DELETE error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'DELETE request failed'
      };
    }
  }

  /**
   * Upload file with proper mobile handling
   */
  async uploadFile<T = any>(
    url: string,
    fileUri: string,
    fieldName: string = 'file',
    additionalFields?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      console.log('🔄 API FILE UPLOAD:', url);
      const headers = await this.getAuthHeaders();

      // Create FormData for file upload
      const formData = new FormData();

      // Add file to form data
      formData.append(fieldName, {
        uri: fileUri,
        type: 'image/jpeg', // Default to JPEG
        name: 'upload.jpg'
      } as any);

      // Add additional fields if provided
      if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      // Remove Content-Type from headers for FormData (browser/fetch will set it)
      const uploadHeaders = { ...headers };
      delete uploadHeaders['Content-Type'];

      const response = await fetch(url, {
        method: 'POST',
        headers: uploadHeaders,
        body: formData
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('❌ API FILE UPLOAD error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File upload failed'
      };
    }
  }

  /**
   * Check API connectivity
   */
  async ping(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 5000 as any // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.error('❌ API ping failed:', error);
      return false;
    }
  }

  /**
   * Get current authentication status
   */
  async getAuthStatus(): Promise<{ authenticated: boolean; userId?: string }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return { authenticated: false };
      }

      return {
        authenticated: true,
        userId: session.user?.id
      };
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      return { authenticated: false };
    }
  }
}

export const authAPI = new AuthenticatedAPI();

// Convenience functions for common operations
export async function apiGet<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  return authAPI.get<T>(url, options);
}

export async function apiPost<T>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
  return authAPI.post<T>(url, data, options);
}

export async function apiPatch<T>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
  return authAPI.patch<T>(url, data, options);
}

export async function apiPut<T>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
  return authAPI.put<T>(url, data, options);
}

export async function apiDelete<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  return authAPI.delete<T>(url, options);
}

export async function apiUpload<T>(
  url: string,
  fileUri: string,
  fieldName?: string,
  additionalFields?: Record<string, string>
): Promise<ApiResponse<T>> {
  return authAPI.uploadFile<T>(url, fileUri, fieldName, additionalFields);
}

// Export types
export type { ApiResponse };