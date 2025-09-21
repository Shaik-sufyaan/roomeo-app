// services/marketplace.ts - Marketplace service - Mobile adapted
import { supabase } from "./supabase";
import type {
  Listing,
  CreateListingData,
  UpdateListingData,
  ListingFilters,
  ListingSortOptions,
  MobileImageAsset
} from "../types/listing";

// Helper function to ensure user is authenticated
async function ensureAuthenticated() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Get all listings with seller information
 */
export async function getListings(
  filters?: ListingFilters,
  sort?: ListingSortOptions
): Promise<Listing[]> {
  try {
    console.log("🔍 Fetching listings with filters:", filters, "sort:", sort);

    let query = supabase
      .from('listings')
      .select(`
        *,
        seller:users!created_by (
          id,
          name,
          profilepicture
        )
      `);

    // Apply filters
    if (filters) {
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        // Default to show active and sold listings
        query = query.in('status', ['active', 'sold']);
      }
    } else {
      // Default to show active and sold listings
      query = query.in('status', ['active', 'sold']);
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      // Default sort by newest first
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching listings:", error);
      throw error;
    }

    console.log("✅ Fetched listings:", data?.length || 0);

    // Transform the data to match our Listing interface
    return data?.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      location: item.location,
      images: item.images || [],
      created_by: item.created_by,
      status: item.status,
      created_at: new Date(item.created_at),
      updated_at: new Date(item.updated_at),
      seller: item.seller ? {
        id: item.seller.id,
        name: item.seller.name,
        profilePicture: item.seller.profilepicture
      } : undefined
    })) || [];

  } catch (error) {
    console.error("❌ Exception fetching listings:", error);
    throw error;
  }
}

/**
 * Get a single listing by ID with seller information
 */
export async function getListingById(id: string): Promise<Listing | null> {
  try {
    console.log("🔍 Fetching listing by ID:", id);

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:users!created_by (
          id,
          name,
          profilepicture
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error("❌ Error fetching listing:", error);
      throw error;
    }

    if (!data) {
      return null;
    }

    console.log("✅ Fetched listing:", data.title);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      location: data.location,
      images: data.images || [],
      created_by: data.created_by,
      status: data.status,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      seller: data.seller ? {
        id: data.seller.id,
        name: data.seller.name,
        profilePicture: data.seller.profilepicture
      } : undefined
    };

  } catch (error) {
    console.error("❌ Exception fetching listing:", error);
    throw error;
  }
}

/**
 * Get listings created by a specific user
 */
export async function getUserListings(userId?: string): Promise<Listing[]> {
  try {
    const user = await ensureAuthenticated();
    const targetUserId = userId || user.id;

    console.log("🔍 Fetching user listings:", targetUserId);

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:users!created_by (
          id,
          name,
          profilepicture
        )
      `)
      .eq('created_by', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Error fetching user listings:", error);
      throw error;
    }

    console.log("✅ Fetched user listings:", data?.length || 0);

    return data?.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      location: item.location,
      images: item.images || [],
      created_by: item.created_by,
      status: item.status,
      created_at: new Date(item.created_at),
      updated_at: new Date(item.updated_at),
      seller: item.seller ? {
        id: item.seller.id,
        name: item.seller.name,
        profilePicture: item.seller.profilepicture
      } : undefined
    })) || [];

  } catch (error) {
    console.error("❌ Exception fetching user listings:", error);
    throw error;
  }
}

/**
 * Create a new listing - Mobile adapted
 */
export async function createListing(
  listingData: CreateListingData,
  imageAssets?: MobileImageAsset[]
): Promise<Listing> {
  try {
    console.log("📝 Creating listing:", listingData.title);

    const user = await ensureAuthenticated();

    // Upload images first if provided
    let imageUrls: string[] = [];
    if (imageAssets && imageAssets.length > 0) {
      imageUrls = await uploadListingImages(imageAssets, user.id);
    }

    // Create the listing
    const { data, error } = await supabase
      .from('listings')
      .insert({
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        location: listingData.location,
        images: imageUrls,
        created_by: user.id,
        status: 'active'
      })
      .select(`
        *,
        seller:users!created_by (
          id,
          name,
          profilepicture
        )
      `)
      .single();

    if (error) {
      console.error("❌ Error creating listing:", error);
      throw error;
    }

    console.log("✅ Listing created:", data.id);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      location: data.location,
      images: data.images || [],
      created_by: data.created_by,
      status: data.status,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      seller: data.seller ? {
        id: data.seller.id,
        name: data.seller.name,
        profilePicture: data.seller.profilepicture
      } : undefined
    };

  } catch (error) {
    console.error("❌ Exception creating listing:", error);
    throw error;
  }
}

/**
 * Update an existing listing
 */
export async function updateListing(
  id: string,
  updates: UpdateListingData,
  newImageAssets?: MobileImageAsset[]
): Promise<Listing> {
  try {
    console.log("📝 Updating listing:", id);

    const user = await ensureAuthenticated();

    // Verify user owns this listing
    const existing = await getListingById(id);
    if (!existing || existing.created_by !== user.id) {
      throw new Error('You can only update your own listings');
    }

    // Handle image updates if provided
    let imageUrls = existing.images;
    if (newImageAssets && newImageAssets.length > 0) {
      const newImageUrls = await uploadListingImages(newImageAssets, user.id);
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    // Update the listing
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (newImageAssets && newImageAssets.length > 0) {
      updateData.images = imageUrls;
    }

    const { data, error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .eq('created_by', user.id)
      .select(`
        *,
        seller:users!created_by (
          id,
          name,
          profilepicture
        )
      `)
      .single();

    if (error) {
      console.error("❌ Error updating listing:", error);
      throw error;
    }

    console.log("✅ Listing updated:", data.id);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      location: data.location,
      images: data.images || [],
      created_by: data.created_by,
      status: data.status,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      seller: data.seller ? {
        id: data.seller.id,
        name: data.seller.name,
        profilePicture: data.seller.profilepicture
      } : undefined
    };

  } catch (error) {
    console.error("❌ Exception updating listing:", error);
    throw error;
  }
}

/**
 * Delete a listing
 */
export async function deleteListing(id: string): Promise<void> {
  try {
    console.log("🗑️ Deleting listing:", id);

    const user = await ensureAuthenticated();

    // Verify user owns this listing
    const existing = await getListingById(id);
    if (!existing || existing.created_by !== user.id) {
      throw new Error('You can only delete your own listings');
    }

    // Delete images from storage
    if (existing.images && existing.images.length > 0) {
      for (const imageUrl of existing.images) {
        try {
          const path = imageUrl.split('/').slice(-2).join('/'); // Extract user_id/filename
          await supabase.storage.from('listing-images').remove([path]);
        } catch (imageError) {
          console.warn("⚠️ Could not delete image:", imageUrl, imageError);
        }
      }
    }

    // Delete the listing
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) {
      console.error("❌ Error deleting listing:", error);
      throw error;
    }

    console.log("✅ Listing deleted successfully");

  } catch (error) {
    console.error("❌ Exception deleting listing:", error);
    throw error;
  }
}

/**
 * Upload images for a listing - Mobile helper function
 */
async function uploadListingImages(imageAssets: MobileImageAsset[], userId: string): Promise<string[]> {
  const imageUrls: string[] = [];

  for (let i = 0; i < imageAssets.length; i++) {
    const asset = imageAssets[i];

    try {
      // Convert URI to blob
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = asset.name?.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${i}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: asset.type || 'image/jpeg'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue; // Skip this image but continue with others
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath);

      if (publicUrlData.publicUrl) {
        imageUrls.push(publicUrlData.publicUrl);
      }

    } catch (error) {
      console.error(`Error uploading image ${i}:`, error);
      continue; // Skip this image but continue with others
    }
  }

  return imageUrls;
}

/**
 * Mark listing as sold
 */
export async function markListingAsSold(id: string): Promise<void> {
  try {
    console.log("✅ Marking listing as sold:", id);

    const user = await ensureAuthenticated();

    const { error } = await supabase
      .from('listings')
      .update({
        status: 'sold',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) {
      console.error("❌ Error marking listing as sold:", error);
      throw error;
    }

    console.log("✅ Listing marked as sold");

  } catch (error) {
    console.error("❌ Exception marking listing as sold:", error);
    throw error;
  }
}

/**
 * Search listings by text
 */
export async function searchListings(query: string): Promise<Listing[]> {
  try {
    console.log("🔍 Searching listings:", query);

    return await getListings({
      search: query,
      status: 'active' // Only search active listings
    });

  } catch (error) {
    console.error("❌ Exception searching listings:", error);
    throw error;
  }
}