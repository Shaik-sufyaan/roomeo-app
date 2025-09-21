// lib/imageUtils.ts - Mobile-native image processing utilities
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ImageResizeResult {
  uri: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  width: number;
  height: number;
}

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
  size?: number;
  width?: number;
  height?: number;
}

/**
 * Request camera and media library permissions for mobile
 */
export async function requestImagePermissions(): Promise<boolean> {
  try {
    // Request camera permissions
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

    // Request media library permissions
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

    return cameraStatus.status === 'granted' && mediaStatus.status === 'granted';
  } catch (error) {
    console.error('Error requesting image permissions:', error);
    return false;
  }
}

/**
 * Pick an image from camera or gallery using Expo ImagePicker
 */
export async function pickImage(
  source: 'camera' | 'gallery' | 'both' = 'both'
): Promise<ImagePickerResult | null> {
  try {
    const hasPermissions = await requestImagePermissions();
    if (!hasPermissions) {
      throw new Error('Camera and media library permissions are required');
    }

    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } else if (source === 'gallery') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } else {
      // Show action sheet to choose between camera and gallery
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
    }

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: asset.type || 'image',
      name: asset.fileName || 'image.jpg',
      size: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
}

/**
 * Compress and resize an image using Expo ImageManipulator
 */
export async function compressImage(
  uri: string,
  options: ImageCompressOptions = {}
): Promise<ImageResizeResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  try {
    // Get original image info
    const originalInfo = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Calculate resize dimensions while maintaining aspect ratio
    const resizeActions: ImageManipulator.Action[] = [];
    resizeActions.push({
      resize: {
        width: maxWidth,
        height: maxHeight,
      },
    });

    // Process the image
    const result = await ImageManipulator.manipulateAsync(
      uri,
      resizeActions,
      {
        compress: quality,
        format: format === 'png' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      originalSize: undefined, // File size not available in Expo ImageManipulator
      compressedSize: undefined,
      compressionRatio: undefined,
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}

/**
 * Generate multiple sizes of an image for responsive loading
 */
export async function generateResponsiveSizes(
  uri: string,
  sizes: number[] = [400, 800, 1200]
): Promise<{ size: number; uri: string }[]> {
  try {
    const results = await Promise.all(
      sizes.map(async (size) => {
        const compressed = await compressImage(uri, {
          maxWidth: size,
          maxHeight: size,
          quality: 0.85
        });

        return {
          size,
          uri: compressed.uri
        };
      })
    );

    return results;
  } catch (error) {
    console.error('Error generating responsive sizes:', error);
    return [];
  }
}

/**
 * Validate image file for mobile constraints
 */
export function validateImageFile(
  result: ImagePickerResult,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default for mobile
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  } = options;

  // Check file type if available
  if (result.type && !allowedTypes.some(type => result.type.includes(type.split('/')[1]))) {
    return {
      valid: false,
      error: `Only ${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} images are allowed`
    };
  }

  // Check file size if available
  if (result.size && result.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `Image must be less than ${maxSizeMB}MB`
    };
  }

  return { valid: true };
}

/**
 * Create a thumbnail from an image URI using Expo ImageManipulator
 */
export async function createThumbnail(uri: string, size: number = 150): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: size,
            height: size,
          },
        },
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
}

/**
 * Check if image dimensions are suitable for room photos
 */
export function validateImageDimensions(
  result: ImagePickerResult
): { valid: boolean; error?: string } {
  if (!result.width || !result.height) {
    return {
      valid: false,
      error: 'Could not read image dimensions'
    };
  }

  const { width, height } = result;

  // Check minimum dimensions
  if (width < 400 || height < 300) {
    return {
      valid: false,
      error: 'Image must be at least 400x300 pixels'
    };
  }

  // Check aspect ratio (should be reasonable for room photos)
  const aspectRatio = width / height;
  if (aspectRatio < 0.5 || aspectRatio > 3) {
    return {
      valid: false,
      error: 'Image aspect ratio should be between 1:2 and 3:1 for best display'
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get optimized image URI for different screen densities
 */
export function getOptimizedImageUri(
  uri: string,
  screenDensity: number = 1
): string {
  // For external URLs, return as is
  if (uri.startsWith('http')) {
    return uri;
  }

  // For local URIs, you could implement density-specific logic here
  // For now, return the original URI
  return uri;
}

/**
 * Convert local file URI to blob for upload (mobile specific)
 */
export async function uriToBlob(uri: string): Promise<Blob> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error converting URI to blob:', error);
    throw error;
  }
}

/**
 * Check if the device supports camera functionality
 */
export function isCameraAvailable(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}