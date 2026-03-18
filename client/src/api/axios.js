import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Required for cross-origin HTTP-only cookies
});

// FIX: Removed the CSRF interceptor that existed here.
// It called /api/csrf-token before every POST/PUT/DELETE.
// csurf has been removed from the server (it's deprecated + broken cross-domain),
// so that endpoint no longer exists — the old interceptor caused every mutation to fail.

// Response interceptor — global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    const url = error.config?.url || '';
    // Don't log 401 on /auth/me — it's the startup auth check and 401 is expected when logged out
    if (error.response?.status !== 401 || !url.includes('/auth/me')) {
      console.error('API Error:', message);
    }
    return Promise.reject(error);
  }
);

export default api;
