import {useMutation, useQueryClient} from '@tanstack/react-query';
import {profileService, UpdateProfileRequest} from '../../../core/api/services/profileService';
import {PROFILE_QUERY_KEY} from './useProfile';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileService.updateMe(data),
    onSuccess: (updatedProfile) => {
      // Update cache with the new profile data
      queryClient.setQueryData(PROFILE_QUERY_KEY, updatedProfile);
      
      // Also invalidate to ensure we get the latest data if there are server-side changes
      queryClient.invalidateQueries({queryKey: PROFILE_QUERY_KEY});
    },
  });
};
