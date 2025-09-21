// services/auth.ts - Authentication service - Mobile adapted
import { supabase } from './supabase';
import { User } from '../types/user';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  profilePicture?: string;
}

// Get user profile with enhanced error handling
export async function getUserProfile(uid: string): Promise<User | null> {
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

    // Transform database fields to our User type
    const user: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      profilePicture: data.profilepicture || "",
      userType: data.usertype || undefined,
      bio: data.bio || "",
      age: data.age || undefined,
      location: data.location || "",
      area: data.area || "",
      budget: data.budget || undefined,
      universityAffiliation: data.universityaffiliation || undefined,
      professionalStatus: data.professionalstatus || undefined,
      preferences: data.preferences || {
        smoking: false,
        drinking: false,
        vegetarian: false,
        pets: false,
      },
      lifestyle: data.lifestyle || {},
      isVerified: data.isverified || false,
      createdAt: new Date(data.createdat || data.created_at),
      updatedAt: new Date(data.updatedat || data.updated_at),
    };

    return user;
  } catch (error) {
    console.error("❌ Exception getting user profile:", error);
    return null;
  }
}

// Create user profile in database
export async function createUserProfile(userData: any): Promise<boolean> {
  try {
    console.log("📝 Creating user profile:", userData.id);

    const { data: insertResult, error } = await supabase
      .from('users')
      .insert(userData)
      .select();

    if (error) {
      console.error("❌ CREATE PROFILE FAILED:");
      console.error("❌ Error message:", error.message);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error details:", error.details);
      console.error("❌ Error hint:", error.hint);
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

// Ensure user profile exists, create if not
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
      universityaffiliation: null,
      professionalstatus: null,
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

// Update user profile
export async function updateUserProfile(uid: string, updates: Partial<User>): Promise<boolean> {
  try {
    console.log("🔄 Updating user profile:");
    console.log("   - User ID:", uid);
    console.log("   - Updates:", updates);

    // Check current auth state
    const { data: { user: currentAuthUser }, error: authError } = await supabase.auth.getUser();
    console.log("🔍 Current auth user during update:", currentAuthUser?.id);

    // Verify the user is authenticated and matches the profile being updated
    if (authError || !currentAuthUser) {
      console.error("❌ User not authenticated during update");
      return false;
    }

    if (currentAuthUser.id !== uid) {
      console.error("❌ Auth user ID doesn't match profile ID being updated");
      return false;
    }

    // Convert camelCase field names to database lowercase format
    const convertedUpdates: any = { ...updates };

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

    // Always update the updatedAt timestamp
    convertedUpdates.updatedat = new Date().toISOString();

    console.log("🔄 About to update with data:", convertedUpdates);

    const { data, error } = await supabase
      .from('users')
      .update(convertedUpdates)
      .eq('id', uid)
      .select();

    if (error) {
      console.error("❌ UPDATE FAILED:");
      console.error("❌ Error message:", error.message);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error details:", error.details);
      return false;
    }

    console.log("✅ User profile updated successfully!");
    console.log("✅ Updated data:", data);
    return true;
  } catch (error) {
    console.error("❌ Exception updating user profile:", error);
    return false;
  }
}

// Sign up with email and password (mobile adapted)
export const signUpWithEmail = async (userData: CreateUserData) => {
  try {
    console.log('🔄 Starting sign up process...');

    if (!supabase) {
      throw new Error('Supabase services not initialized');
    }

    console.log('✅ Supabase services initialized');

    // Create user with email and password
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.name,
        }
      }
    });

    if (error) throw error;

    const user = data.user;
    console.log('✅ User created in Supabase Auth:', user?.id);

    // Create user document in Supabase
    if (user) {
      const success = await ensureUserProfile(user.id, userData.email, userData.name);
      if (!success) {
        throw new Error('Failed to create user profile');
      }
    }

    return {
      success: true,
      user: {
        uid: user?.id,
        email: user?.email,
        displayName: user?.user_metadata?.full_name,
        photoURL: user?.user_metadata?.avatar_url
      }
    };

  } catch (error: any) {
    console.error('❌ Sign up error:', error);

    let errorMessage = "Sign up failed. Please try again.";

    if (error.message) {
      if (error.message.includes('already registered')) {
        errorMessage = "An account with this email already exists.";
      } else if (error.message.includes('password')) {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.message.includes('email')) {
        errorMessage = "Please enter a valid email address.";
      }
    }

    throw new Error(errorMessage);
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('🔄 Starting sign in process...');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    console.log('✅ Sign in successful:', data.user?.id);

    return {
      success: true,
      user: {
        uid: data.user?.id,
        email: data.user?.email,
        displayName: data.user?.user_metadata?.full_name,
        photoURL: data.user?.user_metadata?.avatar_url
      }
    };

  } catch (error: any) {
    console.error('❌ Sign in error:', error);

    let errorMessage = "Sign in failed. Please try again.";

    if (error.message) {
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password.";
      } else if (error.message.includes('email')) {
        errorMessage = "Please enter a valid email address.";
      }
    }

    throw new Error(errorMessage);
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('✅ Sign out successful');
  } catch (error: any) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
};