import { useState, useEffect } from 'react';
import { Send, Users, GraduationCap, Bookmark, Globe, Trash2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../../../features/notifications/api/notificationService';
import { Notification, NotificationTargetType } from '../../../features/notifications/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { DeleteConfirmModal } from '../../../features/teacher-courses/components/CourseList/DeleteConfirmModal';
import styles from './TeacherNotifications.module.css';

const getNotificationSchema = (t: any) => z.object({
    targetType: z.enum(['individual', 'level', 'major', 'global']),
    targetStudent: z.string().optional(),
    targetLevel: z.string().optional(),
    targetMajor: z.string().optional(),
    title: z.string().min(1, t('notifications.titleRequired', 'Title is required')),
    message: z.string().min(1, t('notifications.messageRequired', 'Message is required'))
});

type NotificationFormData = z.infer<ReturnType<typeof getNotificationSchema>>;

export default function TeacherNotifications() {
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');
    const [sentNotifications, setSentNotifications] = useState<Notification[]>([]);
    const [students, setStudents] = useState<{ id: string; full_name: string | null; student_id: string | null }[]>([]);
    const [levels, setLevels] = useState<string[]>([]);
    const [majors, setMajors] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<NotificationFormData>({
        resolver: zodResolver(getNotificationSchema(t)),
        defaultValues: {
            targetType: 'global'
        }
    });

    const targetType = watch('targetType');

    useEffect(() => {
        loadSentNotifications();
        loadTargetingOptions();
    }, []);

    useEffect(() => {
        if (searchQuery.length >= 2 && targetType === 'individual') {
            searchStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, targetType]);

    const loadSentNotifications = async () => {
        try {
            const data = await notificationService.getSentNotifications();
            setSentNotifications(data);
        } catch (err) {
            console.error('Error loading notifications:', err);
        }
    };

    const loadTargetingOptions = async () => {
        try {
            const [levelsData, majorsData] = await Promise.all([
                notificationService.getAvailableLevels(),
                notificationService.getAvailableMajors()
            ]);
            setLevels(levelsData);
            setMajors(majorsData);
        } catch (err) {
            console.error('Error loading targeting options:', err);
        }
    };

    const searchStudents = async () => {
        try {
            const data = await notificationService.searchStudents(searchQuery);
            setStudents(data);
        } catch (err) {
            console.error('Error searching students:', err);
        }
    };

    const onSubmit = async (data: NotificationFormData) => {
        try {
            const request = {
                target_type: data.targetType as NotificationTargetType,
                title: data.title,
                message: data.message,
                ...(data.targetType === 'individual' && { target_id: data.targetStudent }),
                ...(data.targetType === 'level' && { level: data.targetLevel }),
                ...(data.targetType === 'major' && { major: data.targetMajor })
            };

            await notificationService.sendNotification(request);
            toast.success(t('notifications.sentSuccess', 'Notification sent successfully!'));
            reset();
            loadSentNotifications();
        } catch (err: any) {
            console.error('Error sending notification:', err);
            toast.error(err.message || t('notifications.sendFailed', 'Failed to send notification'));
        }
    };

    const handleDeleteClick = (notification: Notification) => {
        setNotificationToDelete(notification);
    };

    const handleConfirmDelete = async () => {
        if (!notificationToDelete) return;
        setIsDeleting(true);
        try {
            await notificationService.deleteNotification(notificationToDelete.id);
            toast.success(t('notifications.deletedSuccess', 'Notification deleted'));
            loadSentNotifications();
        } catch (err) {
            console.error('Error deleting notification:', err);
            toast.error(t('notifications.deleteFailed', 'Failed to delete notification'));
        } finally {
            setIsDeleting(false);
            setNotificationToDelete(null);
        }
    };

    const getTargetLabel = (notification: Notification) => {
        switch (notification.target_type) {
            case 'global':
                return { icon: <Globe size={14} />, text: isRtl ? 'جميع الطلاب' : 'All Students' };
            case 'individual':
                return { icon: <Users size={14} />, text: isRtl ? 'طالب' : 'Individual' };
            case 'level':
                return { icon: <GraduationCap size={14} />, text: `${isRtl ? 'المستوى:' : 'Level:'} ${notification.level}` };
            case 'major':
                return { icon: <Bookmark size={14} />, text: `${isRtl ? 'التخصص:' : 'Major:'} ${notification.major}` };
            default:
                return { icon: null, text: notification.target_type as string };
        }
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
        <div className={styles.container} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={styles.header}>
                <h1 className={styles.title}>{isRtl ? 'الإشعارات' : 'Notifications'}</h1>
                <p className={styles.subtitle}>{isRtl ? 'إرسال تنبيهات وإعلانات للطلاب' : 'Send alerts and announcements to students'}</p>
            </div>

            <div className={styles.content}>
                {/* Compose Form */}
                <div className={styles.formCard}>
                    <h2 className={styles.formTitle}>
                        <Send size={20} />
                        {isRtl ? 'إنشاء إشعار جديد' : 'Compose Notification'}
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                        {/* Target Selection */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{isRtl ? 'الجمهور المستهدف' : 'Target Audience'}</label>
                            <div className={styles.targetButtons}>
                                {(['global', 'individual', 'level', 'major'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={`${styles.targetBtn} ${targetType === type ? styles.targetBtnActive : ''}`}
                                        onClick={() => setValue('targetType', type)}
                                    >
                                        {type === 'global' && <Globe size={16} />}
                                        {type === 'individual' && <Users size={16} />}
                                        {type === 'level' && <GraduationCap size={16} />}
                                        {type === 'major' && <Bookmark size={16} />}
                                        {isRtl
                                            ? (type === 'global' ? 'الكل' : type === 'individual' ? 'طالب معين' : type === 'level' ? 'مستوى' : 'تخصص')
                                            : (type.charAt(0).toUpperCase() + type.slice(1))}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Target Fields */}
                        {targetType === 'individual' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>{isRtl ? 'اختر الطالب' : 'Select Student'}</label>
                                <input
                                    type="text"
                                    placeholder={isRtl ? 'البحث بالاسم أو رقم الطالب...' : 'Search by name or student ID...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`${styles.input} text-start`}
                                />
                                {students.length > 0 && (
                                    <div className={styles.searchResults}>
                                        {students.map((student) => (
                                            <div
                                                key={student.id}
                                                className={styles.searchResult}
                                                onClick={() => {
                                                    setValue('targetStudent', student.id);
                                                    setSearchQuery(student.full_name || '');
                                                    setStudents([]);
                                                }}
                                            >
                                                <span className={styles.resultName}>{student.full_name}</span>
                                                <span className={styles.resultId}>{student.student_id}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <input type="hidden" {...register('targetStudent')} />
                            </div>
                        )}

                        {targetType === 'level' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>{isRtl ? 'اختر المستوى' : 'Select Level'}</label>
                                <select {...register('targetLevel')} className={styles.select}>
                                    <option value="">{isRtl ? 'اختر مستوى...' : 'Choose a level...'}</option>
                                    {levels.map((level) => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {targetType === 'major' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>{isRtl ? 'اختر التخصص' : 'Select Major/Specialization'}</label>
                                <select {...register('targetMajor')} className={styles.select}>
                                    <option value="">{isRtl ? 'اختر تخصصاً...' : 'Choose a major...'}</option>
                                    {majors.map((major) => (
                                        <option key={major} value={major}>{major}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Title */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{isRtl ? 'العنوان' : 'Title'}</label>
                            <input
                                type="text"
                                {...register('title')}
                                placeholder={isRtl ? 'عنوان الإشعار...' : 'Notification title...'}
                                className={`${styles.input} text-start`}
                            />
                            {errors.title && <span className={styles.error}>{errors.title.message}</span>}
                        </div>

                        {/* Message */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{isRtl ? 'الرسالة' : 'Message'}</label>
                            <textarea
                                {...register('message')}
                                placeholder={isRtl ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                                rows={5}
                                className={`${styles.textarea} text-start`}
                            />
                            {errors.message && <span className={styles.error}>{errors.message.message}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={styles.sendBtn}
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCw size={18} className={styles.spin} />
                                    {isRtl ? 'جاري الإرسال...' : 'Sending...'}
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    {isRtl ? 'إرسال الإشعار' : 'Send Notification'}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sent History */}
                <div className={styles.historyCard}>
                    <h2 className={styles.formTitle}>{isRtl ? 'سجل الإرسال' : 'Sent History'}</h2>

                    {sentNotifications.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Send size={48} color="#64748b" />
                            <p>{isRtl ? 'لم يتم إرسال أي إشعارات بعد' : 'No notifications sent yet'}</p>
                        </div>
                    ) : (
                        <div className={styles.notificationsList}>
                            {sentNotifications.map((notification) => {
                                const target = getTargetLabel(notification);
                                return (
                                    <div key={notification.id} className={styles.notificationItem}>
                                        <div className={styles.notificationHeader}>
                                            <h3 className={styles.notificationTitle}>{parseTranslation(notification.title)}</h3>
                                            <button
                                                onClick={() => handleDeleteClick(notification)}
                                                className={styles.deleteBtn}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p className={styles.notificationMessage}>{parseTranslation(notification.message)}</p>
                                        <div className={styles.notificationMeta}>
                                            <span className={styles.targetBadge}>
                                                {target.icon}
                                                {target.text}
                                            </span>
                                            <span className={styles.timeStamp}>
                                                {new Date(notification.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {notificationToDelete && (
                <DeleteConfirmModal
                    title={isRtl ? 'حذف الإشعار' : 'Delete Notification'}
                    itemName={notificationToDelete.title}
                    isDeleting={isDeleting}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setNotificationToDelete(null)}
                />
            )}
        </div>
    );
}
