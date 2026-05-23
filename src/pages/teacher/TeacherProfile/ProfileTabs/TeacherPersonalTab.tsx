import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    User, BookOpen, BarChart2,
    Phone, Calendar
} from 'lucide-react';
import styles from '../../../student/StudentProfile.module.css';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const personalSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    mobile: z
        .string()
        .regex(/^(\+\d{1,3}\s?)?\d{9,13}$/, 'Invalid phone number (e.g. +201234567890)')
        .optional()
        .or(z.literal('')),
    date_of_birth: z
        .string()
        .refine(v => !v || v <= new Date().toISOString().split('T')[0], 'DOB cannot be in the future')
        .optional(),
    headline: z.string().max(100, 'Headline must be under 100 characters').optional(),
    bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

type PersonalFormData = z.infer<typeof personalSchema>;

interface Props {
    userId: string;
    email: string;
    studentId?: string; // Kept for interface compatibility, but unused here
    initialData: Partial<PersonalFormData>;
    onSaved?: (saved: Partial<PersonalFormData>) => void;
}

// ─── Inline Error Message ─────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '-4px', display: 'block' }}>
            {msg}
        </span>
    );
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────
function Field({ label, icon, children, error }: { label: string; icon: React.ReactNode; children: React.ReactNode; error?: string }) {
    return (
        <div className={`${styles.inputGroup} text-start`}>
            <label className={`${styles.label} justify-start`}>
                {icon} {label}
            </label>
            {children}
            <FieldError msg={error} />
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TeacherPersonalTab({ initialData }: Props) {
    const { i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');

    const txt = isRtl ? {
        tabTitle: 'المعلومات الشخصية',
        tabSubtitle: 'اتصل بالمسؤول لتعديل البيانات.',
        fullName: 'الاسم بالكامل',
        headline: 'المسمى الوظيفي',
        bio: 'نبذة تعريفية',
        mobile: 'رقم الهاتف',
        dob: 'تاريخ الميلاد',
        na: 'غير متوفر',
        noBio: 'لا توجد نبذة تعريفية'
    } : {
        tabTitle: 'Personal Information',
        tabSubtitle: 'Contact the admin to edit the data.',
        fullName: 'Full Name',
        headline: 'Headline',
        bio: 'Bio',
        mobile: 'Mobile Number',
        dob: 'Date of Birth',
        na: 'N/A',
        noBio: 'No bio available'
    };

    const { reset, watch } = useForm<PersonalFormData>({
        resolver: zodResolver(personalSchema),
        defaultValues: {
            full_name: initialData.full_name ?? '',
            mobile: initialData.mobile ?? '',
            date_of_birth: initialData.date_of_birth ?? '',
            headline: initialData.headline ?? '',
            bio: initialData.bio ?? '',
        },
    });

    useEffect(() => {
        reset({
            full_name: initialData.full_name ?? '',
            mobile: initialData.mobile ?? '',
            date_of_birth: initialData.date_of_birth ?? '',
            headline: initialData.headline ?? '',
            bio: initialData.bio ?? '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    return (
        <div className={styles.card}>
            <style>{`
                .ring-error { border-color: #f87171 !important; }
                .ring-error:focus { box-shadow: 0 0 0 4px rgba(248,113,113,0.15) !important; }
            `}</style>

            <div className={styles.cardHeader}>
                <div className="text-start">
                    <h3 className={styles.cardTitle}>{txt.tabTitle}</h3>
                    <p className={styles.cardSubtitle}>{txt.tabSubtitle}</p>
                </div>
            </div>

            <div className={styles.formGrid}>

                <Field label={txt.fullName} icon={<User size={14} />}>
                    <div className={`${styles.displayField} text-start`}>{watch('full_name') || txt.na}</div>
                </Field>

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Field label={txt.headline} icon={<BookOpen size={14} />}>
                        <div className={`${styles.displayField} text-start`}>{watch('headline') || txt.na}</div>
                    </Field>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Field label={txt.bio} icon={<BarChart2 size={14} />}>
                        <div className={`${styles.displayField} text-start`} style={{ minHeight: '80px', whiteSpace: 'pre-wrap', textAlign: isRtl ? 'right' : 'left' }} dir="auto">
                            {watch('bio') || txt.noBio}
                        </div>
                    </Field>
                </div>

                {/* REQUESTED MODIFICATION: Always Enabled Phone Number */}
                <Field label={txt.mobile} icon={<Phone size={14} />}>
                    <div className={`${styles.displayField} text-start`} dir="ltr" style={{ textAlign: isRtl ? 'right' : 'left' }}>{watch('mobile') || txt.na}</div>
                </Field>

                <Field label={txt.dob} icon={<Calendar size={14} />}>
                    <div className={`${styles.displayField} text-start`}>{watch('date_of_birth') || txt.na}</div>
                </Field>

            </div>
        </div>
    );
}
