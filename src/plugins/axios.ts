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
      //   if (commonStore.getToken() && config.headers) {
      //     config.headers.Authorization = `Bearer ${commonStore.token}`;
      //     config.headers.set('Accept-Language', 'ja-JP');
      //   }
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

export default {
  instance,
  axiosCreateConfig,
  axiosRequestInterceptor,
  axiosResponseInterceptor,
};
