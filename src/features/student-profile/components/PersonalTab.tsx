import { useTranslation } from 'react-i18next';
import {
    User, Shield, BookOpen, BarChart2, Mail,
    Phone, Calendar,
} from 'lucide-react';
import styles from '../../../pages/student/StudentProfile.module.css';

interface Props {
    userId: string;
    email: string;
    studentId: string;
    initialData: {
        full_name?: string;
        major?: string;
        level?: string;
        mobile?: string;
        date_of_birth?: string;
    };
    onSaved?: (saved: Record<string, unknown>) => void;
}

function ReadOnlyField({ label, icon, value }: { label: string; icon: React.ReactNode; value: React.ReactNode }) {
    const { i18n } = useTranslation('common');
    return (
        <div className={styles.inputGroup} style={{ direction: i18n.dir() }}>
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {icon} {label}
            </label>
            <div className={styles.displayField} style={{ textAlign: i18n.dir() === 'rtl' ? 'right' : 'left' }}>
                {value}
            </div>
        </div>
    );
}

export default function PersonalTab({ email, studentId, initialData }: Props) {
    const { t, i18n } = useTranslation('common');
    const naText = t('studentProfile.personalTab.na', 'N/A');

    return (
        <div className={styles.card} style={{ direction: i18n.dir() }}>
            <div className={styles.cardHeader}>
                <div>
                    <h3 className={styles.cardTitle}>{t('studentProfile.personalTab.title', 'Personal Information')}</h3>
                    <p className={styles.cardSubtitle}>{t('studentProfile.personalTab.subtitle', 'Contact the admin to edit the data.')}</p>
                </div>
            </div>

            <div className={styles.formGrid}>
                <ReadOnlyField
                    label={t('studentProfile.personalTab.fullName', 'Full Name')}
                    icon={<User size={14} />}
                    value={initialData.full_name || naText}
                />

                <ReadOnlyField
                    label={t('studentProfile.personalTab.studentId', 'Student ID')}
                    icon={<Shield size={14} />}
                    value={studentId}
                />

                <ReadOnlyField
                    label={t('studentProfile.personalTab.major', 'Major')}
                    icon={<BookOpen size={14} />}
                    value={initialData.major || naText}
                />

                <ReadOnlyField
                    label={t('studentProfile.personalTab.levelYear', 'Level / Year')}
                    icon={<BarChart2 size={14} />}
                    value={initialData.level ? `${t('studentProfile.personalTab.level', 'Level')} ${initialData.level}` : naText}
                />

                <ReadOnlyField
                    label={t('studentProfile.personalTab.emailAddress', 'Email Address')}
                    icon={<Mail size={14} />}
                    value={email || naText}
                />

                <ReadOnlyField
                    label={t('studentProfile.personalTab.mobileNumber', 'Mobile Number')}
                    icon={<Phone size={14} />}
                    value={initialData.mobile ? <bdi dir="ltr">{initialData.mobile}</bdi> : naText}
                />

                <ReadOnlyField
                    label={t('studentProfile.personalTab.dateOfBirth', 'Date of Birth')}
                    icon={<Calendar size={14} />}
                    value={initialData.date_of_birth || naText}
                />
            </div>
        </div>
    );
}
