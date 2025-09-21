// lib/debug.ts - Mobile-native debug utilities for Supabase
import { supabase } from '../services/supabase';
import { Platform } from 'react-native';
import { authAPI } from './api';

interface DebugResult {
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
  code?: string;
  suggestion?: string;
  message?: string;
  exists?: boolean;
}

/**
 * Get mobile platform debug info
 */
export function getMobilePlatformInfo() {
  return {
    platform: Platform.OS,
    version: Platform.Version,
    isSimulator: __DEV__, // Development mode indicator
    constants: Platform.constants
  };
}

/**
 * Debug database connection with mobile-specific logging
 */
export async function debugDatabaseConnection(): Promise<DebugResult> {
  console.log('🔍 [Mobile] Debugging database connection...');
  console.log('📱 Platform info:', getMobilePlatformInfo());

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ [Mobile] Database connection failed:', error);
      return {
        success: false,
        error: error.message,
        details: error,
        code: error.code
      };
    }

    console.log('✅ [Mobile] Database connection successful');
    return {
      success: true,
      message: 'Database connection working on mobile'
    };
  } catch (error) {
    console.error('❌ [Mobile] Debug failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Debug user profile with mobile session handling
 */
export async function debugUserProfile(userId: string): Promise<DebugResult> {
  console.log('🔍 [Mobile] Debugging user profile for:', userId);

  try {
    // First check authentication status
    const authStatus = await authAPI.getAuthStatus();
    console.log('🔐 [Mobile] Auth status:', authStatus);

    // Test user profile retrieval
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ [Mobile] User profile retrieval failed:', error);
      return {
        success: false,
        error: error.message,
        details: error,
        code: error.code,
        suggestion: 'Check if user exists and RLS policies allow access'
      };
    }

    console.log('✅ [Mobile] User profile found:', data);
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ [Mobile] Debug user profile failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Debug table existence with mobile logging
 */
export async function debugTableExists(tableName: string): Promise<DebugResult> {
  console.log('🔍 [Mobile] Checking if table exists:', tableName);

  try {
    // Try to select from the table
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ [Mobile] Table check failed:', error);
      return {
        exists: false,
        error: error.message,
        code: error.code,
        suggestion: `Verify table '${tableName}' exists in Supabase dashboard`
      };
    }

    console.log('✅ [Mobile] Table exists:', tableName);
    return {
      exists: true,
      message: `Table ${tableName} exists`
    };
  } catch (error) {
    console.error('❌ [Mobile] Table check failed:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Debug RLS policies with mobile session context
 */
export async function debugRLSPolicies(): Promise<DebugResult> {
  console.log('🔍 [Mobile] Checking RLS policies...');

  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 [Mobile] Current session exists:', !!session);

    if (sessionError) {
      console.error('❌ [Mobile] Session error:', sessionError);
    }

    // Test with a simple query to see if RLS is blocking access
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ [Mobile] RLS policy test failed:', error);

      let suggestion = 'Check RLS policies in Supabase dashboard';
      if (error.code === '42501') {
        suggestion = 'RLS is enabled but user lacks permission. Check policies and authentication.';
      }

      return {
        success: false,
        error: error.message,
        code: error.code,
        suggestion
      };
    }

    console.log('✅ [Mobile] RLS policies working correctly');
    return {
      success: true,
      message: 'RLS policies are configured correctly for mobile'
    };
  } catch (error) {
    console.error('❌ [Mobile] RLS policy test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Debug storage access with mobile permissions
 */
export async function debugStorageAccess(bucketName: string = 'avatars'): Promise<DebugResult> {
  console.log('🔍 [Mobile] Debugging storage access for bucket:', bucketName);

  try {
    // Test bucket access
    const { data, error } = await supabase.storage.getBucket(bucketName);

    if (error) {
      console.error('❌ [Mobile] Storage bucket access failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code,
        suggestion: `Check if bucket '${bucketName}' exists and has proper permissions`
      };
    }

    console.log('✅ [Mobile] Storage bucket accessible:', data);

    // Test listing files (if permitted)
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });

    if (listError) {
      console.warn('⚠️ [Mobile] File listing failed (may be restricted):', listError);
    } else {
      console.log('✅ [Mobile] File listing works:', files?.length || 0, 'files');
    }

    return {
      success: true,
      message: `Storage bucket '${bucketName}' is accessible from mobile`
    };
  } catch (error) {
    console.error('❌ [Mobile] Storage debug failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Debug network connectivity
 */
export async function debugNetworkConnectivity(): Promise<DebugResult> {
  console.log('🔍 [Mobile] Testing network connectivity...');

  try {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return {
        success: false,
        error: 'EXPO_PUBLIC_SUPABASE_URL not configured'
      };
    }

    // Test basic network connectivity to Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      timeout: 10000 as any
    });

    if (response.ok) {
      console.log('✅ [Mobile] Network connectivity to Supabase OK');
      return {
        success: true,
        message: 'Network connectivity working'
      };
    } else {
      console.error('❌ [Mobile] Network connectivity failed:', response.status);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    console.error('❌ [Mobile] Network test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Comprehensive mobile debug report
 */
export async function generateMobileDebugReport(userId?: string): Promise<{
  platform: any;
  database: DebugResult;
  network: DebugResult;
  userProfile?: DebugResult;
  storage: DebugResult;
  rls: DebugResult;
  timestamp: string;
}> {
  console.log('📊 [Mobile] Generating comprehensive debug report...');

  const report = {
    platform: getMobilePlatformInfo(),
    database: await debugDatabaseConnection(),
    network: await debugNetworkConnectivity(),
    storage: await debugStorageAccess(),
    rls: await debugRLSPolicies(),
    timestamp: new Date().toISOString()
  } as any;

  if (userId) {
    report.userProfile = await debugUserProfile(userId);
  }

  console.log('📊 [Mobile] Debug report completed:', report);
  return report;
}

/**
 * Log error with mobile context
 */
export function logMobileError(
  operation: string,
  error: any,
  context?: Record<string, any>
) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
    operation,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context
  };

  console.error('❌ [Mobile Error]', errorLog);

  // In production, you might want to send this to a logging service
  if (!__DEV__) {
    // TODO: Send to remote logging service
  }
}

/**
 * Performance timing utility for mobile
 */
export class MobilePerformanceTimer {
  private startTime: number;
  private operation: string;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();
    console.log(`⏱️ [Mobile] Starting: ${operation}`);
  }

  end(additionalInfo?: any) {
    const duration = Date.now() - this.startTime;
    console.log(`⏱️ [Mobile] Completed: ${this.operation} in ${duration}ms`, additionalInfo);
    return duration;
  }
}