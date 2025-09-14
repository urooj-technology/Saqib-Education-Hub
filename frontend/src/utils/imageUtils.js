/**
 * Utility functions for handling image URLs consistently across the application
 */

/**
 * Extract filename from full file path
 * @param {string} fullPath - Full file path (Windows or Unix)
 * @returns {string|null} - Filename or null if invalid
 */
export const getImageFilename = (fullPath) => {
  if (!fullPath) return null;
  // Handle both Windows and Unix path separators
  const pathParts = fullPath.split(/[\\\/]/);
  return pathParts[pathParts.length - 1];
};

/**
 * Get full image URL for backend images
 * @param {string} imagePath - Full image path from backend
 * @param {string} imageType - Type of image (images, documents, etc.)
 * @returns {string|null} - Full URL or null if invalid
 */
export const getImageUrl = (imagePath, imageType = 'images') => {
  if (!imagePath) return null;
  
  const filename = getImageFilename(imagePath);
  if (!filename) return null;
  
  // Use the backend uploads route to serve images (NOT /api/uploads/)
  // Images are served directly from /uploads, not through /api
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
  // Ensure we don't have /api in the base URL for images
  const cleanBaseUrl = baseUrl.replace('/api', '');
  
  return `${cleanBaseUrl}/uploads/${imageType}/${filename}`;
};

/**
 * Get book cover image URL
 * @param {string} coverImage - Cover image path
 * @returns {string|null} - Cover image URL
 */
export const getBookCoverUrl = (coverImage) => {
  return getImageUrl(coverImage, 'images');
};

/**
 * Get author profile image URL
 * @param {string} profileImage - Profile image path
 * @returns {string|null} - Profile image URL
 */
export const getAuthorProfileUrl = (profileImage) => {
  return getImageUrl(profileImage, 'images');
};

/**
 * Get user avatar URL
 * @param {string} avatar - Avatar image path
 * @returns {string|null} - Avatar image URL
 */
export const getUserAvatarUrl = (avatar) => {
  return getImageUrl(avatar, 'images');
};

/**
 * Get document image URL
 * @param {string} documentImage - Document image path
 * @returns {string|null} - Document image URL
 */
export const getDocumentImageUrl = (documentImage) => {
  return getImageUrl(documentImage, 'documents');
};
