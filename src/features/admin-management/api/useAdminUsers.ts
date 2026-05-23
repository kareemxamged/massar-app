import { useState, useEffect, useCallback } from 'react';
import { adminApi, type UserFilters } from './adminApi';
import type { UserProfile } from '../../../types';
import { useToast } from '../../../components/Toast/Toast';

export function useAdminUsers(initialFilters: UserFilters = {}) {
  const { showToast, ToastComponent } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(filters);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateFilter = useCallback((key: keyof UserFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const suspendUser = useCallback(async (userId: string) => {
    try {
      await adminApi.updateUserStatus(userId, 'suspended');
      await fetchUsers();
      showToast('User suspended successfully', 'success');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to suspend user';
      showToast(`Error: ${errorMsg}`, 'error');
      console.error('Suspend failed:', err);
      throw err;
    }
  }, [fetchUsers, showToast]);

  const activateUser = useCallback(async (userId: string) => {
    try {
      await adminApi.updateUserStatus(userId, 'active');
      await fetchUsers();
      showToast('User activated successfully', 'success');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to activate user';
      showToast(`Error: ${errorMsg}`, 'error');
      console.error('Activate failed:', err);
      throw err;
    }
  }, [fetchUsers, showToast]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await adminApi.deleteUser(userId);
      await fetchUsers();
      showToast('User deleted successfully', 'success');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete user';
      showToast(`Error: ${errorMsg}`, 'error');
      console.error('Delete failed:', err);
      throw err;
    }
  }, [fetchUsers, showToast]);

  return {
    users,
    loading,
    error,
    filters,
    updateFilter,
    refresh: fetchUsers,
    suspendUser,
    activateUser,
    deleteUser,
    ToastComponent,
  };
}
