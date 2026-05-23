export type NotificationTargetType = 'individual' | 'level' | 'major' | 'global';

export interface Notification {
    id: string;
    sender_id: string;
    target_type: NotificationTargetType;
    target_id: string | null;
    level: string | null;
    major: string | null;
    title: string;
    message: string;
    created_at: string;
    updated_at: string;
    sender?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

export interface NotificationRecipient {
    id: string;
    notification_id: string;
    student_id: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

export interface NotificationWithReadStatus extends Notification {
    is_read: boolean;
    read_at: string | null;
    recipient_id: string;
}

export interface CreateNotificationRequest {
    target_type: NotificationTargetType;
    target_id?: string;
    level?: string;
    major?: string;
    title: string;
    message: string;
}

export interface NotificationFormData {
    targetType: NotificationTargetType;
    targetStudent: string;
    targetLevel: string;
    targetMajor: string;
    title: string;
    message: string;
}
