import apiClient from '../apiClient';

export interface TourSearchParams {
  destinationCityId?: string;
  startDate?: string;
  endDate?: string;
}

export const tourService = {
  /**
   * Search for tour packages
   * DEV URL: POST http://10.0.2.2:5003/tour/search
   * PROD URL: POST https://api.easysy.com/v1/tour/search
   */
  searchTours: async (params: TourSearchParams) => {
    return apiClient.post('/tour/search', params);
  },

  /**
   * Get specific tour details (itinerary, pricing)
   * DEV URL: GET http://10.0.2.2:5003/tour/{id}
   */
  getTourDetails: async (tourId: string) => {
    return apiClient.get(`/tour/${tourId}`);
  }
};
