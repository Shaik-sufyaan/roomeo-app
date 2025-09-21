// lib/storage.ts - Mobile-native Supabase Storage utilities
import { supabase } from '../services/supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { ImagePickerResult } from './imageUtils';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Get Supabase URL for manual URL generation
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pzolweuvoyzyrzeozsxq.supabase.co';

/**
 * Check if a bucket exists in Supabase Storage
 */
export async function checkBucketExists(bucketName: string): Promise<boolean> {
  try {
    console.log(`🔍 Checking if bucket '${bucketName}' exists...`);

    const { data, error } = await supabase.storage.getBucket(bucketName);

    if (error) {
      console.warn(`⚠️ Bucket '${bucketName}' check failed:`, error.message);
      return false;
    }

    console.log(`✅ Bucket '${bucketName}' exists`);
    return true;
  } catch (error) {
    console.error(`❌ Error checking bucket '${bucketName}':`, error);
    return false;
  }
}

/**
 * Generate public URL manually as fallback
 */
function generatePublicUrl(fileName: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`;
}

/**
 * Convert file URI to blob for upload (mobile specific)
 */
async function uriToBlob(uri: string): Promise<{ blob: Blob; size: number }> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return { blob, size: blob.size };
  } catch (error) {
    console.error('Error converting URI to blob:', error);
    throw error;
  }
}

/**
 * Get file info from URI (mobile specific)
 */
async function getFileInfo(uri: string): Promise<{ size: number; mimeType?: string }> {
  try {
    if (Platform.OS === 'web') {
      // Web platform: use fetch to get blob info
      const response = await fetch(uri);
      const blob = await response.blob();
      return { size: blob.size, mimeType: blob.type };
    } else {
      // Native platforms: use Expo FileSystem
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }
      return { size: fileInfo.size || 0 };
    }
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
}

/**
 * Enhanced image upload for mobile with comprehensive error handling
 */
export async function uploadImage(
  imageResult: ImagePickerResult,
  userId: string
): Promise<UploadResult> {
  try {
    console.log('🔄 Starting image upload for user:', userId);

    // Validate input
    if (!imageResult || !imageResult.uri) {
      throw new Error('No image provided');
    }

    // Get file information
    const fileInfo = await getFileInfo(imageResult.uri);

    // Check file size (max 10MB for mobile)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileInfo.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileType = imageResult.type || fileInfo.mimeType || 'image/jpeg';
    if (!allowedTypes.some(type => fileType.includes(type.split('/')[1]))) {
      throw new Error('Invalid file type. Only JPEG and PNG are allowed.');
    }

    // Check if avatars bucket exists
    const bucketExists = await checkBucketExists('avatars');
    if (!bucketExists) {
      console.warn('⚠️ Avatars bucket does not exist. Upload may fail.');
    }

    // Generate unique filename
    const fileExt = imageResult.name?.split('.').pop() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    console.log('📁 Uploading file:', fileName);

    // Convert URI to blob for upload
    const { blob } = await uriToBlob(imageResult.uri);

    // Upload to Supabase Storage with enhanced error handling
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: fileType
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);

      // Handle specific error types
      if (uploadError.message?.includes('bucket')) {
        throw new Error('Storage bucket not found. Please check your Supabase configuration.');
      } else if (uploadError.message?.includes('permission')) {
        throw new Error('Permission denied. Please check your storage policies.');
      } else if (uploadError.message?.includes('413')) {
        throw new Error('File too large. Please choose a smaller image.');
      } else {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
    }

    if (!data?.path) {
      throw new Error('Upload succeeded but no file path returned');
    }

    console.log('✅ File uploaded successfully:', data.path);

    // Try to get public URL with fallback
    let publicUrl: string;

    try {
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        publicUrl = urlData.publicUrl;
        console.log('✅ Public URL generated via Supabase:', publicUrl);
      } else {
        throw new Error('Supabase getPublicUrl returned no URL');
      }
    } catch (urlError) {
      console.warn('⚠️ Supabase getPublicUrl failed, using manual URL generation:', urlError);

      // Fallback: Generate URL manually
      publicUrl = generatePublicUrl(fileName);
      console.log('✅ Using manual URL generation:', publicUrl);
    }

    return {
      success: true,
      url: publicUrl
    };

  } catch (error) {
    console.error('❌ Image upload failed:', error);

    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Enhanced image deletion with better error handling
 */
export async function deleteImage(fileName: string): Promise<boolean> {
  try {
    console.log('🗑️ Deleting image:', fileName);

    if (!fileName) {
      console.warn('⚠️ No filename provided for deletion');
      return false;
    }

    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);

    if (error) {
      console.error('❌ Delete error:', error);

      // Handle specific error types
      if (error.message?.includes('not found')) {
        console.warn('⚠️ File not found for deletion (may have been already deleted)');
        return true; // Consider this a success since the goal is achieved
      } else if (error.message?.includes('permission')) {
        console.error('❌ Permission denied for file deletion');
        return false;
      } else {
        console.error('❌ Unknown deletion error:', error.message);
        return false;
      }
    }

    console.log('✅ Image deleted successfully');
    return true;

  } catch (error) {
    console.error('❌ Image deletion failed:', error);
    return false;
  }
}

/**
 * Enhanced image URL retrieval with fallback
 */
export async function getImageUrl(fileName: string): Promise<string | null> {
  try {
    if (!fileName) {
      console.warn('⚠️ No filename provided for URL retrieval');
      return null;
    }

    // Try Supabase getPublicUrl first
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (data?.publicUrl) {
      console.log('✅ Image URL retrieved via Supabase:', data.publicUrl);
      return data.publicUrl;
    }

    // Fallback: Generate URL manually
    console.warn('⚠️ Supabase getPublicUrl failed, using manual URL generation');
    const manualUrl = generatePublicUrl(fileName);
    console.log('✅ Using manual URL generation:', manualUrl);
    return manualUrl;

  } catch (error) {
    console.error('❌ Error getting image URL:', error);

    // Final fallback: manual URL generation
    try {
      const manualUrl = generatePublicUrl(fileName);
      console.log('✅ Using manual URL generation as fallback:', manualUrl);
      return manualUrl;
    } catch (fallbackError) {
      console.error('❌ Manual URL generation also failed:', fallbackError);
      return null;
    }
  }
}

/**
 * Validate image file before upload (mobile version)
 */
export function validateImageFile(
  imageResult: ImagePickerResult
): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const fileType = imageResult.type || 'image/jpeg';
  if (!allowedTypes.some(type => fileType.includes(type.split('/')[1]))) {
    return { valid: false, error: 'Invalid file type. Only JPEG and PNG are allowed.' };
  }

  // Check file size if available (max 10MB for mobile)
  const maxSize = 10 * 1024 * 1024;
  if (imageResult.size && imageResult.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 10MB.' };
  }

  return { valid: true };
}

/**
 * Test storage functionality
 */
export async function testStorageConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🧪 Testing Supabase Storage connection...');

    // Check if avatars bucket exists
    const bucketExists = await checkBucketExists('avatars');

    if (!bucketExists) {
      return {
        success: false,
        error: 'Avatars bucket does not exist. Please check your Supabase storage setup.'
      };
    }

    console.log('✅ Storage connection test passed');
    return { success: true };

  } catch (error) {
    console.error('❌ Storage connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Storage test failed'
    };
  }
}

/**
 * Cache image locally for offline access (mobile specific)
 */
export async function cacheImageLocally(
  remoteUri: string,
  fileName: string
): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      // Web doesn't need local caching
      return remoteUri;
    }

    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Check if already cached
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      console.log('✅ Image already cached locally:', fileUri);
      return fileUri;
    }

    // Download and cache
    console.log('📥 Caching image locally:', fileName);
    const downloadResult = await FileSystem.downloadAsync(remoteUri, fileUri);

    if (downloadResult.status === 200) {
      console.log('✅ Image cached successfully:', downloadResult.uri);
      return downloadResult.uri;
    } else {
      console.error('❌ Failed to cache image:', downloadResult.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Error caching image locally:', error);
    return null;
  }
}

/**
 * Clear cached images (mobile specific)
 */
export async function clearCachedImages(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return true; // No caching on web
    }

    const cacheDir = FileSystem.documentDirectory;
    if (!cacheDir) {
      return false;
    }

    const files = await FileSystem.readDirectoryAsync(cacheDir);
    const imageFiles = files.filter(file =>
      file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
    );

    for (const file of imageFiles) {
      await FileSystem.deleteAsync(`${cacheDir}${file}`);
    }

    console.log(`✅ Cleared ${imageFiles.length} cached images`);
    return true;
  } catch (error) {
    console.error('❌ Error clearing cached images:', error);
    return false;
  }
}