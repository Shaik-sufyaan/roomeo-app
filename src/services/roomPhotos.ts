// services/roomPhotos.ts - Room photo management services - Mobile adapted
import { supabase } from "./supabase";
import type {
  RoomPhoto,
  UploadRoomPhotoRequest,
  UploadRoomPhotosResponse,
  PhotoValidationResult,
  MobileImagePickerResult,
  MobileImageUploadOptions
} from '../types/roomPhotos';

// Helper function to ensure user is authenticated
async function ensureAuthenticated() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Authentication required');
  }
  return user;
}

// Validate image data for mobile
function validateImageData(imageData: MobileImagePickerResult): PhotoValidationResult {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const fileType = imageData.type?.toLowerCase() || '';

  if (!validTypes.some(type => fileType.includes(type))) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (imageData.fileSize && imageData.fileSize > maxSize) {
    return { valid: false, error: 'Image must be less than 5MB' };
  }

  return { valid: true };
}

// Create room_photos table if it doesn't exist (for development)
async function ensureRoomPhotosTable(): Promise<void> {
  try {
    // Check if table exists by trying to query it
    const { error } = await supabase
      .from('room_photos')
      .select('id')
      .limit(1);

    if (error && error.message.includes('relation "room_photos" does not exist')) {
      console.log('🔧 Creating room_photos table...');

      // Create the table using raw SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS room_photos (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            photo_url TEXT NOT NULL,
            caption TEXT,
            is_primary BOOLEAN DEFAULT FALSE,
            display_order INTEGER DEFAULT 1,
            uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Enable RLS
          ALTER TABLE room_photos ENABLE ROW LEVEL SECURITY;

          -- Create policies
          CREATE POLICY "Users can view their own room photos" ON room_photos
            FOR SELECT USING (auth.uid() = user_id);

          CREATE POLICY "Users can view all room photos for discovery" ON room_photos
            FOR SELECT USING (true);

          CREATE POLICY "Users can insert their own room photos" ON room_photos
            FOR INSERT WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Users can update their own room photos" ON room_photos
            FOR UPDATE USING (auth.uid() = user_id);

          CREATE POLICY "Users can delete their own room photos" ON room_photos
            FOR DELETE USING (auth.uid() = user_id);

          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_room_photos_user_id ON room_photos(user_id);
          CREATE INDEX IF NOT EXISTS idx_room_photos_is_primary ON room_photos(is_primary);
          CREATE INDEX IF NOT EXISTS idx_room_photos_display_order ON room_photos(display_order);
        `
      });

      if (createError) {
        console.warn('Could not create room_photos table automatically:', createError);
      } else {
        console.log('✅ room_photos table created successfully');
      }
    }
  } catch (error) {
    console.warn('Table check failed:', error);
  }
}

// Upload multiple room photos - Mobile adapted
export async function uploadRoomPhotos(
  imageAssets: MobileImagePickerResult[],
  captions: (string | undefined)[] = [],
  primaryPhotoIndex: number = 0
): Promise<UploadRoomPhotosResponse> {
  try {
    console.log('🔄 Uploading room photos:', imageAssets.length);

    // Ensure user is authenticated
    const user = await ensureAuthenticated();

    // Ensure table exists
    await ensureRoomPhotosTable();

    // Validate file count (max 15 photos per user)
    const existingPhotos = await getRoomPhotos(user.id);
    if (existingPhotos.length + imageAssets.length > 15) {
      return {
        success: false,
        message: `Cannot upload ${imageAssets.length} photos. Maximum 15 photos per user (you have ${existingPhotos.length} existing).`
      };
    }

    // Validate all images first
    for (let i = 0; i < imageAssets.length; i++) {
      const validation = validateImageData(imageAssets[i]);
      if (!validation.valid) {
        return {
          success: false,
          message: `Image ${i + 1}: ${validation.error}`
        };
      }
    }

    const uploadedPhotos: RoomPhoto[] = [];

    // Upload each image
    for (let i = 0; i < imageAssets.length; i++) {
      const imageAsset = imageAssets[i];
      const caption = captions[i];
      const isPrimary = i === primaryPhotoIndex && existingPhotos.length === 0; // Only set primary if no existing photos

      try {
        // Convert URI to blob for upload
        const response = await fetch(imageAsset.uri);
        const blob = await response.blob();

        // Generate unique filename
        const fileExt = imageAsset.fileName?.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${i}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('room-photos')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: false,
            contentType: imageAsset.type || 'image/jpeg'
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('room-photos')
          .getPublicUrl(filePath);

        if (!publicUrlData.publicUrl) {
          throw new Error(`Failed to get public URL for image ${i + 1}`);
        }

        // Save metadata to database
        const { data: photoData, error: dbError } = await supabase
          .from('room_photos')
          .insert({
            user_id: user.id,
            photo_url: publicUrlData.publicUrl,
            caption: caption || null,
            is_primary: isPrimary,
            display_order: existingPhotos.length + i + 1
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          // Clean up uploaded file if database insert fails
          await supabase.storage
            .from('room-photos')
            .remove([filePath]);
          throw new Error(`Failed to save image ${i + 1} metadata: ${dbError.message}`);
        }

        uploadedPhotos.push(photoData);
        console.log(`✅ Uploaded image ${i + 1}`);

      } catch (imageError) {
        console.error(`Error uploading image ${i + 1}:`, imageError);
        // Clean up any partial uploads
        for (const uploaded of uploadedPhotos) {
          await deleteRoomPhoto(uploaded.id);
        }
        return {
          success: false,
          message: imageError instanceof Error ? imageError.message : `Failed to upload image ${i + 1}`
        };
      }
    }

    console.log('✅ All photos uploaded successfully');
    return {
      success: true,
      photos: uploadedPhotos
    };

  } catch (error) {
    console.error('❌ Exception uploading room photos:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload room photos'
    };
  }
}

// Get all room photos for a user
export async function getRoomPhotos(userId?: string): Promise<RoomPhoto[]> {
  try {
    console.log('🔄 Fetching room photos for user:', userId || 'current user');

    let targetUserId = userId;

    // If no userId provided, get current user
    if (!targetUserId) {
      const user = await ensureAuthenticated();
      targetUserId = user.id;
    }

    // Ensure table exists
    await ensureRoomPhotosTable();

    const { data, error } = await supabase
      .from('room_photos')
      .select('*')
      .eq('user_id', targetUserId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching room photos:', error);
      return [];
    }

    console.log('✅ Room photos retrieved:', data?.length || 0);
    return data || [];

  } catch (error) {
    console.error('❌ Exception fetching room photos:', error);
    return [];
  }
}

// Get primary room photo for a user
export async function getPrimaryRoomPhoto(userId: string): Promise<RoomPhoto | null> {
  try {
    console.log('🔄 Fetching primary room photo for user:', userId);

    // Ensure table exists
    await ensureRoomPhotosTable();

    const { data, error } = await supabase
      .from('room_photos')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    if (error) {
      // Not an error if no primary photo exists
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching primary room photo:', error);
      return null;
    }

    console.log('✅ Primary room photo retrieved');
    return data;

  } catch (error) {
    console.error('❌ Exception fetching primary room photo:', error);
    return null;
  }
}

// Set a photo as primary
export async function setPrimaryPhoto(photoId: string): Promise<{ success: boolean; message?: string }> {
  try {
    console.log('🔄 Setting primary photo:', photoId);

    // Ensure user is authenticated
    const user = await ensureAuthenticated();

    // First, unset all primary photos for this user
    const { error: unsetError } = await supabase
      .from('room_photos')
      .update({ is_primary: false })
      .eq('user_id', user.id);

    if (unsetError) {
      console.error('Error unsetting primary photos:', unsetError);
      return { success: false, message: unsetError.message };
    }

    // Set the selected photo as primary
    const { error } = await supabase
      .from('room_photos')
      .update({ is_primary: true })
      .eq('id', photoId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error setting primary photo:', error);
      return { success: false, message: error.message };
    }

    console.log('✅ Primary photo set successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Exception setting primary photo:', error);
    return { success: false, message: 'Failed to set primary photo' };
  }
}

// Update photo caption
export async function updatePhotoCaption(photoId: string, caption: string): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log('🔄 Updating photo caption:', photoId);

    // Ensure user is authenticated
    const user = await ensureAuthenticated();

    const { error } = await supabase
      .from('room_photos')
      .update({ caption })
      .eq('id', photoId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating photo caption:', error);
      return { success: false, message: error.message };
    }

    console.log('✅ Photo caption updated successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Exception updating photo caption:', error);
    return { success: false, message: 'Failed to update photo caption' };
  }
}

// Reorder photos
export async function reorderPhotos(photoIds: string[]): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log('🔄 Reordering photos:', photoIds);

    // Ensure user is authenticated
    const user = await ensureAuthenticated();

    // Update display order for each photo
    for (let i = 0; i < photoIds.length; i++) {
      const { error } = await supabase
        .from('room_photos')
        .update({ display_order: i + 1 })
        .eq('id', photoIds[i])
        .eq('user_id', user.id);

      if (error) {
        console.error('Error reordering photo:', error);
        return { success: false, message: error.message };
      }
    }

    console.log('✅ Photos reordered successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Exception reordering photos:', error);
    return { success: false, message: 'Failed to reorder photos' };
  }
}

// Delete a room photo
export async function deleteRoomPhoto(photoId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log('🔄 Deleting room photo:', photoId);

    // Ensure user is authenticated
    const user = await ensureAuthenticated();

    // Get photo details first
    const { data: photo, error: fetchError } = await supabase
      .from('room_photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !photo) {
      return { success: false, message: 'Photo not found' };
    }

    // Delete from storage
    const filePath = photo.photo_url.split('/').slice(-2).join('/'); // Extract folder/filename
    if (filePath && filePath.includes(user.id)) {
      await supabase.storage
        .from('room-photos')
        .remove([filePath]);
    }

    // Delete from database
    const { error } = await supabase
      .from('room_photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting photo from database:', error);
      return { success: false, message: error.message };
    }

    console.log('✅ Room photo deleted successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Exception deleting room photo:', error);
    return { success: false, message: 'Failed to delete room photo' };
  }
}

// Get photo count for user
export async function getPhotoCount(userId: string): Promise<number> {
  try {
    await ensureRoomPhotosTable();

    const { data, error } = await supabase
      .from('room_photos')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting photo count:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('❌ Exception getting photo count:', error);
    return 0;
  }
}