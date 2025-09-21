// utils/index.ts - Re-export all utility functions from lib for consistency
// This provides a unified import path while using the enhanced lib functions

// Re-export all utility functions from the new lib files
export {
  cn,
  capitalize,
  formatDate,
  formatTime,
  formatCurrency,
  truncateText,
  generateId,
  isValidEmail,
  sleep,
  debounce,
  throttle,
  safeJsonParse,
  isMobile,
  getPlatform
} from '../lib/utils';

export {
  normalizeAvatarUrl,
  getAvailableAvatars,
  isValidAvatarUrl,
  getFallbackAvatarUrl,
  generateAvatarFromName,
  formatProfilePictureUrl
} from '../lib/avatarUtils';

export {
  requestImagePermissions,
  pickImage,
  compressImage,
  generateResponsiveSizes,
  validateImageFile,
  createThumbnail,
  validateImageDimensions,
  formatFileSize,
  getOptimizedImageUri,
  uriToBlob,
  isCameraAvailable
} from '../lib/imageUtils';

export {
  checkBucketExists,
  uploadImage,
  deleteImage,
  getImageUrl,
  validateImageFile as validateStorageImageFile,
  testStorageConnection,
  cacheImageLocally,
  clearCachedImages
} from '../lib/storage';

export {
  authAPI,
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  apiUpload
} from '../lib/api';

export {
  getMobilePlatformInfo,
  debugDatabaseConnection,
  debugUserProfile,
  debugTableExists,
  debugRLSPolicies,
  debugStorageAccess,
  debugNetworkConnectivity,
  generateMobileDebugReport,
  logMobileError,
  MobilePerformanceTimer
} from '../lib/debug';

// Additional legacy utility functions for backwards compatibility

export const formatRelativeTime = (date: string | Date) => {
  // Basic implementation - enhanced version
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
};

export const isValidPassword = (password: string) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Error handling
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};