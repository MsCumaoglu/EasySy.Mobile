import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://api.easysy.com/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  config => {
    return config;
  },
  error => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  },
);
