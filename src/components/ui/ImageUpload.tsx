// components/ui/ImageUpload.tsx - Mobile-native image picker component
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { cn } from '../../lib/utils';
import { pickImage, validateImageFile, compressImage, type ImagePickerResult } from '../../lib/imageUtils';
import { uploadImage, type UploadResult } from '../../lib/storage';

const { width } = Dimensions.get('window');

export interface ImageUploadProps {
  value?: string;
  onValueChange?: (url: string | null) => void;
  onUploadStart?: () => void;
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  placeholder?: string;
  maxSize?: number;
  quality?: number;
  allowedTypes?: string[];
  variant?: 'default' | 'avatar' | 'banner' | 'square';
  size?: 'sm' | 'default' | 'lg' | 'xl';
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  showFileName?: boolean;
  showProgress?: boolean;
  multiple?: boolean;
  style?: ViewStyle;
  imageStyle?: ViewStyle;
  textStyle?: TextStyle;
  userId?: string; // For Supabase uploads
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onValueChange,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  placeholder = 'Tap to select image',
  maxSize = 5 * 1024 * 1024, // 5MB
  quality = 0.8,
  allowedTypes = ['image/jpeg', 'image/png'],
  variant = 'default',
  size = 'default',
  disabled = false,
  required = false,
  error = false,
  errorMessage,
  helperText,
  showFileName = false,
  showProgress = true,
  multiple = false,
  style,
  imageStyle,
  textStyle,
  userId,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImagePickerResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const containerStyles = [
    styles.container,
    styles[`container${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`containerSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    disabled && styles.containerDisabled,
    error && styles.containerError,
    style,
  ];

  const imageDisplayStyles = [
    styles.imageDisplay,
    styles[`imageDisplay${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    imageStyle,
  ];

  const placeholderStyles = [
    styles.placeholder,
    styles[`placeholderSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    disabled && styles.placeholderDisabled,
    textStyle,
  ];

  const handleImagePick = async () => {
    if (disabled) return;

    try {
      // Pick image from gallery or camera
      const imageResult = await pickImage('both');

      if (!imageResult) {
        return; // User cancelled
      }

      // Validate the selected image
      const validation = validateImageFile(imageResult, {
        maxSize,
        allowedTypes,
      });

      if (!validation.valid) {
        Alert.alert('Invalid Image', validation.error);
        onUploadError?.(validation.error || 'Invalid image');
        return;
      }

      setSelectedImage(imageResult);

      // If userId is provided, automatically upload to Supabase
      if (userId) {
        await handleUpload(imageResult);
      } else {
        // Just set the local image URI
        onValueChange?.(imageResult.uri);
      }

    } catch (error) {
      console.error('Error picking image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to pick image';
      Alert.alert('Error', errorMessage);
      onUploadError?.(errorMessage);
    }
  };

  const handleUpload = async (imageResult: ImagePickerResult) => {
    if (!userId) {
      onUploadError?.('User ID required for upload');
      return;
    }

    setUploading(true);
    onUploadStart?.();

    try {
      // Compress image if needed
      let finalImage = imageResult;
      if (quality < 1) {
        const compressed = await compressImage(imageResult.uri, {
          quality,
          maxWidth: 1200,
          maxHeight: 1200,
        });
        finalImage = {
          ...imageResult,
          uri: compressed.uri,
        };
      }

      // Upload to Supabase
      const uploadResult = await uploadImage(finalImage, userId);

      if (uploadResult.success && uploadResult.url) {
        onValueChange?.(uploadResult.url);
        onUploadComplete?.(uploadResult);
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      Alert.alert('Upload Failed', errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (disabled) return;

    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSelectedImage(null);
            onValueChange?.(null);
          },
        },
      ]
    );
  };

  const renderContent = () => {
    const displayImage = value || selectedImage?.uri;

    if (displayImage) {
      return (
        <View style={styles.imageContainer}>
          <Image source={{ uri: displayImage }} style={cn(...imageDisplayStyles)} />

          {!disabled && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemove}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          )}

          {uploading && showProgress && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.uploadText}>Uploading...</Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderIcon}>📷</Text>
        <Text style={cn(...placeholderStyles)}>
          {placeholder}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {helperText && (
          <Text style={styles.helperText}>{helperText}</Text>
        )}
      </View>
    );
  };

  return (
    <View>
      <TouchableOpacity
        style={cn(...containerStyles)}
        onPress={handleImagePick}
        disabled={disabled || uploading}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>

      {showFileName && selectedImage?.name && (
        <Text style={styles.fileName}>{selectedImage.name}</Text>
      )}

      {error && errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Container styles
  container: {
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Container variants
  containerDefault: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  containerAvatar: {
    aspectRatio: 1,
    borderRadius: 100,
    width: 120,
    height: 120,
  },
  containerBanner: {
    aspectRatio: 3 / 1,
    width: '100%',
  },
  containerSquare: {
    aspectRatio: 1,
    width: '100%',
  },

  // Container sizes
  containerSizeSm: {
    minHeight: 80,
  },
  containerSizeDefault: {
    minHeight: 120,
  },
  containerSizeLg: {
    minHeight: 160,
  },
  containerSizeXl: {
    minHeight: 200,
  },

  // Container states
  containerDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    opacity: 0.6,
  },
  containerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },

  // Image container
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },

  // Image display
  imageDisplay: {
    width: '100%',
    height: '100%',
  },
  imageDisplayDefault: {
    borderRadius: 6,
  },
  imageDisplayAvatar: {
    borderRadius: 100,
  },
  imageDisplayBanner: {
    borderRadius: 6,
  },
  imageDisplaySquare: {
    borderRadius: 6,
  },

  // Remove button
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // Upload overlay
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Placeholder container
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  // Placeholder text
  placeholder: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  placeholderSizeSm: {
    fontSize: 14,
  },
  placeholderSizeDefault: {
    fontSize: 16,
  },
  placeholderSizeLg: {
    fontSize: 18,
  },
  placeholderSizeXl: {
    fontSize: 20,
  },
  placeholderDisabled: {
    color: '#D1D5DB',
  },

  // Required asterisk
  required: {
    color: '#EF4444',
    fontWeight: '600',
  },

  // Helper text
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },

  // File name
  fileName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },

  // Error text
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
});

// Export default for convenience
export default ImageUpload;