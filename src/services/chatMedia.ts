// services/chatMedia.ts - Chat media handling service - Mobile adapted
import { supabase } from "./supabase";
import type { MobileImagePickerResult } from "../types/roomPhotos";

// Helper function to ensure user is authenticated
async function ensureAuthenticated() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Upload image to chat - Mobile adapted
 */
export async function uploadChatImage(
  chatId: string,
  imageAsset: MobileImagePickerResult
): Promise<{ success: boolean; imageUrl?: string; thumbnailUrl?: string; error?: string }> {
  try {
    console.log("📸 Uploading chat image for chat:", chatId);

    const user = await ensureAuthenticated();

    // Convert URI to blob
    const response = await fetch(imageAsset.uri);
    const blob = await response.blob();

    // Generate unique filename
    const fileExt = imageAsset.fileName?.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `chat-media/${chatId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: imageAsset.type || 'image/jpeg'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
      return { success: false, error: 'Failed to get public URL' };
    }

    console.log("✅ Chat image uploaded successfully");
    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      thumbnailUrl: publicUrlData.publicUrl // For now, same as image URL
    };

  } catch (error) {
    console.error("❌ Exception uploading chat image:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to upload image' };
  }
}

/**
 * Upload file to chat - Mobile adapted
 */
export async function uploadChatFile(
  chatId: string,
  fileUri: string,
  fileName: string,
  fileType: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    console.log("📎 Uploading chat file for chat:", chatId);

    const user = await ensureAuthenticated();

    // Convert URI to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Generate unique filename
    const timestamp = Date.now();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `chat-media/${chatId}/${timestamp}_${safeFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: fileType
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
      return { success: false, error: 'Failed to get public URL' };
    }

    console.log("✅ Chat file uploaded successfully");
    return {
      success: true,
      fileUrl: publicUrlData.publicUrl
    };

  } catch (error) {
    console.error("❌ Exception uploading chat file:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to upload file' };
  }
}

/**
 * Delete chat media file
 */
export async function deleteChatMedia(fileUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🗑️ Deleting chat media:", fileUrl);

    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'chat-media');
    if (bucketIndex === -1) {
      return { success: false, error: 'Invalid file URL' };
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Delete from storage
    const { error } = await supabase.storage
      .from('chat-media')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    console.log("✅ Chat media deleted successfully");
    return { success: true };

  } catch (error) {
    console.error("❌ Exception deleting chat media:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete file' };
  }
}