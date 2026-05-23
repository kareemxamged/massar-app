import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, RefreshCw } from 'lucide-react';
import { adminNotificationService } from '../../features/notifications/api/adminNotificationService';
import type { Notification } from '../../features/notifications/types';
import SendNotificationForm from '../../features/admin-notifications/components/SendNotificationForm';
import NotificationHistoryTable from '../../features/admin-notifications/components/NotificationHistoryTable';
import ConfirmModal from '../../features/admin/components/ConfirmModal';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
    const { i18n } = useTranslation();
    const isRtl = i18n.language.startsWith('ar');

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminNotificationService.getAdminSentNotifications();
            setNotifications(data);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadNotifications(); }, [loadNotifications]);

    const handleDelete = (id: string) => setDeleteTargetId(id);

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        setIsDeleting(true);
        try {
            await adminNotificationService.deleteNotification(deleteTargetId);
            toast.success(isRtl ? 'تم حذف الإشعار' : 'Notification deleted');
            setDeleteTargetId(null);
            loadNotifications();
        } catch (err: any) {
            toast.error(err?.message ?? (isRtl ? 'فشل الحذف' : 'Delete failed'));
        } finally {
            setIsDeleting(false);
        }
    };

    /* ── Loading skeleton ─────────────────────────────────────────────────── */
    if (loading) {
        return (
            <div className={`p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto ${isRtl ? 'font-tajawal' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="animate-pulse space-y-6">
                    <div className="h-12 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-72 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-48 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
            </div>
        );
    }

    return (
        <div
            className={`p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 ${isRtl ? 'font-tajawal' : ''}`}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl shrink-0" style={{ background: 'rgba(56,189,248,0.15)' }}>
                        <Bell size={24} style={{ color: '#38bdf8' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
                            {isRtl ? 'إدارة الإشعارات' : 'Notification Management'}
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {isRtl
                                ? 'أرسل إشعارات للطلاب والمعلمين وجميع المستخدمين'
                                : 'Send notifications to students, teachers, or all users'}
                        </p>
                    </div>
                </div>

                {/* Refresh */}
                <button
                    onClick={loadNotifications}
                    className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/8"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
                >
                    <RefreshCw size={15} />
                    {isRtl ? 'تحديث' : 'Refresh'}
                </button>
            </div>

            {/* ── Main Grid ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* Send Form – wider column */}
                <div className="xl:col-span-3">
                    <SendNotificationForm onSent={loadNotifications} />
                </div>

                {/* History Panel */}
                <div className="xl:col-span-2">
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
                    >
                        {/* History header */}
                        <div
                            className="flex items-center justify-between px-5 py-4"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <h2 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
                                {isRtl ? 'سجل الإرسال' : 'Sent History'}
                            </h2>
                            <span
                                className="text-xs px-2.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}
                            >
                                {notifications.length}
                            </span>
                        </div>

                        <div className="p-4 max-h-[600px] overflow-y-auto">
                            <NotificationHistoryTable
                                notifications={notifications}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Delete Confirm ───────────────────────────────────────────────── */}
            {deleteTargetId && (
                <ConfirmModal
                    isOpen
                    title={isRtl ? 'حذف الإشعار' : 'Delete Notification'}
                    message={
                        isRtl
                            ? 'هل أنت متأكد من حذف هذا الإشعار؟ لا يمكن التراجع عنه.'
                            : 'Are you sure you want to delete this notification? This cannot be undone.'
                    }
                    confirmText={isRtl ? 'حذف' : 'Delete'}
                    cancelText={isRtl ? 'إلغاء' : 'Cancel'}
                    variant="danger"
                    onConfirm={confirmDelete}
                    onClose={() => setDeleteTargetId(null)}
                    isConfirming={isDeleting}
                />
            )}
        </div>
    );
}
