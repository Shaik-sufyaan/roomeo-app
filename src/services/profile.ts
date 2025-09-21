// services/profile.ts - Consolidated profile management service - Mobile adapted
import { supabase } from './supabase';
import { getUserProfile, updateUserProfile, ensureUserProfile } from './auth';
import { getRoomPhotos, getPrimaryRoomPhoto, uploadRoomPhotos } from './roomPhotos';
import { setUserRole, setupUserProfile, getFullProfile } from './roommate-matching';
import type { User } from '../types/user';
import type {
  RoommateProfile,
  ProfileFormData,
  RoomDetailsFormData,
  SeekerPreferencesFormData,
  UserRole
} from '../types/roommate';
import type { RoomPhoto, MobileImagePickerResult } from '../types/roomPhotos';

export interface CompleteProfileData {
  basicInfo: ProfileFormData;
  roomData?: RoomDetailsFormData;
  preferences?: SeekerPreferencesFormData;
  photos?: MobileImagePickerResult[];
  photoCaptions?: string[];
  primaryPhotoIndex?: number;
}

export interface ProfileCreationResponse {
  success: boolean;
  user?: User;
  roommate_profile?: RoommateProfile;
  uploaded_photos?: RoomPhoto[];
  error?: string;
  validation_errors?: Record<string, string>;
}

export interface ProfileCompletionStatus {
  hasBasicInfo: boolean;
  hasRoomDetails?: boolean; // Only for providers
  hasPreferences?: boolean; // Only for seekers
  hasPhotos: boolean;
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

/**
 * Get comprehensive profile data for a user
 */
export async function getCompleteProfile(userId?: string): Promise<{
  success: boolean;
  profile?: RoommateProfile;
  photos?: RoomPhoto[];
  primaryPhoto?: RoomPhoto;
  completionStatus?: ProfileCompletionStatus;
  error?: string;
}> => {
  try {
    console.log('🔄 Getting complete profile for user:', userId || 'current user');

    let targetUserId = userId;

    // Get current user if no userId provided
    if (!targetUserId) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return { success: false, error: 'Authentication required' };
      }
      targetUserId = user.id;
    }

    // Get user profile data
    const userProfile = await getUserProfile(targetUserId);
    if (!userProfile) {
      return { success: false, error: 'User profile not found' };
    }

    // Get full roommate profile data
    const roommateResult = await getFullProfile(targetUserId);
    let roommateProfile: RoommateProfile;

    if (roommateResult.success && roommateResult.profile) {
      roommateProfile = roommateResult.profile;
    } else {
      // Convert basic user to roommate profile
      roommateProfile = {
        ...userProfile,
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        profilepicture: userProfile.profilePicture,
        user_role: userProfile.userType,
        profile_completed: false,
        created_at: userProfile.createdAt.toISOString(),
        updated_at: userProfile.updatedAt.toISOString()
      };
    }

    // Get room photos
    const photos = await getRoomPhotos(targetUserId);
    const primaryPhoto = await getPrimaryRoomPhoto(targetUserId);

    // Calculate completion status
    const completionStatus = calculateProfileCompletion(roommateProfile, photos);

    return {
      success: true,
      profile: roommateProfile,
      photos,
      primaryPhoto,
      completionStatus
    };

  } catch (error) {
    console.error('❌ Error getting complete profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get profile'
    };
  }
}

/**
 * Create or update a complete user profile
 */
export async function createCompleteProfile(
  userId: string,
  profileData: CompleteProfileData
): Promise<ProfileCreationResponse> => {
  try {
    console.log('🔄 Creating complete profile for user:', userId);

    // Step 1: Setup basic user profile
    const profileResult = await setupUserProfile(
      userId,
      profileData.basicInfo,
      profileData.roomData,
      profileData.preferences
    );

    if (!profileResult.success) {
      return {
        success: false,
        error: profileResult.error,
        validation_errors: profileResult.validation_errors
      };
    }

    console.log('✅ Basic profile setup complete');

    // Step 2: Upload photos if provided
    let uploadedPhotos: RoomPhoto[] | undefined;
    if (profileData.photos && profileData.photos.length > 0) {
      console.log('📸 Uploading room photos...');

      const photoResult = await uploadRoomPhotos(
        profileData.photos,
        profileData.photoCaptions || [],
        profileData.primaryPhotoIndex || 0
      );

      if (!photoResult.success) {
        console.warn('⚠️ Photo upload failed:', photoResult.message);
        // Don't fail the entire profile creation for photo upload issues
      } else {
        uploadedPhotos = photoResult.photos;
        console.log('✅ Photos uploaded successfully');
      }
    }

    // Step 3: Get updated profile data
    const updatedUser = await getUserProfile(userId);
    const roommateProfile = await getFullProfile(userId);

    return {
      success: true,
      user: updatedUser || undefined,
      roommate_profile: roommateProfile.profile,
      uploaded_photos: uploadedPhotos
    };

  } catch (error) {
    console.error('❌ Error creating complete profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create profile'
    };
  }
}

/**
 * Update user role and initialize profile structure
 */
export async function initializeUserProfile(
  userId: string,
  role: UserRole,
  basicInfo?: Partial<ProfileFormData>
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Initializing user profile:', { userId, role });

    // Set user role
    const roleResult = await setUserRole(userId, role);
    if (!roleResult.success) {
      return { success: false, error: roleResult.error };
    }

    // Update basic info if provided
    if (basicInfo) {
      const updateData: Partial<User> = {
        name: basicInfo.name,
        age: basicInfo.age,
        bio: basicInfo.bio,
        location: basicInfo.location,
        userType: role,
        updatedAt: new Date()
      };

      const updateResult = await updateUserProfile(userId, updateData);
      if (!updateResult) {
        return { success: false, error: 'Failed to update basic info' };
      }
    }

    console.log('✅ User profile initialized successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Error initializing user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize profile'
    };
  }
}

/**
 * Calculate profile completion status
 */
function calculateProfileCompletion(
  profile: RoommateProfile,
  photos: RoomPhoto[]
): ProfileCompletionStatus {
  const missingFields: string[] = [];
  let totalFields = 0;
  let completedFields = 0;

  // Basic info fields (required for all users)
  const basicFields = ['name', 'age', 'bio', 'location'];
  basicFields.forEach(field => {
    totalFields++;
    if (profile[field as keyof RoommateProfile]) {
      completedFields++;
    } else {
      missingFields.push(field);
    }
  });

  const hasBasicInfo = missingFields.length === 0;

  // Role-specific fields
  let hasRoomDetails = true;
  let hasPreferences = true;

  if (profile.user_role === 'provider') {
    // Providers need room details
    const roomFields = ['room_type', 'rent_amount', 'address'];
    roomFields.forEach(field => {
      totalFields++;
      const lifestyle = profile.lifestyle as any;
      if (lifestyle && lifestyle[field]) {
        completedFields++;
      } else {
        missingFields.push(field);
        hasRoomDetails = false;
      }
    });
  } else if (profile.user_role === 'seeker') {
    // Seekers need preferences
    const prefFields = ['budget_max', 'preferred_location'];
    prefFields.forEach(field => {
      totalFields++;
      const preferences = profile.preferences as any;
      if (preferences && preferences[field]) {
        completedFields++;
      } else {
        missingFields.push(field);
        hasPreferences = false;
      }
    });
  }

  // Photos (recommended for all users)
  totalFields++;
  const hasPhotos = photos.length > 0;
  if (hasPhotos) {
    completedFields++;
  } else {
    missingFields.push('photos');
  }

  // Calculate completion percentage
  const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  // Profile is complete if basic info is done and role-specific requirements are met
  const isComplete = hasBasicInfo &&
    (profile.user_role === 'provider' ? hasRoomDetails : hasPreferences) &&
    hasPhotos;

  return {
    hasBasicInfo,
    hasRoomDetails: profile.user_role === 'provider' ? hasRoomDetails : undefined,
    hasPreferences: profile.user_role === 'seeker' ? hasPreferences : undefined,
    hasPhotos,
    isComplete,
    completionPercentage,
    missingFields
  };
}

/**
 * Get profile completion suggestions
 */
export async function getProfileSuggestions(userId: string): Promise<{
  success: boolean;
  suggestions?: string[];
  priorityActions?: string[];
  error?: string;
}> => {
  try {
    const profileResult = await getCompleteProfile(userId);
    if (!profileResult.success || !profileResult.completionStatus) {
      return { success: false, error: 'Could not get profile completion status' };
    }

    const { completionStatus, profile } = profileResult;
    const suggestions: string[] = [];
    const priorityActions: string[] = [];

    // Basic info suggestions
    if (!completionStatus.hasBasicInfo) {
      priorityActions.push('Complete your basic profile information');
      if (completionStatus.missingFields.includes('bio')) {
        suggestions.push('Add a bio to tell others about yourself');
      }
      if (completionStatus.missingFields.includes('age')) {
        suggestions.push('Add your age to help with matching');
      }
    }

    // Role-specific suggestions
    if (profile?.user_role === 'provider' && !completionStatus.hasRoomDetails) {
      priorityActions.push('Add details about your room/space');
      suggestions.push('Include rent amount, room type, and address');
    }

    if (profile?.user_role === 'seeker' && !completionStatus.hasPreferences) {
      priorityActions.push('Set your housing preferences');
      suggestions.push('Specify budget range and preferred locations');
    }

    // Photo suggestions
    if (!completionStatus.hasPhotos) {
      priorityActions.push('Upload photos of your space');
      suggestions.push('Photos significantly increase your chances of finding matches');
    } else if (profileResult.photos && profileResult.photos.length < 3) {
      suggestions.push('Consider adding more photos to showcase your space better');
    }

    // General suggestions
    if (completionStatus.isComplete) {
      suggestions.push('Your profile looks great! Start swiping to find matches');
    } else if (completionStatus.completionPercentage > 70) {
      suggestions.push('You\'re almost done! Complete the remaining fields to maximize matches');
    }

    return {
      success: true,
      suggestions,
      priorityActions
    };

  } catch (error) {
    console.error('❌ Error getting profile suggestions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get suggestions'
    };
  }
}

/**
 * Validate profile data before submission
 */
export function validateProfileData(data: CompleteProfileData): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Basic info validation
  const { basicInfo } = data;
  if (!basicInfo.name?.trim()) {
    errors.name = 'Name is required';
  }
  if (!basicInfo.age || basicInfo.age < 18 || basicInfo.age > 100) {
    errors.age = 'Age must be between 18 and 100';
  }
  if (!basicInfo.bio?.trim()) {
    errors.bio = 'Bio is required';
  }
  if (!basicInfo.location?.trim()) {
    errors.location = 'Location is required';
  }

  // Room data validation for providers
  if (data.roomData) {
    if (!data.roomData.rent_amount || data.roomData.rent_amount <= 0) {
      errors.rent_amount = 'Rent amount must be greater than 0';
    }
    if (!data.roomData.address?.trim()) {
      errors.address = 'Address is required';
    }
  }

  // Preferences validation for seekers
  if (data.preferences) {
    if (!data.preferences.max_budget || data.preferences.max_budget <= 0) {
      errors.max_budget = 'Budget must be greater than 0';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}