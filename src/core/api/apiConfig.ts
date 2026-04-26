export const API_CONFIG = {
  // Global timeouts
  TIMEOUT: 15000,
  
  // Production
  // The API Gateway unifies all services under one domain.
  PRODUCTION_GATEWAY_URL: 'https://easysy-gateway-966zw79x.ew.gateway.dev',
  
  // Development
  // Using 10.0.2.2 so Android Emulator can reach host machine's localhost
  DEV_SERVICES: {
    hotel: 'https://easysy-gateway-966zw79x.ew.gateway.dev',
    bus: 'https://easysy-gateway-966zw79x.ew.gateway.dev',
    tour: 'https://easysy-gateway-966zw79x.ew.gateway.dev',
  }
};
