// lib/avatarUtils.ts - Mobile-native avatar utility functions

/**
 * Ensures avatar URLs are properly formatted for mobile app use
 * Handles both old paths with spaces and new paths without spaces
 * Converts web paths to mobile asset paths or external URLs
 */
export function normalizeAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) {
    // Return a placeholder URL for mobile - could be a local asset or remote URL
    return "https://via.placeholder.com/150x150/44C76F/004D40?text=U";
  }

  // If it's already an external URL (http/https), return as is
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }

  // If it's a placeholder.svg reference, convert to mobile placeholder
  if (avatarUrl.includes('placeholder.svg')) {
    return "https://via.placeholder.com/150x150/44C76F/004D40?text=U";
  }

  // Convert web asset paths to mobile-compatible external URLs
  // In React Native, we typically use external URLs or require() for local assets
  if (avatarUrl.includes('/Avatars/Avatar') || avatarUrl.includes('/avatars/Avatar')) {
    // Extract avatar number from various formats
    let avatarNumber = 1;
    const match = avatarUrl.match(/Avatar\s*%?20\s*(\d+)/i) || avatarUrl.match(/Avatar(\d+)/i);
    if (match) {
      avatarNumber = parseInt(match[1]);
    }

    // Return a placeholder URL with the avatar number embedded
    // In a real app, you'd host these avatar images and use their URLs
    return `https://via.placeholder.com/150x150/44C76F/004D40?text=A${avatarNumber}`;
  }

  // If it's some other path format, try to make it work as external URL
  if (avatarUrl.startsWith('/')) {
    // Convert relative paths to placeholder for mobile
    return "https://via.placeholder.com/150x150/44C76F/004D40?text=U";
  }

  return avatarUrl;
}

/**
 * Generates the list of available avatar URLs for mobile app
 * Returns external placeholder URLs instead of local paths
 */
export function getAvailableAvatars(): string[] {
  return Array.from({ length: 16 }, (_, i) =>
    `https://via.placeholder.com/150x150/44C76F/004D40?text=A${i + 1}`
  );
}

/**
 * Validates if an avatar URL is accessible for mobile
 * Checks if it's a valid external URL or known placeholder
 */
export function isValidAvatarUrl(url: string): boolean {
  if (!url) return false;

  // Accept any http/https URL
  if (url.startsWith('http')) {
    return true;
  }

  // Accept our known placeholder patterns
  if (url.includes('placeholder') || url.includes('via.placeholder.com')) {
    return true;
  }

  const availableAvatars = getAvailableAvatars();
  const normalizedUrl = normalizeAvatarUrl(url);
  return availableAvatars.includes(normalizedUrl);
}

/**
 * Gets a fallback avatar URL for mobile
 */
export function getFallbackAvatarUrl(): string {
  return "https://via.placeholder.com/150x150/44C76F/004D40?text=U";
}

/**
 * Generates an avatar URL based on user's name initial
 * Useful for creating personalized placeholders
 */
export function generateAvatarFromName(name: string): string {
  const initial = name?.charAt(0)?.toUpperCase() || 'U';
  return `https://via.placeholder.com/150x150/44C76F/004D40?text=${initial}`;
}

/**
 * Validates and formats profile picture URLs for mobile display
 * Ensures images will load properly in React Native Image components
 */
export function formatProfilePictureUrl(url: string | null | undefined, userName?: string): string {
  if (!url) {
    return userName ? generateAvatarFromName(userName) : getFallbackAvatarUrl();
  }

  // If it's already a valid external URL, use it
  if (url.startsWith('http')) {
    return url;
  }

  // Convert any local/relative paths to normalized URLs
  return normalizeAvatarUrl(url);
}