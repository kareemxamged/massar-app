import { useTranslation } from 'react-i18next';
import {
    Globe, Users, GraduationCap, Bookmark, Trash2,
    Info, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import type { Notification } from '../../../features/notifications/types';

interface Props {
    notifications: Notification[];
    onDelete: (id: string) => void;
}

const notiTypeColors: Record<string, string> = {
    info: '#38bdf8',
    warning: '#fb923c',
    success: '#34d399',
};

const targetIcons: Record<string, React.ReactNode> = {
    global: <Globe size={13} />,
    individual: <Users size={13} />,
    level: <GraduationCap size={13} />,
    major: <Bookmark size={13} />,
};

export default function NotificationHistoryTable({ notifications, onDelete }: Props) {
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');

    const getTargetText = (n: Notification): string => {
        if (n.target_type === 'global') return isRtl ? 'الكل' : 'All Users';
        if (n.target_type === 'individual') return isRtl ? 'فردي' : 'Individual';
        if (n.target_type === 'level') return `${isRtl ? 'مستوى:' : 'Level:'} ${n.level}`;
        if (n.target_type === 'major') return `${isRtl ? 'تخصص:' : 'Major:'} ${n.major}`;
        return n.target_type;
    };

    /**
     * Notifications sent by the system are stored as JSON:
     * { key: 'notifications.system.courseApprovedTitle', params: { contentTitle: '...' } }
     * We resolve those through i18n; plain-text strings are returned as-is.
     */
    const parseText = (text: string): string => {
        try {
            const p = JSON.parse(text);
            if (p && typeof p === 'object' && p.key) {
                return t(p.key, p.params ?? {}) as string;
            }
        } catch { /* plain string — not JSON */ }
        return text;
    };

    if (notifications.length === 0) {
        return (
            <div
                className={`flex flex-col items-center justify-center py-16 gap-3 ${isRtl ? 'font-tajawal' : ''}`}
                dir={isRtl ? 'rtl' : 'ltr'}
            >
                <Globe size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {isRtl ? 'لم يتم إرسال أي إشعارات بعد' : 'No notifications sent yet'}
                </p>
            </div>
        );
    }

    return (
        <div
            className={`space-y-3 ${isRtl ? 'font-tajawal' : ''}`}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            {notifications.map((n) => {
                // Try to detect noti type from title prefix
                const titleText = parseText(n.title);
                const color =
                    notiTypeColors[
                    titleText.startsWith('[warning]') ? 'warning'
                        : titleText.startsWith('[success]') ? 'success'
                            : 'info'
                    ];

                return (
                    <div
                        key={n.id}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 rounded-xl transition-colors hover:bg-white/[0.02]"
                        style={{ border: '1px solid rgba(255,255,255,0.07)', borderInlineStartColor: color, borderInlineStartWidth: 3 }}
                    >
                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Type icon */}
                                {color === notiTypeColors.warning ? (
                                    <AlertTriangle size={14} style={{ color }} className="shrink-0" />
                                ) : color === notiTypeColors.success ? (
                                    <CheckCircle2 size={14} style={{ color }} className="shrink-0" />
                                ) : (
                                    <Info size={14} style={{ color }} className="shrink-0" />
                                )}
                                <h3
                                    className="text-sm font-semibold truncate"
                                    style={{ color: 'var(--text-main)' }}
                                >
                                    {titleText.replace(/^\[(info|warning|success)\]\s*/i, '')}
                                </h3>
                            </div>

                            <p
                                className="text-xs line-clamp-2"
                                style={{ color: 'var(--text-muted)' }}
                                dir="auto"
                            >
                                {parseText(n.message)}
                            </p>

                            {/* Meta */}
                            <div className="flex items-center flex-wrap gap-2 pt-0.5">
                                {/* Target badge */}
                                <span
                                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full"
                                    style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}
                                >
                                    {targetIcons[n.target_type]}
                                    {getTargetText(n)}
                                </span>
                                {/* Timestamp */}
                                <span className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.65 }}>
                                    {new Date(n.created_at).toLocaleString(isRtl ? 'ar-EG' : 'en-US', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Delete button */}
                        <button
                            onClick={() => onDelete(n.id)}
                            className="shrink-0 p-2 rounded-lg transition-colors hover:bg-red-500/15"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                            title={isRtl ? 'حذف' : 'Delete'}
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
