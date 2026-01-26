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
      // Skip adding auth header for public endpoints (only GET requests)
      const skipAuthEndpoints = [
        '/users/login',
        '/users/register',
        // Public read-only APIs for role user (GET only)
        '/wards',
        '/wards/stats',
        '/wards/risk/',
        '/wards/name/',
        '/weather',
        '/weather/latest',
        '/weather/ward/',
        '/weather/stats/',
        '/drainage',
        '/risk',
        '/road-bridge',
      ];

      // Only skip auth for GET requests to public endpoints
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
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');

      // Redirect to login if not already there
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
