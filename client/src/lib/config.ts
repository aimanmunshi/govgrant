const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Strip any trailing slash so callers can safely append paths without
// accidentally producing a double slash (which Express won't route)
export const API_URL = rawApiUrl.replace(/\/+$/, '');
export const API_BASE_URL = `${API_URL}/api`;
