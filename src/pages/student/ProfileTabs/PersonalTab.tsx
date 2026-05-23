import {
    User, Shield, BookOpen, BarChart2, Mail,
    Phone, Calendar,
} from 'lucide-react';
import styles from '../StudentProfile.module.css';

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

function ReadOnlyField({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) {
    return (
        <div className={styles.inputGroup}>
            <label className={styles.label}>{icon} {label}</label>
            <div className={styles.displayField}>{value || 'N/A'}</div>
        </div>
    );
}

export default function PersonalTab({ email, studentId, initialData }: Props) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div>
                    <h3 className={styles.cardTitle}>Personal Information</h3>
                    <p className={styles.cardSubtitle}>Contact the admin to edit the data.</p>
                </div>
            </div>

            <div className={styles.formGrid}>

                <ReadOnlyField label="Full Name" icon={<User size={14} />} value={initialData.full_name ?? ''} />

                <ReadOnlyField label="Student ID" icon={<Shield size={14} />} value={studentId} />

                <ReadOnlyField label="Major" icon={<BookOpen size={14} />} value={initialData.major ?? ''} />

                <ReadOnlyField label="Level / Year" icon={<BarChart2 size={14} />} value={initialData.level ? `Level ${initialData.level}` : ''} />

                <ReadOnlyField label="Email Address" icon={<Mail size={14} />} value={email} />

                <ReadOnlyField label="Mobile Number" icon={<Phone size={14} />} value={initialData.mobile ?? ''} />

                <ReadOnlyField label="Date of Birth" icon={<Calendar size={14} />} value={initialData.date_of_birth ?? ''} />

            </div>
        </div>
    );
}
