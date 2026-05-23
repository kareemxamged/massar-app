// ============================================================
// ADMIN API LAYER
// Bounded Context: User Management (Core)
// ============================================================

import { getSupabaseClient, getServiceClient } from '../../../services/supabase';
import { auditApi } from '../../admin-security/api/auditApi';
import type { AdminUser, AdminUserFilters, AdminUserPagination, UpdateUserProfileInput, UserRole, UserStatus, CreateUserInput } from '../types';

// Use singleton clients - no duplicate instances
const anonClient = getSupabaseClient();
const serviceClient = getServiceClient();

async function currentAdminId(): Promise<string | null> {
  const { data } = await anonClient.auth.getUser();
  return data.user?.id ?? null;
}

export const adminApi = {
  /**
   * Fetch users with server-side filtering and pagination
   */
  async getUsers(filters: AdminUserFilters = {}): Promise<AdminUserPagination> {
    const {
      role,
      status,
      search,
      major,
      level,
      page = 1,
      limit = 10
    } = filters;

    let query = anonClient
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (major) {
      query = query.eq('major', major);
    }

    if (level) {
      query = query.eq('level', level);
    }

    // Search filter (full_name, email, student_id)
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,student_id.ilike.%${search}%`
      );
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    const users = data as AdminUser[];

    return {
      data: users,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  /**
   * Update user status (Active/Suspended)
   * Requires service-role for security
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    // 1. Update profiles table
    const { error } = await serviceClient
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }

    // 2. Mirror to Supabase Auth so the JWT is blocked at the auth layer.
    //    ban_duration='876000h' (~100 years) = effectively permanent ban.
    //    ban_duration='none' lifts the ban immediately.
    const banDuration = status === 'suspended' ? '876000h' : 'none';
    await serviceClient.auth.admin.updateUserById(userId, { ban_duration: banDuration });

    void currentAdminId().then(adminId =>
      auditApi.logAction(
        adminId, status === 'suspended' ? 'suspend_user' : 'update_user',
        'profiles', userId, null, { status },
      )
    );
  },

  /**
   * Update user profile information
   * Requires service-role for security
   */
  async updateUserProfile(userId: string, data: UpdateUserProfileInput): Promise<AdminUser> {
    const { error } = await serviceClient
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    void currentAdminId().then(adminId =>
      auditApi.logAction(
        adminId, 'update_user', 'profiles', userId,
        null, data as Record<string, unknown>,
      )
    );

    return data as AdminUser;
  },

  /**
   * Delete user
   * Requires service-role for security
   * Includes guard to prevent deleting current logged-in admin
   */
  async deleteUser(userId: string, currentUserId: string): Promise<void> {
    // Guard: Prevent deleting current logged-in admin
    if (userId === currentUserId) {
      throw new Error('Cannot delete your own account. Please contact system administrator.');
    }

    const { data: oldProfile } = await serviceClient
      .from('profiles')
      .select('id, email, full_name, role, status')
      .eq('id', userId)
      .maybeSingle();

    const { error } = await serviceClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    void currentAdminId().then(adminId =>
      auditApi.logAction(
        adminId, 'delete_user', 'profiles', userId,
        oldProfile as Record<string, unknown> | null, null,
      )
    );
  },

  /**
   * Get single user by ID
   */
  async getUserById(userId: string): Promise<AdminUser | null> {
    const { data, error } = await anonClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data as AdminUser;
  },

  /**
   * Get user auth metadata (for last_sign_in_at safely)
   */
  async getUserAuthInfo(userId: string): Promise<{ last_sign_in_at: string | null }> {
    try {
      const { data, error } = await serviceClient.auth.admin.getUserById(userId);
      if (error) throw error;
      return { last_sign_in_at: data?.user?.last_sign_in_at ?? null };
    } catch (error) {
      console.error('Error fetching auth info:', error);
      return { last_sign_in_at: null };
    }
  },

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'teacher' | 'student'): Promise<AdminUser[]> {
    const { data, error } = await anonClient
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users by role: ${error.message}`);
    }

    return data as AdminUser[];
  },

  /**
   * Get active users count by role
   */
  async getActiveUsersCountByRole(): Promise<Record<UserRole, number>> {
    const { data, error } = await anonClient
      .from('profiles')
      .select('role, status', { count: 'exact' })
      .eq('status', 'active');

    if (error) {
      throw new Error(`Failed to fetch active users count: ${error.message}`);
    }

    const counts: Record<UserRole, number> = {
      admin: 0,
      teacher: 0,
      student: 0,
    };

    data?.forEach((user: { role: UserRole; status: UserStatus }) => {
      if (user.status === 'active') {
        counts[user.role] = (counts[user.role] || 0) + 1;
      }
    });

    return counts;
  },

  /**
   * Upsert major_id / level_id / student_code in student_profiles
   */
  async updateStudentProfile(userId: string, data: { major_id?: number | null; level_id?: number | null, student_code?: string | null }): Promise<void> {
    const { error } = await serviceClient
      .from('student_profiles')
      .upsert({ id: userId, ...data, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to update student profile: ${error.message}`);
    }
  },

  /**
   * Upsert teacher_profiles fields for consistency
   */
  async updateTeacherProfile(userId: string, data: { department?: string | null; specialization?: string | null; headline?: string | null; bio?: string | null; academic_degree?: string | null; years_experience?: number | null }): Promise<void> {
    const { error } = await serviceClient
      .from('teacher_profiles')
      .upsert({ id: userId, ...data, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to update teacher profile: ${error.message}`);
    }
  },

  /**
   * Get all majors
   */
  async getMajors(): Promise<any[]> {
    const { data, error } = await anonClient
      .from('majors')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch majors: ${error.message}`);
    }

    return data as any[];
  },

  /**
   * Get all academic levels
   */
  async getAcademicLevels(): Promise<any[]> {
    const { data, error } = await anonClient
      .from('academic_levels')
      .select('*')
      .order('display_order');

    if (error) {
      throw new Error(`Failed to fetch academic levels: ${error.message}`);
    }

    return data as any[];
  },

  async createUser(input: CreateUserInput): Promise<AdminUser> {
    const { data, error } = await serviceClient.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.full_name,
        role: input.role,
      },
    });

    if (error) throw new Error(`Failed to create user: ${error.message}`);

    await anonClient.from('profiles').update({
      full_name: input.full_name,
      role: input.role,
      mobile: input.mobile ?? null,
      date_of_birth: input.date_of_birth ?? null,
      major: input.major ?? null,
      level: input.level ?? null,
      specialization: input.specialization ?? null,
      department: input.department ?? null,
      headline: input.headline ?? null,
      bio: input.bio ?? null,
      academic_degree: input.academic_degree ?? null,
      years_of_experience: input.years_of_experience ?? null,
    }).eq('id', data.user.id);

    if (input.role === 'student') {
      await adminApi.updateStudentProfile(data.user.id, {
        student_code: input.student_code ?? null,
      });
    } else if (input.role === 'teacher') {
      await adminApi.updateTeacherProfile(data.user.id, {
        department: input.department ?? null,
        specialization: input.specialization ?? null,
        headline: input.headline ?? null,
        bio: input.bio ?? null,
        academic_degree: input.academic_degree ?? null,
        years_experience: input.years_of_experience ?? null,
      });
    }

    const newUser: AdminUser = {
      id: data.user.id,
      email: input.email,
      full_name: input.full_name,
      role: input.role,
      status: 'active' as UserStatus,
      mobile: input.mobile ?? null,
      date_of_birth: input.date_of_birth ?? null,
      two_factor_enabled: false,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at ?? data.user.created_at,
    };

    void currentAdminId().then(adminId =>
      auditApi.logAction(
        adminId, 'create_user', 'profiles', newUser.id,
        null, { id: newUser.id, email: newUser.email, full_name: newUser.full_name, role: newUser.role },
      )
    );

    return newUser;
  },
};
