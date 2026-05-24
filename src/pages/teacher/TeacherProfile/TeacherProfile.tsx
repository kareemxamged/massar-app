import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../services/supabase';
import {
    User, Mail, Phone, Calendar,
    Shield, Settings, Camera, Loader2, Trash2
} from 'lucide-react';
import UserAvatar from '../../../components/UserAvatar';
import { toast } from 'react-hot-toast';
import styles from '../../student/StudentProfile.module.css';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { flattenProfile } from '../../../services/auth';
import { useTranslation } from 'react-i18next';

// ─── Lazy Tab Components ──────────────────────────────────────────────────────
const TeacherPersonalTab = lazy(() => import('./ProfileTabs/TeacherPersonalTab'));
const TeacherProfessionalTab = lazy(() => import('./ProfileTabs/TeacherProfessionalTab'));
const SecurityTab = lazy(() => import('../../student/ProfileTabs/SecurityTab'));
const PreferencesTab = lazy(() => import('../../student/ProfileTabs/PreferencesTab'));

type Tab = 'info' | 'professional' | 'security' | 'preferences';

export default function TeacherProfile() {
    const { i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');

    const txt = isRtl ? {
        personal: 'المعلومات الشخصية',
        professional: 'المهنية',
        security: 'الأمان',
        preferences: 'التفضيلات',
        onlyImg: 'يُسمح فقط بصور JPEG أو PNG أو WEBP أو GIF.',
        imgSize: 'يجب أن يكون حجم الصورة أقل من 5 ميغابايت.',
        avatarSuccess: 'تم تحديث الصورة الشخصية ✓',
        avatarFail2: 'فشل رفع الصورة الشخصية',
        avatarRemoved: 'تمت إزالة الصورة بنجاح',
        avatarFail: 'فشلت إزالة الصورة',
        uploading: 'جاري الرفع...',
        change: 'تغيير',
        removePhoto: 'إزالة الصورة',
        teacherName: 'اسم المعلم',
        instructor: 'مدرب',
        joined: 'تاريخ الانضمام ',
        online: 'متصل',
        loading: 'جاري التحميل...',
        loadFailed: 'فشل تحميل الملف الشخصي: '
    } : {
        personal: 'Personal',
        professional: 'Professional',
        security: 'Security',
        preferences: 'Preferences',
        onlyImg: 'Only JPEG, PNG, WEBP, or GIF images are allowed.',
        imgSize: 'Image must be less than 5 MB.',
        avatarSuccess: 'Avatar updated ✓',
        avatarFail2: 'Failed to upload avatar',
        avatarRemoved: 'Avatar removed successfully',
        avatarFail: 'Failed to remove avatar',
        uploading: 'Uploading…',
        change: 'Change',
        removePhoto: 'Remove Photo',
        teacherName: 'Teacher Name',
        instructor: 'Instructor',
        joined: 'Joined ',
        online: 'Online',
        loading: 'Loading…',
        loadFailed: 'Failed to load profile: '
    };

    const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'info', label: txt.personal, icon: User },
        { id: 'professional', label: txt.professional, icon: Shield },
        { id: 'security', label: txt.security, icon: Shield },
        { id: 'preferences', label: txt.preferences, icon: Settings },
    ];

    const { user, updateLocalUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [profileData, setProfileData] = useState<any>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatDate = (d: string | null) =>
        d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    useEffect(() => {
        if (!user?.id) return;

        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    teacher_profiles (
                        employee_code, department, specialization,
                        headline, bio, academic_degree, years_experience
                    )
                `)
                .eq('id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Profile fetch error:', error);
                toast.error(`${txt.loadFailed}${error.message}`);
                return;
            }

            const flat = data ? flattenProfile(data) : null;
            setProfileData(flat);
            setAvatarUrl(flat?.avatar_url ?? null);
        };

        fetchProfile();
    }, [user]);

    const handleProfileSaved = (saved: Record<string, unknown>) => {
        setProfileData((prev: any) => ({ ...prev, ...saved }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (!file.type.match(/image\/(jpeg|png|webp|gif)/)) {
            toast.error(txt.onlyImg);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error(txt.imgSize);
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setAvatarUrl(localUrl);
        setAvatarUploading(true);

        try {
            const img = new Image();
            img.src = localUrl;
            await new Promise(res => { img.onload = res; });
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            canvas.getContext('2d')!.drawImage(img, 0, 0, 256, 256);
            const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/webp', 0.85));

            const path = `${user.id}/avatar.webp`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(path, blob, { upsert: true, contentType: 'image/webp' });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
            await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

            setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
            updateLocalUser({ avatar_url: publicUrl });
            toast.success(txt.avatarSuccess);
        } catch {
            toast.error(txt.avatarFail2);
        } finally {
            setAvatarUploading(false);
            URL.revokeObjectURL(localUrl);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveAvatar = async () => {
        if (!user || !avatarUrl) return;

        try {
            setAvatarUploading(true);
            const path = `${user.id}/avatar.webp`;
            await supabase.storage.from('avatars').remove([path]);
            await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
            await supabase.auth.updateUser({ data: { avatar_url: null } });

            setAvatarUrl(null);
            setProfileData((prev: any) => ({ ...prev, avatar_url: null }));
            updateLocalUser({ avatar_url: undefined });
            toast.success(txt.avatarRemoved);
        } catch {
            toast.error(txt.avatarFail);
        } finally {
            setAvatarUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={styles.container} dir={isRtl ? 'rtl' : 'ltr'}>
            <input ref={fileInputRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleAvatarChange} />

            <div className={styles.headerCard}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarWrapper}
                        onClick={() => !avatarUploading && fileInputRef.current?.click()}
                        style={{ cursor: avatarUploading ? 'wait' : 'pointer' }}>
                        <div className={styles.avatarContainer}>
                            <UserAvatar
                                url={avatarUrl}
                                name={profileData?.full_name || user?.email}
                                size={132}
                                className={styles.avatarImage}
                                style={{ opacity: avatarUploading ? 0.5 : 1, transition: 'opacity 0.3s' }}
                            />
                            <div className={styles.avatarOverlay}>
                                {avatarUploading ? (
                                    <Loader2 size={22} color="white" className={styles.spin} />
                                ) : (
                                    <Camera size={22} color="white" />
                                )}
                                <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase' }}>
                                    {avatarUploading ? txt.uploading : txt.change}
                                </span>
                            </div>
                        </div>
                        <div className={styles.onlineBadge} title={txt.online} />
                    </div>

                    {avatarUrl && !avatarUploading && (
                        <button onClick={handleRemoveAvatar} className={styles.removeAvatarBtn}>
                            <Trash2 size={14} />
                            <span>{txt.removePhoto}</span>
                        </button>
                    )}
                </div>

                <div className={`${styles.userInfo} text-start`}>
                    <div className={styles.userNameRow} style={{ justifyContent: 'flex-start' }}>
                        <h1 className={styles.userName}>{profileData?.full_name || txt.teacherName}</h1>
                        <span className={styles.roleBadge}><Shield size={12} /> {txt.instructor}</span>
                    </div>
                    {profileData?.headline && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1rem', fontWeight: 500 }}>
                            {profileData.headline}
                        </div>
                    )}
                    <div className={styles.userMeta}>
                        <div className={styles.metaItem}><Mail size={15} className={styles.metaIcon} />{user?.email}</div>
                        {profileData?.mobile && (
                            <div className={styles.metaItem} dir="ltr"><Phone size={15} className={styles.metaIcon} />{profileData.mobile}</div>
                        )}
                        <div className={styles.metaItem}><Calendar size={15} className={styles.metaIcon} />{txt.joined}{formatDate(user?.created_at || null)}</div>
                    </div>
                </div>
            </div>

            <div className={styles.tabsContainer}>
                {TABS.map(tab => (
                    <button key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}>
                        <tab.icon size={17} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.contentWrapper}>
                <Suspense fallback={<LoadingSpinner text={txt.loading} />}>
                    {activeTab === 'info' && user && (
                        <TeacherPersonalTab
                            userId={user.id}
                            email={user.email ?? ''}
                            studentId={profileData?.employee_id || profileData?.student_id || ''}
                            initialData={{
                                full_name: profileData?.full_name ?? '',
                                mobile: profileData?.mobile ?? '',
                                date_of_birth: profileData?.date_of_birth ?? '',
                                headline: profileData?.headline ?? '',
                                bio: profileData?.bio ?? ''
                            }}
                            onSaved={handleProfileSaved}
                        />
                    )}
                    {activeTab === 'professional' && user && (
                        <TeacherProfessionalTab
                            userId={user.id}
                            initialData={{
                                employee_id: profileData?.employee_id ?? '',
                                department: profileData?.department ?? '',
                                specialization: profileData?.specialization ?? '',
                                academic_degree: profileData?.academic_degree ?? '',
                                years_of_experience: profileData?.years_experience ?? 0
                            }}
                            onSaved={handleProfileSaved}
                        />
                    )}
                    {activeTab === 'security' && <SecurityTab />}
                    {activeTab === 'preferences' && <PreferencesTab />}
                </Suspense>
            </div>
        </div>
    );
}
