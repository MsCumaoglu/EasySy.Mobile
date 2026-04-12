export const API_CONFIG = {
  // Global timeouts
  TIMEOUT: 15000,
  
  // Production
  // The API Gateway unifies all services under one domain.
  PRODUCTION_GATEWAY_URL: 'https://api.easysy.com/v1',
  
  // Development
  // Using 10.0.2.2 so Android Emulator can reach host machine's localhost
  DEV_SERVICES: {
    hotel: 'http://10.0.2.2:5001',
    bus: 'http://10.0.2.2:5002',
    tour: 'http://10.0.2.2:5003',
  }
};
