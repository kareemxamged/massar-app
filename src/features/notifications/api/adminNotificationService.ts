import { supabase } from '../../../services/supabase';
import { Notification, CreateNotificationRequest } from '../types';

export type AdminNotificationAudience = 'students' | 'teachers' | 'all';
export type AdminNotificationScope = 'individual' | 'group';

export interface AdminCreateNotificationRequest extends CreateNotificationRequest {
    audience: AdminNotificationAudience;
    notificationType?: 'info' | 'warning' | 'success';
    department?: string;
}

export const adminNotificationService = {
    /** Send a notification (admin-level: can target both students and teachers) */
    async sendAdminNotification(data: AdminCreateNotificationRequest): Promise<Notification | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                sender_id: user.id,
                target_type: data.target_type,
                target_id: data.target_id || null,
                level: data.level || null,
                major: data.major || null,
                title: data.title,
                message: data.message,
            })
            .select('*')
            .single();

        if (error) throw error;

        await this.createAdminRecipients(notification, data.audience, data.department);

        return notification;
    },

    async createAdminRecipients(
        notification: Notification,
        audience: AdminNotificationAudience,
        department?: string
    ): Promise<void> {
        let recipientIds: string[] = [];

        if (notification.target_type === 'individual' && notification.target_id) {
            recipientIds = [notification.target_id];
        } else {
            // Determine which profiles to query based on audience
            const fetchStudents = audience === 'students' || audience === 'all';
            const fetchTeachers = audience === 'teachers' || audience === 'all';

            await Promise.all([
                fetchStudents ? this._getStudentIds(notification) : Promise.resolve([]),
                fetchTeachers ? this._getTeacherIds(notification, department) : Promise.resolve([]),
            ]).then(([sIds, tIds]) => {
                const set = new Set<string>([...sIds, ...tIds]);
                recipientIds = [...set];
            });
        }

        if (recipientIds.length === 0) return;

        const recipients = recipientIds.map((id) => ({
            notification_id: notification.id,
            student_id: id,       // notification_recipients uses this column for any user
        }));

        const { error } = await supabase.from('notification_recipients').insert(recipients);
        if (error) console.error('Error creating admin recipients:', error);
    },

    async _getStudentIds(notification: Notification): Promise<string[]> {
        if (notification.target_type === 'global') {
            const { data } = await supabase.from('student_profiles').select('id');
            return data?.map((p) => p.id) ?? [];
        }
        if (notification.target_type === 'level' && notification.level) {
            const { data: lvl } = await supabase
                .from('academic_levels')
                .select('id')
                .eq('name', notification.level)
                .maybeSingle();
            if (!lvl) return [];
            const { data } = await supabase
                .from('student_profiles')
                .select('id')
                .eq('level_id', lvl.id);
            return data?.map((p) => p.id) ?? [];
        }
        if (notification.target_type === 'major' && notification.major) {
            const { data: maj } = await supabase
                .from('majors')
                .select('id')
                .eq('name', notification.major)
                .maybeSingle();
            if (!maj) return [];
            const { data } = await supabase
                .from('student_profiles')
                .select('id')
                .eq('major_id', maj.id);
            return data?.map((p) => p.id) ?? [];
        }
        return [];
    },

    async _getTeacherIds(notification: Notification, department?: string): Promise<string[]> {
        if (notification.target_type === 'global') {
            const { data } = await supabase.from('teacher_profiles').select('id');
            return data?.map((p) => p.id) ?? [];
        }
        if (department) {
            const { data } = await supabase
                .from('teacher_profiles')
                .select('id')
                .or(`department.eq.${department},specialization.eq.${department}`);
            return data?.map((p) => p.id) ?? [];
        }
        return [];
    },

    /** Get all notifications sent by this admin */
    async getAdminSentNotifications(): Promise<Notification[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('notifications')
            .select('*, recipients:notification_recipients(count)')
            .eq('sender_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data ?? [];
    },

    /** Delete a notification */
    async deleteNotification(id: string): Promise<void> {
        const { error } = await supabase.from('notifications').delete().eq('id', id);
        if (error) throw error;
    },

    /** Fetch academic levels */
    async getAvailableLevels(): Promise<string[]> {
        const { data, error } = await supabase
            .from('academic_levels')
            .select('name')
            .order('display_order');
        if (error) return [];
        return data?.map((l) => l.name).filter(Boolean) ?? [];
    },

    /** Fetch specialties/majors */
    async getAvailableMajors(): Promise<string[]> {
        const { data, error } = await supabase.from('majors').select('name');
        if (error) return [];
        const set = new Set<string>();
        (data ?? []).forEach((m) => { if (m.name) set.add(m.name); });
        return [...set].sort();
    },

    /** Fetch departments from teacher_profiles */
    async getAvailableDepartments(): Promise<string[]> {
        const { data, error } = await supabase
            .from('teacher_profiles')
            .select('department');
        if (error) return [];
        const set = new Set<string>();
        (data ?? []).forEach((t) => { if (t.department) set.add(t.department); });
        return [...set].sort();
    },

    /** Search users (students or teachers) by name/ID */
    async searchUsers(
        query: string,
        audience: 'students' | 'teachers'
    ): Promise<{ id: string; full_name: string | null; code: string | null }[]> {
        const role = audience === 'students' ? 'student' : 'teacher';

        // If searching students, also match by student_code
        if (audience === 'students') {
            const { data: codeMatches } = await supabase
                .from('student_profiles')
                .select('id')
                .ilike('student_code', `%${query}%`)
                .limit(10);
            const codeIds = (codeMatches ?? []).map((r) => r.id);

            let q = supabase
                .from('profiles')
                .select('id, full_name, student_profiles(student_code)')
                .eq('role', role);
            if (codeIds.length > 0) {
                q = q.or(`full_name.ilike.%${query}%,id.in.(${codeIds.join(',')})`);
            } else {
                q = q.ilike('full_name', `%${query}%`);
            }
            const { data } = await q.limit(10);
            return (data ?? []).map((p: any) => {
                const sp = Array.isArray(p.student_profiles) ? p.student_profiles[0] : p.student_profiles;
                return { id: p.id, full_name: p.full_name, code: sp?.student_code ?? null };
            });
        }

        // Teachers — search by name + employee_id
        const { data: empMatches } = await supabase
            .from('teacher_profiles')
            .select('id')
            .ilike('employee_id', `%${query}%`)
            .limit(10);
        const empIds = (empMatches ?? []).map((r) => r.id);

        let tq = supabase
            .from('profiles')
            .select('id, full_name, teacher_profiles(employee_id)')
            .eq('role', role);
        if (empIds.length > 0) {
            tq = tq.or(`full_name.ilike.%${query}%,id.in.(${empIds.join(',')})`);
        } else {
            tq = tq.ilike('full_name', `%${query}%`);
        }
        const { data: tData } = await tq.limit(10);
        return (tData ?? []).map((p: any) => {
            const tp = Array.isArray(p.teacher_profiles) ? p.teacher_profiles[0] : p.teacher_profiles;
            return { id: p.id, full_name: p.full_name, code: tp?.employee_id ?? null };
        });
    },
};
