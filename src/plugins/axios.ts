import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipLoading?: boolean;
  }
}

const axiosCreateConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 600000, // Timeout after 10 minute (600 seconds)
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
};
const axiosRequestInterceptor = () => {
  const onFulfilled = (config: AxiosRequestConfig) => {
    try {
      // Không gửi Authorization cho các endpoint public
      const isPublicEndpoint = config.url?.includes('/users/login') || config.url?.includes('/users/register');
      if (isPublicEndpoint) {
        return config;
      }

      const skipAuthEndpoints = [
        // Public read-only APIs (GET only)
        '/wards',
        '/wards/stats',
        '/wards/risk/',
        '/wards/name/',
        '/administrative-units',
        '/risk-assessments',
        '/map/flood-risk',
        '/flood-indicators',
        '/indicator-values',
        '/settings',
        '/weather',
        '/weather/latest',
        '/weather/ward/',
        '/weather/stats/',
        '/drainage',
        '/risk',
        '/road-bridge',
      ];

      const isGetRequest = config.method?.toLowerCase() === 'get';
      const shouldSkipAuth = isGetRequest && skipAuthEndpoints.some((endpoint) => config.url?.includes(endpoint));

      if (!shouldSkipAuth) {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (ex) {
      console.log(ex);
    }

    return config;
  };
  const onRejected = (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  };
  return { onFulfilled, onRejected };
};

const axiosResponseInterceptor = () => {
  const onFulfilled = async (response: AxiosResponse): Promise<AxiosResponse> => {
    return response;
  };

  const onRejected = async (error: AxiosError): Promise<never> => {
    const isLoginRequest = error.config?.url?.includes('/users/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      // Token expired/invalid - clear auth, không redirect khi đang gọi login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Return error with response data for better error handling
    const errorWithData = error.response?.data || { error: error.message || 'Network error' };
    return Promise.reject({ ...error, response: { ...error.response, data: errorWithData } });
  };

  return { onFulfilled, onRejected };
};

const instance = axios.create(axiosCreateConfig);
// Interceptors
instance.interceptors.request.use(
  axiosRequestInterceptor().onFulfilled,
  axiosRequestInterceptor().onRejected
);

instance.interceptors.response.use(
  axiosResponseInterceptor().onFulfilled,
  axiosResponseInterceptor().onRejected
);

export const api = instance;

export default {
  api,
  instance,
  axiosCreateConfig,
  axiosRequestInterceptor,
  axiosResponseInterceptor,
};
