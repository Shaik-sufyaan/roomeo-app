// types/listing.ts - Mobile adapted
export interface Listing {
  id: string;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  images: string[]; // Array of image URLs
  created_by: string; // User ID who created the listing
  status: 'active' | 'sold' | 'expired';
  created_at: Date;
  updated_at: Date;
  // Seller information (joined from users table)
  seller?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

export interface CreateListingData {
  title: string;
  description?: string;
  price?: number;
  location?: string;
  images?: string[];
}

export interface UpdateListingData {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  images?: string[];
  status?: 'active' | 'sold' | 'expired';
}

export interface ListingFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  status?: 'active' | 'sold' | 'expired';
}

export interface ListingSortOptions {
  field: 'created_at' | 'price' | 'title';
  direction: 'asc' | 'desc';
}

// Mobile-specific types (adapted from web File API)
export interface MobileImageAsset {
  uri: string;
  type?: string;
  name?: string;
  size?: number;
}

// Form state for AddListingPage - Mobile adapted
export interface ListingFormData {
  title: string;
  description: string;
  price: string;
  location: string;
  images: MobileImageAsset[]; // Changed from File[] to mobile-friendly type
  imageUrls: string[]; // For preview
}

export interface ListingFormErrors {
  title?: string;
  description?: string;
  price?: string;
  location?: string;
  images?: string;
  general?: string;
}