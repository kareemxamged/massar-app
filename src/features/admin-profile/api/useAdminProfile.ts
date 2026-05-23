import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { adminProfileApi, type AdminProfilePatch, type AdminProfileRow } from './adminProfileApi';
import { toast } from 'react-hot-toast';

interface State {
  profile: AdminProfileRow | null;
  authUser: User | null;
  avatarUrl: string | null;
  loading: boolean;
  saving: boolean;
  avatarUploading: boolean;
}

export function useAdminProfile() {
  const { user, updateLocalUser } = useAuth();
  const [state, setState] = useState<State>({
    profile: null,
    authUser: null,
    avatarUrl: null,
    loading: true,
    saving: false,
    avatarUploading: false,
  });

  const load = useCallback(async () => {
    if (!user?.id) return;
    setState(s => ({ ...s, loading: true }));
    try {
      const [profileData, { data: { user: authData } }] = await Promise.all([
        adminProfileApi.getProfile(user.id),
        supabase.auth.getUser(),
      ]);
      setState(s => ({ ...s, profile: profileData, authUser: authData, avatarUrl: profileData.avatar_url, loading: false }));
    } catch {
      toast.error('Failed to load profile');
      setState(s => ({ ...s, loading: false }));
    }
  }, [user?.id]);

  useEffect(() => { void load(); }, [load]);

  const updateInfo = async (patch: AdminProfilePatch) => {
    if (!user?.id) return;
    setState(s => ({ ...s, saving: true }));
    try {
      const updated = await adminProfileApi.updateProfile(user.id, patch);
      setState(s => ({ ...s, profile: updated, saving: false }));
      updateLocalUser({ full_name: updated.full_name ?? undefined, mobile: updated.mobile ?? undefined });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
      setState(s => ({ ...s, saving: false }));
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user?.id) return;
    const tempUrl = URL.createObjectURL(file);
    setState(s => ({ ...s, avatarUrl: tempUrl, avatarUploading: true }));
    try {
      const publicUrl = await adminProfileApi.uploadAvatar(user.id, file);
      setState(s => ({ ...s, avatarUrl: publicUrl, avatarUploading: false }));
      updateLocalUser({ avatar_url: publicUrl });
      toast.success('Avatar updated successfully');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to upload avatar';
      toast.error(message);
      setState(s => ({ ...s, avatarUrl: s.profile?.avatar_url ?? null, avatarUploading: false }));
    } finally {
      URL.revokeObjectURL(tempUrl);
    }
  };

  return { ...state, updateInfo, uploadAvatar, refetch: load };
}
