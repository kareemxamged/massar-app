// ============================================================
// USE ADMIN USERS HOOK
// Bounded Context: User Management (Core)
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from './adminApi';
import type { AdminUser, AdminUserFilters, AdminUserPagination } from '../types';

const ADMIN_USERS_KEY = ['admin_users'] as const;

export interface AdminToastState {
  message: string;
  type: 'success' | 'error';
}

export function useAdminUsers(initialFilters: AdminUserFilters = {}) {
  const [filters, setFilters] = useState<AdminUserFilters>(initialFilters);
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const updateFilter = useCallback((key: keyof AdminUserFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  }, []);

  const { data, isLoading, error, refetch } = useQuery<AdminUserPagination, Error>({
    queryKey: [...ADMIN_USERS_KEY, filters],
    queryFn: () => adminApi.getUsers(filters),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
  }, [queryClient]);

  const suspendUser = useCallback(async (userId: string) => {
    try {
      await adminApi.updateUserStatus(userId, 'suspended');
      showToast('Account suspended successfully.', 'success');
      invalidate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to suspend account.', 'error');
      throw err;
    }
  }, [showToast, invalidate]);

  const activateUser = useCallback(async (userId: string) => {
    try {
      await adminApi.updateUserStatus(userId, 'active');
      showToast('Account activated successfully.', 'success');
      invalidate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to activate account.', 'error');
      throw err;
    }
  }, [showToast, invalidate]);

  const deleteUser = useCallback(async (userId: string) => {
    const { getSupabaseClient } = await import('../../../services/supabase');
    const { data: { session } } = await getSupabaseClient().auth.getSession();
    const currentUserId = session?.user?.id ?? '';
    try {
      await adminApi.deleteUser(userId, currentUserId);
      showToast('Account deleted successfully.', 'success');
      invalidate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete account.', 'error');
      throw err;
    }
  }, [showToast, invalidate]);

  return {
    users: data?.data || [],
    loading: isLoading,
    error,
    filters,
    updateFilter,
    refresh: refetch,
    suspendUser,
    activateUser,
    deleteUser,
    toast,
    clearToast: () => setToast(null),
    // Legacy compat: null so existing destructure `ToastComponent` still works
    ToastComponent: null as null,
  };
}

export function useAdminUserCount() {
  return useQuery<Record<string, number>, Error>({
    queryKey: [...ADMIN_USERS_KEY, 'counts'],
    queryFn: () => adminApi.getActiveUsersCountByRole(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useAdminUser(userId: string) {
  return useQuery<AdminUser | null, Error>({
    queryKey: [...ADMIN_USERS_KEY, 'by_id', userId],
    queryFn: () => adminApi.getUserById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export function useAdminUsersByRole(role: 'teacher' | 'student') {
  return useQuery<AdminUser[], Error>({
    queryKey: [...ADMIN_USERS_KEY, 'by_role', role],
    queryFn: () => adminApi.getUsersByRole(role),
    enabled: !!role,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
