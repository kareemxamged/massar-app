// ============================================================
// USE USER ACTIONS HOOK
// Bounded Context: User Management (Core)
// ============================================================

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { adminApi } from './adminApi';
import type { UpdateUserProfileInput, UpdateUserStatusInput } from '../types';
import { getSupabaseClient } from '../../../services/supabase';

const ADMIN_USERS_KEY = ['admin_users'] as const;

export function useUserActions() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  // Get current user ID
  const { data: currentUser } = useQuery({
    queryKey: ['current_user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    },
    staleTime: Infinity,
    retry: false,
  });

  /**
   * Update user status mutation
   */
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: UpdateUserStatusInput['status'] }) => {
      await adminApi.updateUserStatus(userId, status);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch user list
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
      queryClient.invalidateQueries({ queryKey: [...ADMIN_USERS_KEY, 'by_id', variables.userId] });
    },
    onError: (error) => {
      console.error('Failed to update user status:', error);
      throw error;
    },
  });

  /**
   * Update user profile mutation
   */
  const updateUserProfileMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserProfileInput }) => {
      await adminApi.updateUserProfile(userId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch user list
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
      queryClient.invalidateQueries({ queryKey: [...ADMIN_USERS_KEY, 'by_id', variables.userId] });
    },
    onError: (error) => {
      console.error('Failed to update user profile:', error);
      throw error;
    },
  });

  /**
   * Delete user mutation
   * Includes guard to prevent deleting current logged-in admin
   */
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Guard: Prevent deleting current logged-in admin
      if (!currentUser) {
        throw new Error('Current user not found. Please refresh the page.');
      }
      
      if (userId === currentUser) {
        throw new Error('Cannot delete your own account. Please contact system administrator.');
      }

      await adminApi.deleteUser(userId, currentUser);
    },
    onSuccess: (_, deletedUserId) => {
      // Invalidate and refetch user list
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
      queryClient.invalidateQueries({ queryKey: [...ADMIN_USERS_KEY, 'by_id', deletedUserId] });
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
      throw error;
    },
  });

  return {
    updateUserStatus: updateUserStatusMutation.mutate,
    updateUserStatusIsPending: updateUserStatusMutation.isPending,
    updateUserStatusIsError: updateUserStatusMutation.isError,
    updateUserStatusError: updateUserStatusMutation.error,

    updateUserProfile: updateUserProfileMutation.mutate,
    updateUserProfileIsPending: updateUserProfileMutation.isPending,
    updateUserProfileIsError: updateUserProfileMutation.isError,
    updateUserProfileError: updateUserProfileMutation.error,

    deleteUser: deleteUserMutation.mutate,
    deleteUserIsPending: deleteUserMutation.isPending,
    deleteUserIsError: deleteUserMutation.isError,
    deleteUserError: deleteUserMutation.error,
  };
}
