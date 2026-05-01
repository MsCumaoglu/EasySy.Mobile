import apiClient from '../apiClient';
import {ENDPOINTS} from '../endpoints';

export interface ProfileResponse {
  id: string;
  firebaseUid: string;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  email: string | null;
  preferredLang: string;
  preferredCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
  phone?: string;
  preferredLang?: string;
  preferredCurrency?: string;
}

export const profileService = {
  getMe: async (): Promise<ProfileResponse> => {
    return apiClient.get(ENDPOINTS.PROFILE.ME);
  },

  updateMe: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    return apiClient.put(ENDPOINTS.PROFILE.ME, data);
  },
};
