import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../../api/notificationService';
import { NotificationWithReadStatus } from '../../types';
import { supabase } from '../../../../services/supabase';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');
    const [notifications, setNotifications] = useState<NotificationWithReadStatus[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadNotifications();
        subscribeToNotifications();

        // Click outside to close
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const [notifs, count] = await Promise.all([
                notificationService.getMyNotifications(),
                notificationService.getUnreadCount()
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (err) {
            console.error('Error loading notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToNotifications = () => {
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notification_recipients'
                },
                () => {
                    // Reload notifications when new one arrives
                    loadNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleToggle = () => {
        if (!isOpen) {
            // Opening - mark all as read after a delay
            setTimeout(() => {
                if (unreadCount > 0) {
                    notificationService.markAllAsRead();
                    setUnreadCount(0);
                    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                }
            }, 2000);
        }
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = async (e: React.MouseEvent, recipientId: string) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(recipientId);
            setNotifications(prev =>
                prev.map(n =>
                    n.recipient_id === recipientId ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return isRtl ? 'الآن' : 'Just now';
        if (minutes < 60) return isRtl ? `منذ ${minutes} ${minutes > 10 ? 'دقيقة' : 'دقائق'}` : `${minutes}m ago`;
        if (hours < 24) return isRtl ? `منذ ${hours} ${hours > 10 ? 'ساعة' : 'ساعات'}` : `${hours}h ago`;
        if (days < 7) return isRtl ? `منذ ${days} ${days > 10 ? 'يوم' : 'أيام'}` : `${days}d ago`;
        return date.toLocaleDateString(isRtl ? 'ar-SA' : 'en-US');
    };

    const parseTranslation = (text: string) => {
        try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === 'object' && parsed.key) {
                return t(parsed.key, parsed.params) as string;
            }
        } catch {
            // Not a JSON string
        }
        return text;
    };

    return (
        <div className={styles.container} ref={dropdownRef} dir={isRtl ? 'rtl' : 'ltr'}>
            <button
                className={styles.bellBtn}
                onClick={handleToggle}
                aria-label={isRtl ? 'الإشعارات' : 'Notifications'}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <h3 className={styles.dropdownTitle}>{isRtl ? 'الإشعارات' : 'Notifications'}</h3>
                        <div className={styles.headerActions} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => {
                                        notificationService.markAllAsRead();
                                        setUnreadCount(0);
                                        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                                    }}
                                    style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    {isRtl ? 'تعيين الكل كمقروء' : 'Mark all as read'}
                                </button>
                            )}
                            <button
                                className={styles.refreshBtn}
                                onClick={loadNotifications}
                                disabled={loading}
                                title={isRtl ? 'تحديث الإشعارات' : 'Refresh notifications'}
                            >
                                <RefreshCw size={16} className={loading ? styles.spin : ''} />
                            </button>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.notificationsList}>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                                <span>{isRtl ? 'جاري التحميل...' : 'Loading...'}</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <Bell size={40} color="#64748b" />
                                <p>{isRtl ? 'لا توجد إشعارات جديدة' : 'No new notifications'}</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`${styles.notificationItem} ${!notification.is_read ? styles.unread : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400">
                                                <Bell size={20} />
                                            </div>
                                        </div>
                                        <div className={`${styles.notificationContent} flex-1 text-start`}>
                                            <div className={styles.notificationHeader}>
                                                <h4 className={styles.notificationTitle}>
                                                    {parseTranslation(notification.title)}
                                                </h4>
                                                {!notification.is_read && (
                                                    <button
                                                        className={styles.readBtn}
                                                        onClick={(e) => handleMarkAsRead(e, notification.recipient_id)}
                                                        title={isRtl ? 'تعيين كمقروء' : 'Mark as read'}
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className={styles.notificationMessage}>
                                                {parseTranslation(notification.message)}
                                            </p>
                                            <div className={`${styles.notificationFooter} justify-between mt-2`}>
                                                <span className={styles.sender}>
                                                    {isRtl ? 'من:' : 'From:'} {notification.sender?.full_name || (isRtl ? 'الإدارة' : 'Admin')}
                                                </span>
                                                <div className="flex items-center gap-2 ms-auto">
                                                    <span className={styles.time}>
                                                        {formatTime(notification.created_at)}
                                                    </span>
                                                    {!notification.is_read && (
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
