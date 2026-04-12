import axios, {InternalAxiosRequestConfig} from 'axios';
import {API_CONFIG} from './apiConfig';

const apiClient = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    /**
     * ENVIRONMENT ROUTING
     * In DEV: bypass the gateway, send request to specific microservice ports.
     * In PROD: send request to the single API Gateway.
     */
    if (__DEV__) {
      const url = config.url || '';
      
      // Route to correct microservice based on endpoint prefix
      if (url.startsWith('/hotel')) {
        config.baseURL = API_CONFIG.DEV_SERVICES.hotel;
      } else if (url.startsWith('/bus')) {
        config.baseURL = API_CONFIG.DEV_SERVICES.bus;
      } else if (url.startsWith('/tour')) {
        config.baseURL = API_CONFIG.DEV_SERVICES.tour;
      } else {
        // Unmatched fallback
        config.baseURL = 'http://10.0.2.2:5000';
      }
    } else {
      // Production Gateway Routing
      config.baseURL = API_CONFIG.PRODUCTION_GATEWAY_URL;
    }

    // TODO: Add Token Injection here when backend Auth is ready
    // const token = await getAuthToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Return data directly so services don't have to call response.data
    return response.data;
  },
  (error) => {
    // Handle global API errors here (e.g. 401 Unauthorized -> redirect to login)
    return Promise.reject(error);
  }
);

export default apiClient;
