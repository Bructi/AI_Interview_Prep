/**
 * Resolve a relative backend asset URL (e.g. /uploads/avatar.jpg) to an absolute URL.
 * Falls back to the current origin when VITE_API_URL is not set (local dev).
 */
export const getAssetUrl = (path) => {
  if (!path) return path;
  // Already absolute
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = import.meta.env.VITE_API_URL || window.location.origin;
  return `${base.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
};
