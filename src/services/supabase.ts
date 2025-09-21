import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ExpoAsyncStorageAdapter = {
  getItem: (key: string) => {
    return AsyncStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    return AsyncStorage.setItem(key, value)
  },
  removeItem: (key: string) => {
    return AsyncStorage.removeItem(key)
  },
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoAsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Profile management functions - migrated from website services/supabase.ts

export async function getUserProfile(uid: string): Promise<any | null> {
  try {
    console.log("🔍 Fetching user profile for:", uid);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    if (error) {
      // Check if it's a "not found" error (PGRST116)
      if (error.code === 'PGRST116') {
        console.log("📝 User profile not found - user may not have completed profile setup");
        return null;
      }

      // Check if it's a 406 error (content negotiation)
      if (error.code === '406') {
        console.log("⚠️ 406 error - checking if user exists in auth but not in users table");
        return null;
      }

      console.error("❌ Error getting user profile:", error);
      return null;
    }

    console.log("✅ User profile found:", data);
    return data;
  } catch (error) {
    console.error("❌ Exception getting user profile:", error);
    return null;
  }
}

export async function updateUserProfile(uid: string, updates: any): Promise<boolean> {
  try {
    console.log("🔄 Updating user profile:");
    console.log("   - User ID:", uid);
    console.log("   - Updates:", updates);

    // Check current auth state
    const { data: { user: currentAuthUser }, error: authError } = await supabase.auth.getUser();
    console.log("🔍 Current auth user during update:", currentAuthUser?.id);
    console.log("🔍 Auth error during update:", authError);

    // Verify the user is authenticated and matches the profile being updated
    if (authError || !currentAuthUser) {
      console.error("❌ User not authenticated during update");
      return false;
    }

    if (currentAuthUser.id !== uid) {
      console.error("❌ Auth user ID doesn't match profile ID being updated");
      return false;
    }

    // Convert ALL camelCase field names to lowercase to match database schema
    const convertedUpdates = { ...updates };

    // COMPLETE conversion map for all known fields
    const fieldConversions: { [key: string]: string } = {
      'profilePicture': 'profilepicture',
      'userType': 'usertype',
      'updatedAt': 'updatedat',
      'createdAt': 'createdat',
      'isVerified': 'isverified',
      'universityAffiliation': 'universityaffiliation',
      'professionalStatus': 'professionalstatus'
    };

    // Apply all conversions
    Object.keys(fieldConversions).forEach(camelCase => {
      if (convertedUpdates[camelCase] !== undefined) {
        convertedUpdates[fieldConversions[camelCase]] = convertedUpdates[camelCase];
        delete convertedUpdates[camelCase];
      }
    });

    // Prepare update data without automatic timestamp
    const updateData = {
      ...convertedUpdates
    };

    console.log("🔄 About to update with data:", updateData);
    console.log("🔍 Field names being sent:", Object.keys(updateData));

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', uid)
      .select(); // Return updated data to confirm

    if (error) {
      console.error("❌ UPDATE FAILED:");
      console.error("❌ Error message:", error.message);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error details:", error.details);
      console.error("❌ Error hint:", error.hint);
      console.error("❌ Full error object:", JSON.stringify(error, null, 2));
      return false;
    }

    console.log("✅ Profile updated successfully!");
    console.log("✅ Updated data:", data);
    return true;
  } catch (error) {
    console.error("❌ Exception during profile update:", error);
    console.error("❌ Exception stack:", (error as Error).stack);
    return false;
  }
}

export async function createUserProfile(userData: any): Promise<boolean> {
  try {
    console.log("🔄 Creating user profile with data:", userData);

    // Debug: Check current auth state
    const { data: { user: currentAuthUser }, error: authError } = await supabase.auth.getUser();
    console.log("🔍 Current auth user:", currentAuthUser?.id);
    console.log("🔍 Auth error:", authError);

    // Debug: Check if the users table exists and what columns it has
    console.log("🔍 Testing table access...");
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(0);

    if (tableError) {
      console.error("❌ Users table access error:", tableError);
      console.error("❌ Table error details:", {
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint,
        code: tableError.code
      });
      return false;
    }
    console.log("✅ Users table is accessible");

    // Convert camelCase to lowercase for database compatibility
    const convertedUserData = { ...userData };
    const fieldConversions: { [key: string]: string } = {
      'profilePicture': 'profilepicture',
      'userType': 'usertype',
      'updatedAt': 'updatedat',
      'createdAt': 'createdat',
      'isVerified': 'isverified',
      'universityAffiliation': 'universityaffiliation',
      'professionalStatus': 'professionalstatus'
    };

    // Apply all conversions
    Object.keys(fieldConversions).forEach(camelCase => {
      if (convertedUserData[camelCase] !== undefined) {
        convertedUserData[fieldConversions[camelCase]] = convertedUserData[camelCase];
        delete convertedUserData[camelCase];
      }
    });

    // Debug: Log the exact insert data and structure
    console.log("🔍 About to insert this exact data:");
    console.log("📋 Data keys:", Object.keys(convertedUserData));
    console.log("📋 Data values:", Object.values(convertedUserData));
    console.log("📋 Full data object:", JSON.stringify(convertedUserData, null, 2));

    // Attempt the insert with detailed error catching
    console.log("🔄 Attempting insert...");
    const { data: insertResult, error } = await supabase
      .from('users')
      .insert(convertedUserData)
      .select(); // Return the inserted data to confirm it worked

    if (error) {
      console.error("❌ INSERT FAILED:");
      console.error("❌ Error message:", error.message);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error details:", error.details);
      console.error("❌ Error hint:", error.hint);
      console.error("❌ Full error object:", JSON.stringify(error, null, 2));

      // Additional debugging for common error codes
      if (error.code === '42501') {
        console.error("🚨 PERMISSION DENIED: RLS policy is blocking this insert");
        console.error("🔍 Check if auth.uid() matches the id field:", convertedUserData.id);
      }
      if (error.code === '23505') {
        console.error("🚨 UNIQUE CONSTRAINT VIOLATION: User already exists");
      }
      if (error.code === '23503') {
        console.error("🚨 FOREIGN KEY CONSTRAINT VIOLATION: Referenced user doesn't exist in auth.users");
      }

      return false;
    }

    console.log("✅ User profile created successfully!");
    console.log("✅ Inserted data:", insertResult);
    return true;
  } catch (error) {
    console.error("❌ Exception during user profile creation:", error);
    console.error("❌ Exception stack:", (error as Error).stack);
    return false;
  }
}

export async function ensureUserProfile(uid: string, email: string, name: string): Promise<boolean> {
  try {
    console.log("🔍 Ensuring user profile exists for:", uid);

    // First check if profile exists
    const existingProfile = await getUserProfile(uid);

    if (existingProfile) {
      console.log("✅ User profile already exists");
      return true;
    }

    // Create new profile if it doesn't exist
    console.log("📝 Creating new user profile");
    const userDoc = {
      id: uid,
      uid: uid,
      email: email,
      name: name,
      profilepicture: "",
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
      isverified: false,
      age: null,
      bio: "",
      location: "",
      area: "",
      budget: null,
      universityaffiliation: null, // Use null for optional fields to avoid any potential constraints
      professionalstatus: null, // Use null instead of empty string to avoid constraint violation
      preferences: {
        smoking: false,
        drinking: false,
        vegetarian: false,
        pets: false,
      },
      usertype: null,
      lifestyle: {},
    };

    const success = await createUserProfile(userDoc);

    if (success) {
      // Verify the profile was created by trying to fetch it again
      const verifyProfile = await getUserProfile(uid);
      if (verifyProfile) {
        console.log("✅ User profile verified after creation");
        return true;
      } else {
        console.warn("⚠️ Profile creation succeeded but verification failed");
        return false;
      }
    }

    return success;
  } catch (error) {
    console.error("❌ Error ensuring user profile:", error);
    return false;
  }
}

// User discovery functions for mobile app
export async function getDiscoverUsers(currentUserId: string, userType: string, limit: number = 10): Promise<any[]> {
  try {
    console.log("🔍 Getting discover users for:", currentUserId, "userType:", userType);

    // Get users with opposite user type for matching
    const oppositeUserType = userType === 'seeker' ? 'provider' : 'seeker';

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('usertype', oppositeUserType)
      .neq('id', currentUserId) // Exclude current user
      .not('age', 'is', null) // Only users with complete profiles
      .not('usertype', 'is', null)
      .limit(limit);

    if (error) {
      console.error("❌ Error getting discover users:", error);
      return [];
    }

    console.log("✅ Found discover users:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("❌ Exception getting discover users:", error);
    return [];
  }
}

export async function getMatches(currentUserId: string): Promise<any[]> {
  try {
    console.log("🔍 Getting matches for:", currentUserId);

    // TODO: Implement proper matching logic based on your match table structure
    // For now, return a subset of users as mock matches
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUserId)
      .not('age', 'is', null)
      .limit(5);

    if (error) {
      console.error("❌ Error getting matches:", error);
      return [];
    }

    console.log("✅ Found matches:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("❌ Exception getting matches:", error);
    return [];
  }
}

export async function getChatConversations(currentUserId: string): Promise<any[]> {
  try {
    console.log("🔍 Getting chat conversations for:", currentUserId);

    // TODO: Implement proper chat/message table queries
    // For now, return matches as potential chat partners
    const matches = await getMatches(currentUserId);

    // Transform matches into chat conversation format
    const conversations = matches.map(match => ({
      id: `chat-${match.id}`,
      partnerId: match.id,
      partnerName: match.name,
      partnerImage: match.profilepicture || `https://via.placeholder.com/100x100/44C76F/004D40?text=${match.name?.charAt(0) || 'U'}`,
      lastMessage: "Hey! I saw your profile and think we'd be great roommates!",
      lastMessageTime: new Date(Date.now() - Math.random() * 86400000), // Random time within last day
      unreadCount: Math.floor(Math.random() * 3),
      isOnline: Math.random() > 0.5,
    }));

    console.log("✅ Found conversations:", conversations.length);
    return conversations;
  } catch (error) {
    console.error("❌ Exception getting chat conversations:", error);
    return [];
  }
}

// Enhanced session validation for mobile
export const validateSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.warn('Session validation error:', error);
      return false;
    }

    if (!session || !session.user) {
      return false;
    }

    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('Session expired, attempting refresh...');

      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !refreshData.session) {
        console.warn('Session refresh failed:', refreshError);
        return false;
      }

      return true;
    }

    return true;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
};

// Session recovery utilities for mobile
export const sessionUtils = {
  // Get current session with error handling
  getCurrentSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      console.error('Failed to get current session:', error);
      return { session: null, error };
    }
  },

  // Refresh session manually
  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return { success: true, session: data.session };
    } catch (error) {
      console.error('Session refresh failed:', error);
      return { success: false, error };
    }
  },

  // Clear session completely
  clearSession: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Session clear failed:', error);
      return { success: false, error };
    }
  },

  // Check session health
  checkSessionHealth: async () => {
    const { session, error } = await sessionUtils.getCurrentSession();

    if (!session) {
      return { healthy: false, reason: 'No session' };
    }

    if (error) {
      return { healthy: false, reason: error.message };
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now + 300) { // 5 minutes buffer
      return { healthy: false, reason: 'Session expiring soon' };
    }

    return { healthy: true, session };
  }
};

// Auto-recovery system for mobile
export const autoRecovery = {
  // Attempt to recover session automatically
  recoverSession: async () => {
    try {
      // Check if session exists but is invalid
      const { session, error } = await sessionUtils.getCurrentSession();

      if (!session) {
        return {
          success: false,
          action: 'no_session',
          error: 'No session found'
        };
      }

      if (error) {
        console.log('Session error detected, attempting refresh...');
        const refreshResult = await sessionUtils.refreshSession();

        if (refreshResult.success) {
          return {
            success: true,
            action: 'refresh_success',
            session: refreshResult.session
          };
        } else {
          return {
            success: false,
            action: 'refresh_failed',
            error: refreshResult.error
          };
        }
      }

      // Session exists and no errors
      const isValid = await validateSession();

      if (isValid) {
        return {
          success: true,
          action: 'session_valid',
          session
        };
      } else {
        return {
          success: false,
          action: 'session_invalid',
          error: 'Session validation failed'
        };
      }

    } catch (error) {
      console.error('Auto recovery failed:', error);
      return {
        success: false,
        action: 'connection_failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Connection health monitoring for mobile
export const connectionMonitor = {
  // Check if Supabase is reachable
  checkConnection: async () => {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      return { connected: !error, error };
    } catch (error) {
      return { connected: false, error };
    }
  },

  // Monitor connection with callback
  startMonitoring: (onConnectionChange: (connected: boolean) => void) => {
    let lastConnectionState = true;

    const checkInterval = setInterval(async () => {
      const { connected } = await connectionMonitor.checkConnection();

      if (connected !== lastConnectionState) {
        lastConnectionState = connected;
        onConnectionChange(connected);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }
};

// Test function to verify mobile client setup
export const testSupabaseClient = async () => {
  console.log('🧪 Testing Mobile Supabase Client Setup...');

  try {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    console.log('✅ Supabase URL:', supabaseUrl);
    console.log('✅ Supabase Client:', !!supabase);

    // Test the connection with a simple query
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.warn('⚠️ Supabase connection test warning:', error.message);
    }

    // Test session utilities
    const sessionHealth = await sessionUtils.checkSessionHealth();

    return {
      success: true,
      url: supabaseUrl,
      sessionCheck: !error,
      sessionHealth
    };
  } catch (error) {
    console.error('❌ Mobile Supabase Client Test Failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};