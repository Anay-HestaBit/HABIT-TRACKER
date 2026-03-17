import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Required for HTTP-only cookies
});

// Add a request interceptor to handle CSRF
api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
    try {
      // In a real app, you might cache this token or get it from a cookie
      const { data } = await axios.get(`${api.defaults.baseURL}/csrf-token`, { withCredentials: true });
      config.headers['X-CSRF-Token'] = data.csrfToken;
    } catch (err) {
      console.error('Failed to fetch CSRF token');
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
