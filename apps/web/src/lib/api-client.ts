import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle token refresh and unwrap data
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap the global NestJS TransformInterceptor response
    if (response.data && response.data.success && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        // Store new tokens
        localStorage.setItem('accessToken', data.data?.accessToken || data.accessToken);
        localStorage.setItem('refreshToken', data.data?.refreshToken || data.refreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.data?.accessToken || data.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
