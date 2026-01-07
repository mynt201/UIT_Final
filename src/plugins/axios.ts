import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipLoading?: boolean;
  }
}

const axiosCreateConfig = {
  baseURL: import.meta.env.VITE_BE_SNET,
  timeout: 600000, // Timeout after 10 minute (600 seconds)
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
};
const axiosRequestInterceptor = () => {
  const onFulfilled = (config: AxiosRequestConfig) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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
    // if (process.env.NODE_ENV === "development") await sleep(100);
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
    return Promise.reject(error);
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
