import { getSupabaseClient, getServiceClient } from '../../../services/supabase';
import type { UserProfile, Major, AcademicLevel } from '../../../types';

// Use singleton clients - no duplicate instances
const anonClient = getSupabaseClient();
const serviceClient = getServiceClient();

export interface UserFilters {
  role?: 'student' | 'teacher';
  status?: 'active' | 'suspended';
  search?: string;
}

export const adminApi = {
  async getUsers(filters: UserFilters = {}) {
    let query = anonClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.role) query = query.eq('role', filters.role);
    if (filters.status) query = query.eq('status', filters.status);

    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,student_id.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as UserProfile[];
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended') {
    const { error } = await serviceClient
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  },

  async deleteUser(userId: string) {
    const { error } = await serviceClient
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (error) throw error;
  },

  // ⚠️ IMPORTANT: Do NOT manually insert into profiles table!
  // Profile creation is handled by database triggers from auth.users
  // If you need to create a user, use supabase.auth.admin.createUser() instead
  async createUser(_userData: Partial<UserProfile>) {
    // This method should NOT be used for creating new users
    // Users should be created via auth.users which triggers profile creation
    throw new Error('User creation is handled by auth.users. Do not manually insert into profiles table.');
  },

  async updateUser(userId: string, userData: Partial<UserProfile>) {
    const { data, error } = await serviceClient
      .from('profiles')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMajors() {
    const { data, error } = await anonClient
      .from('majors')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as Major[];
  },

  async getAcademicLevels() {
    const { data, error } = await anonClient
      .from('academic_levels')
      .select('*')
      .order('display_order');
    if (error) throw error;
    return data as AcademicLevel[];
  }
};
