import { supabase, getServiceClient } from './supabase';
import { UserProfile } from '../types';

async function _writeAuditLog(
  userId: string,
  action: 'login' | 'logout',
): Promise<void> {
  try {
    await getServiceClient()
      .from('audit_logs')
      .insert({
        admin_id:        userId,
        action_type:     action,
        entity_affected: 'auth',
        entity_id:       userId,
      } as Record<string, unknown>);
  } catch {
    // Never block auth flow on logging failure
  }
}

// Merges role-specific sub-table rows onto the flat UserProfile shape.
export function flattenProfile(raw: any): UserProfile {
    const { student_profiles: spRaw, teacher_profiles: tpRaw, ...base } = raw;
    // Supabase may return one-to-one JOINs as arrays — normalise to single object
    const sp = Array.isArray(spRaw) ? spRaw[0] : spRaw;
    const tp = Array.isArray(tpRaw) ? tpRaw[0] : tpRaw;
    const profile: UserProfile = base as UserProfile;
    if (sp) {
        profile.student_id    = sp.student_code   ?? undefined;
        profile.major_id      = sp.major_id        ?? undefined;
        profile.level_id      = sp.level_id        ?? undefined;
        profile.gpa           = sp.gpa             ?? undefined;
        profile.major         = sp.majors?.name    ?? undefined;
        profile.level         = sp.academic_levels?.name ?? undefined;
    }
    if (tp) {
        profile.employee_id   = tp.employee_code   ?? undefined;
        profile.department    = tp.department      ?? undefined;
        profile.specialization = tp.specialization ?? undefined;
        profile.headline      = tp.headline        ?? undefined;
        profile.bio           = tp.bio             ?? undefined;
        profile.academic_degree = tp.academic_degree ?? undefined;
        profile.years_experience = tp.years_experience ?? undefined;
    }
    return profile;
}

export const authService = {
    // Sign Up (Register) with Metadata
    async signUp(email: string, password: string, fullName: string, metadata: any = {}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    ...metadata,
                },
            },
        });
        if (error) throw error;
        return data;
    },

    // Sign In (Login)
    async signIn(email: string, password: string) {
        console.log('authService: signIn called for', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error('authService: signIn failed', error);
            throw error;
        }
        console.log('authService: signIn successful', data);
        if (data.user?.id) void _writeAuditLog(data.user.id, 'login');
        return data;
    },

    // Sign Out
    async signOut() {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        if (user?.id) void _writeAuditLog(user.id, 'logout');
    },


    // Reset Password Email
    async resetPassword(email: string) {
        // Automatically redirects to /reset-password
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    },

    // Update Password (logged in)
    async updatePassword(password: string) {
        console.log('authService: updatePassword called');

        // Create a promise for the update
        const updatePromise = supabase.auth.updateUser({ password });

        // Create a timeout promise (10 seconds)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out. Please check your connection.')), 10000);
        });

        // Race them
        try {
            const result: any = await Promise.race([updatePromise, timeoutPromise]);
            const { data, error } = result;

            if (error) {
                console.error('authService: Update failed', error);
                throw error;
            }

            console.log('authService: Update successful', data);
            return data;
        } catch (err) {
            console.error('authService: Exception in updatePassword', err);
            throw err;
        }
    },

    // Get Current User Profile (with Role)
    async getCurrentProfile(): Promise<UserProfile | null> {
        // Create the fetch promise
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // Fetch profile with role-specific sub-tables (split-table model)
            const { data: profile, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    student_profiles (
                        student_code, major_id, level_id, gpa,
                        majors ( name ),
                        academic_levels ( name )
                    ),
                    teacher_profiles (
                        employee_code, department, specialization,
                        headline, bio, academic_degree, years_experience
                    )
                `)
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return flattenProfile(profile);
        };

        // Create timeout promise (3 seconds) - reduced from 15s to avoid login hang
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timed out')), 3000)
        );

        try {
            // Race them
            return await Promise.race([fetchProfile(), timeoutPromise]) as UserProfile | null;
        } catch (error) {
            console.error('authService: getCurrentProfile failed or timed out', error);
            throw error; // Let the caller decide or fallback
        }
    }
};
