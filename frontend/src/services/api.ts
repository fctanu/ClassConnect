import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

const SESSION_FLAG_KEY = 'hasSession';

// attach access token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// response interceptor to handle 401 and try refresh once
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const isAuthPath =
      originalRequest?.url?.includes('/api/auth/login') ||
      originalRequest?.url?.includes('/api/auth/register') ||
      originalRequest?.url?.includes('/api/auth/refresh');

    if (
      originalRequest &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthPath
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = res.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        localStorage.setItem(SESSION_FLAG_KEY, 'true');
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        // failed to refresh
        localStorage.removeItem('accessToken');
        localStorage.removeItem(SESSION_FLAG_KEY);
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);

// Posts
export const getPosts = () => api.get('/api/posts');
export const getPost = (id: string) => api.get(`/api/posts/${id}`);
export const createPost = (
  data: FormData | { title: string; description?: string; images?: string[] }
) =>
  api.post('/api/posts', data, data instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined);
export const updatePost = (id: string, data: { title?: string; description?: string; images?: string[] }) =>
  api.put(`/api/posts/${id}`, data);
export const deletePost = (id: string) => api.delete(`/api/posts/${id}`);
export const toggleLike = (id: string) => api.post(`/api/posts/${id}/like`);

export default api;
