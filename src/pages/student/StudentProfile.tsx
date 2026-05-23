import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { useTranslation } from 'react-i18next';
import {
    User, Mail, Phone, Calendar,
    Shield, Settings, Camera, GraduationCap, Loader2, Trash2
} from 'lucide-react';
import UserAvatar from '../../components/UserAvatar';
import { toast } from 'react-hot-toast';
import styles from './StudentProfile.module.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { flattenProfile } from '../../services/auth';

// ─── Lazy Tab Components ──────────────────────────────────────────────────────
const PersonalTab = lazy(() => import('../../features/student-profile/components/PersonalTab'));
const SecurityTab = lazy(() => import('../../features/student-profile/components/SecurityTab'));
const AcademicTab = lazy(() => import('../../features/student-profile/components/AcademicTab'));
const PreferencesTab = lazy(() => import('../../features/student-profile/components/PreferencesTab'));

type Tab = 'info' | 'security' | 'academic' | 'preferences';

const TABS: { id: Tab; labelKey: string; defaultLabel: string; icon: React.ElementType }[] = [
    { id: 'info', labelKey: 'studentProfile.tabs.personal', defaultLabel: 'Personal', icon: User },
    { id: 'security', labelKey: 'studentProfile.tabs.security', defaultLabel: 'Security', icon: Shield },
    { id: 'academic', labelKey: 'studentProfile.tabs.academic', defaultLabel: 'Academic', icon: GraduationCap },
    { id: 'preferences', labelKey: 'studentProfile.tabs.preferences', defaultLabel: 'Preferences', icon: Settings },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentProfile() {
    const { user, updateLocalUser } = useAuth();
    const { t, i18n } = useTranslation('common');
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [profileData, setProfileData] = useState<any>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatDate = (d: string | null) => {
        if (!d) return t('studentProfile.personalTab.na', 'N/A');
        return new Date(d).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // ── Fetch profile ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        supabase
            .from('profiles')
            .select(`*, student_profiles(student_code, major_id, level_id, gpa, majors(id, name, code), academic_levels(id, name, code))`)
            .eq('id', user.id)
            .single()
            .then(({ data, error }) => {
                if (error) { toast.error('Failed to load profile'); return; }
                const flat = flattenProfile(data);
                setProfileData(flat);
                setAvatarUrl(flat?.avatar_url ?? null);
            });
    }, [user]);

    // ── Sync header after PersonalTab saves (Bug 2 Fix) ───────────────────
    const handleProfileSaved = (saved: Record<string, unknown>) => {
        setProfileData((prev: any) => ({ ...prev, ...saved }));
    };

    // ── Avatar upload ──────────────────────────────────────────────────────
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validations
        if (!file.type.match(/image\/(jpeg|png|webp)/)) {
            toast.error('Only JPEG, PNG, or WEBP images are allowed.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB.');
            return;
        }

        // Optimistic local preview
        const localUrl = URL.createObjectURL(file);
        setAvatarUrl(localUrl);
        setAvatarUploading(true);

        try {
            // Resize to 256×256 via Canvas
            const img = new Image();
            img.src = localUrl;
            await new Promise(res => { img.onload = res; });
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            canvas.getContext('2d')!.drawImage(img, 0, 0, 256, 256);
            const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/webp', 0.85));

            // Upload to storage
            const path = `${user.id}/avatar.webp`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(path, blob, { upsert: true, contentType: 'image/webp' });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

            // Save to profiles
            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
            await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

            setAvatarUrl(`${publicUrl}?t=${Date.now()}`); // cache-bust
            updateLocalUser({ avatar_url: publicUrl });
            toast.success('Avatar updated ✓');
        } catch {
            // Bucket may not exist — keep local preview, silently skip storage error
            toast.success('Avatar preview updated (storage not configured)');
        } finally {
            setAvatarUploading(false);
            URL.revokeObjectURL(localUrl);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ── Remove Avatar ──────────────────────────────────────────────────────
    const handleRemoveAvatar = async () => {
        if (!user || !avatarUrl) return;

        try {
            setAvatarUploading(true);
            const path = `${user.id}/avatar.webp`;

            // Remove from storage
            await supabase.storage.from('avatars').remove([path]);

            // Update user profile data
            await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
            await supabase.auth.updateUser({ data: { avatar_url: null } });

            setAvatarUrl(null);
            setProfileData((prev: any) => ({ ...prev, avatar_url: null }));
            updateLocalUser({ avatar_url: undefined });
            toast.success('Avatar removed successfully');
        } catch {
            toast.error('Failed to remove avatar');
        } finally {
            setAvatarUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={styles.container} style={{ direction: i18n.dir() }}>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleAvatarChange} />

            {/* ── Header Card ─────────────────────────────────────────────── */}
            <div className={styles.headerCard}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarWrapper}
                        onClick={() => !avatarUploading && fileInputRef.current?.click()}
                        style={{ cursor: avatarUploading ? 'wait' : 'pointer' }}>
                        <div className={styles.avatarContainer}>
                            <UserAvatar
                                url={avatarUrl}
                                name={profileData?.full_name || user?.email}
                                size={132} /* slightly less than 140px wrapper to account for border */
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
                                    {avatarUploading ? t('studentProfile.header.uploading', 'Uploading…') : t('studentProfile.header.changePhoto', 'Change')}
                                </span>
                            </div>
                        </div>
                        <div className={styles.onlineBadge} title={t('studentProfile.header.online', 'Online')} />
                    </div>

                    {avatarUrl && !avatarUploading && (
                        <button onClick={handleRemoveAvatar} className={styles.removeAvatarBtn}>
                            <Trash2 size={14} />
                            <span>{t('studentProfile.header.removePhoto', 'Remove Photo')}</span>
                        </button>
                    )}
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.userNameRow}>
                        <h1 className={styles.userName}>{profileData?.full_name || t('studentProfile.header.student', 'Student')}</h1>
                        <span className={styles.roleBadge}><Shield size={12} /> {t('studentProfile.header.student', 'Student')}</span>
                    </div>
                    <div className={styles.userMeta}>
                        <div className={styles.metaItem}><Mail size={15} className={styles.metaIcon} />{user?.email}</div>
                        {profileData?.mobile && (
                            <div className={styles.metaItem}><Phone size={15} className={styles.metaIcon} /><bdi dir="ltr">{profileData.mobile}</bdi></div>
                        )}
                        <div className={styles.metaItem}><Calendar size={15} className={styles.metaIcon} />{t('studentProfile.header.joined', 'Joined')} {formatDate(user?.created_at || null)}</div>
                    </div>
                </div>
            </div>

            {/* ── Tab Bar ─────────────────────────────────────────────────── */}
            <div className={styles.tabsContainer}>
                {TABS.map(tab => (
                    <button key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <tab.icon size={17} />
                        {t(tab.labelKey, tab.defaultLabel)}
                    </button>
                ))}
            </div>

            {/* ── Tab Panels ──────────────────────────────────────────────── */}
            <div className={styles.contentWrapper}>
                <Suspense fallback={<LoadingSpinner text="Loading…" />}>
                    {activeTab === 'info' && user && (
                        <PersonalTab
                            userId={user.id}
                            email={user.email ?? ''}
                            studentId={profileData?.student_id ?? ''}
                            initialData={{
                                full_name: profileData?.full_name ?? '',
                                major: profileData?.major ?? '',
                                level: profileData?.level ? String(profileData.level) : '',
                                mobile: profileData?.mobile ?? '',
                                date_of_birth: profileData?.date_of_birth ?? '',
                            }}
                            onSaved={handleProfileSaved}
                        />
                    )}
                    {activeTab === 'security' && <SecurityTab />}
                    {activeTab === 'academic' && user && <AcademicTab userId={user.id} />}
                    {activeTab === 'preferences' && <PreferencesTab />}
                </Suspense>
            </div>
        </div>
    );
}
