import { supabase } from '../../../services/supabase';
import { Notification, NotificationWithReadStatus, CreateNotificationRequest } from '../types';

export const notificationService = {
    // Teacher: Send notification
    async sendNotification(data: CreateNotificationRequest): Promise<Notification | null> {
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
                message: data.message
            })
            .select('*')
            .single();

        if (error) {
            console.error('Error sending notification:', error);
            throw error;
        }

        // Create recipient records based on target type
        await this.createRecipientsForNotification(notification);

        return notification;
    },

    // Create recipient records based on target type
    async createRecipientsForNotification(notification: Notification): Promise<void> {
        let targetStudentIds: string[] = [];

        if (notification.target_type === 'global') {
            // Get all students via student_profiles
            const { data } = await supabase
                .from('student_profiles')
                .select('id');
            targetStudentIds = data?.map(p => p.id) || [];
        } else if (notification.target_type === 'individual' && notification.target_id) {
            targetStudentIds = [notification.target_id];
        } else if (notification.target_type === 'level' && notification.level) {
            const { data: lvl } = await supabase
                .from('academic_levels')
                .select('id')
                .eq('name', notification.level)
                .maybeSingle();
            if (lvl) {
                const { data } = await supabase
                    .from('student_profiles')
                    .select('id')
                    .eq('level_id', lvl.id);
                targetStudentIds = data?.map(p => p.id) || [];
            }
        } else if (notification.target_type === 'major' && notification.major) {
            const { data: maj } = await supabase
                .from('majors')
                .select('id')
                .eq('name', notification.major)
                .maybeSingle();
            const [spData, tpData] = await Promise.all([
                maj
                    ? supabase.from('student_profiles').select('id').eq('major_id', maj.id)
                    : Promise.resolve({ data: [] }),
                supabase
                    .from('teacher_profiles')
                    .select('id')
                    .or(`specialization.eq.${notification.major},department.eq.${notification.major}`)
            ]);
            const ids = new Set<string>();
            (spData.data ?? []).forEach(p => ids.add(p.id));
            (tpData.data ?? []).forEach(p => ids.add(p.id));
            targetStudentIds = [...ids];
        }

        console.log('Target type:', notification.target_type);
        console.log('Target student IDs found:', targetStudentIds);

        if (targetStudentIds.length > 0) {
            const recipients = targetStudentIds.map(studentId => ({
                notification_id: notification.id,
                student_id: studentId
            }));

            console.log('Creating recipients:', recipients);

            const { data, error } = await supabase
                .from('notification_recipients')
                .insert(recipients)
                .select();

            if (error) {
                console.error('Error creating recipients:', error);
            } else {
                console.log('Recipients created successfully:', data);
            }
        } else {
            console.warn('No target students found for notification');
        }
    },

    // Teacher: Get sent notifications
    async getSentNotifications(): Promise<Notification[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                recipients:notification_recipients(count)
            `)
            .eq('sender_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sent notifications:', error);
            throw error;
        }

        return data || [];
    },

    // Student: Get my notifications with read status
    async getMyNotifications(): Promise<NotificationWithReadStatus[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get notifications with recipient info through the join table
        const { data, error } = await supabase
            .from('notification_recipients')
            .select(`
                id,
                is_read,
                read_at,
                notification:notification_id (
                    id,
                    sender_id,
                    target_type,
                    target_id,
                    level,
                    major,
                    title,
                    message,
                    created_at,
                    updated_at,
                    sender:sender_id (full_name, avatar_url)
                )
            `)
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }

        console.log('Raw notifications data:', data);
        console.log('Current user ID:', user.id);

        // Transform the data to match our interface
        return (data || []).map((item: any) => ({
            ...item.notification,
            is_read: item.is_read,
            read_at: item.read_at,
            recipient_id: item.id
        }));
    },

    // Student: Get unread count
    async getUnreadCount(): Promise<number> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const { count, error } = await supabase
            .from('notification_recipients')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', user.id)
            .eq('is_read', false);

        if (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }

        return count || 0;
    },

    // Student: Mark as read
    async markAsRead(recipientId: string): Promise<void> {
        const { error } = await supabase
            .from('notification_recipients')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('id', recipientId);

        if (error) {
            console.error('Error marking as read:', error);
            throw error;
        }
    },

    // Student: Mark all as read
    async markAllAsRead(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('notification_recipients')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('student_id', user.id)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all as read:', error);
            throw error;
        }
    },

    // Teacher: Delete notification
    async deleteNotification(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },

    // Get available levels for targeting
    async getAvailableLevels(): Promise<string[]> {
        const { data, error } = await supabase
            .from('academic_levels')
            .select('name')
            .order('display_order');

        if (error) {
            console.error('Error fetching levels:', error);
            return [];
        }

        return data?.map(l => l.name).filter(Boolean) || [];
    },

    // Get available majors for targeting
    async getAvailableMajors(): Promise<string[]> {
        const [majorsRes, tpRes] = await Promise.all([
            supabase.from('majors').select('name'),
            supabase.from('teacher_profiles').select('specialization, department')
        ]);

        if (majorsRes.error || tpRes.error) {
            console.error('Error fetching majors:', majorsRes.error || tpRes.error);
            return [];
        }

        const majors = new Set<string>();
        (majorsRes.data ?? []).forEach(m => { if (m.name) majors.add(m.name); });
        (tpRes.data ?? []).forEach(t => {
            if (t.specialization) majors.add(t.specialization);
            if (t.department) majors.add(t.department);
        });

        return [...majors].sort();
    },

    // Search students for individual targeting (by name OR student_code)
    async searchStudents(query: string): Promise<{ id: string; full_name: string | null; student_id: string | null }[]> {
        // Resolve student_profiles rows matching by student_code first
        const { data: codeMatches } = await supabase
            .from('student_profiles')
            .select('id')
            .ilike('student_code', `%${query}%`)
            .limit(10);
        const codeMatchIds = (codeMatches ?? []).map((r) => r.id);

        let q = supabase
            .from('profiles')
            .select('id, full_name, student_profiles(student_code)')
            .eq('role', 'student');

        if (codeMatchIds.length > 0) {
            q = q.or(`full_name.ilike.%${query}%,id.in.(${codeMatchIds.join(',')})`);
        } else {
            q = q.ilike('full_name', `%${query}%`);
        }

        const { data, error } = await q.limit(10);

        if (error) {
            console.error('Error searching students:', error);
            return [];
        }

        return (data ?? []).map((p: any) => {
            const sp = Array.isArray(p.student_profiles) ? p.student_profiles[0] : p.student_profiles;
            return {
                id: p.id,
                full_name: p.full_name,
                student_id: sp?.student_code ?? null,
            };
        });
    }
};
