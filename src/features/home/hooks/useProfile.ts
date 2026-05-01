import {useQuery} from '@tanstack/react-query';
import {profileService} from '../../../core/api/services/profileService';

export const PROFILE_QUERY_KEY = ['userProfile'];

export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => profileService.getMe(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
