import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

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
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        // failed to refresh
        localStorage.removeItem('accessToken');
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);

// Projects
export const getProjects = () => api.get('/api/projects');
export const createProject = (data: { name: string; description?: string; color?: string }) =>
  api.post('/api/projects', data);
export const updateProject = (id: string, data: { name?: string; description?: string; color?: string }) =>
  api.put(`/api/projects/${id}`, data);
export const deleteProject = (id: string) => api.delete(`/api/projects/${id}`);

// Enhanced Task endpoints
export const searchTasks = (query: string) =>
  api.get(`/api/tasks?search=${encodeURIComponent(query)}`);
export const filterTasksByCategory = (category: string) =>
  api.get(`/api/tasks?category=${encodeURIComponent(category)}`);
export const filterTasksByPriority = (priority: string) =>
  api.get(`/api/tasks?priority=${priority}`);

export default api;
