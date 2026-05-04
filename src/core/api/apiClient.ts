import axios, {InternalAxiosRequestConfig} from 'axios';
import auth from '@react-native-firebase/auth';
import {API_CONFIG} from './apiConfig';
import i18n from '../../localization/i18n';

const apiClient = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null, // Spring Boot expects `amenities=wifi&amenities=pool` not `amenities[]=wifi`
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    /**
     * LANGUAGE HEADER
     * Sends the user's selected language so the backend returns localized data.
     */
    config.headers['Accept-Language'] = i18n.language;

    /**
     * ENVIRONMENT ROUTING
     * In DEV: bypass the gateway, send request to specific microservice ports.
     * In PROD: send request to the single API Gateway.
     */
    if (__DEV__) {
      const url = config.url || '';
      
      // Route to correct microservice based on endpoint prefix
      if (url.startsWith('/api/v1/profiles')) {
        config.baseURL = API_CONFIG.DEV_SERVICES.profile;
      } else if (url.startsWith('/api/v1/hotels') || url.startsWith('/api/v1/translations')) {
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

    // Token Injection
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true); // Force refresh for latest claims
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.warn('Failed to get auth token', e);
    }

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
