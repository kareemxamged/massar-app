import { useState, useEffect } from 'react';
import { instructorService, InstructorMetrics } from '../../../../services/instructorService';
import { BookOpen, Users, FileText, Star, Loader2, Compass, Briefcase, Award, Hash, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from '../../../student/StudentProfile.module.css';

interface Props {
    userId: string;
    initialData?: {
        employee_id?: string;
        department?: string;
        specialization?: string;
        academic_degree?: string;
        years_of_experience?: number;
    };
    onSaved?: (saved: Record<string, unknown>) => void;
}

export default function TeacherProfessionalTab({ userId, initialData }: Props) {
    const { i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');

    const txt = isRtl ? {
        perfTitle: 'أداء المدرب',
        courses: 'المقررات المدارة',
        exams: 'الامتحانات المنشورة',
        students: 'الطلاب النشطين',
        submissions: 'إجمالي التسليمات',
        academicTitle: 'أوراق الاعتماد الأكاديمية',
        teacherId: 'رقم المعلم',
        department: 'القسم',
        specialization: 'التخصص',
        degree: 'الدرجة الأكاديمية',
        experience: 'سنوات الخبرة',
        years: 'سنوات',
        na: 'غير متوفر'
    } : {
        perfTitle: 'Instructor Performance',
        courses: 'Courses Managed',
        exams: 'Exams Published',
        students: 'Active Students',
        submissions: 'Total Submissions',
        academicTitle: 'Academic Credentials',
        teacherId: 'Teacher ID',
        department: 'Department',
        specialization: 'Specialization',
        degree: 'Academic Degree',
        experience: 'Years of Experience',
        years: 'years',
        na: 'N/A'
    };

    const [metrics, setMetrics] = useState<InstructorMetrics | null>(null);
    const [loadingMetrics, setLoadingMetrics] = useState(true);

    const formData = {
        employee_id: initialData?.employee_id || '',
        department: initialData?.department || '',
        specialization: initialData?.specialization || '',
        academic_degree: initialData?.academic_degree || '',
        years_of_experience: initialData?.years_of_experience || 0
    };

    useEffect(() => {
        instructorService.getMetrics(userId).then(data => {
            setMetrics(data);
            setLoadingMetrics(false);
        });
    }, [userId]);

    const statCards = [
        { label: txt.courses, value: metrics ? String(metrics.totalCourses) : '—', icon: BookOpen, color: '#60a5fa' },
        { label: txt.exams, value: metrics ? String(metrics.examsPublished) : '—', icon: FileText, color: '#34d399' },
        { label: txt.students, value: metrics ? String(metrics.activeStudents) : '—', icon: Users, color: '#a78bfa' },
        { label: txt.submissions, value: metrics ? String(metrics.totalSubmissions) : '—', icon: Star, color: '#fb923c' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Instructor Metrics Grid */}
            <div className={styles.card} style={{ border: '1px solid rgba(139, 92, 246, 0.2)', background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)' }}>
                <div className={`${styles.cardHeader} text-start`}>
                    <h3 className={styles.cardTitle}>{txt.perfTitle}</h3>
                </div>
                {loadingMetrics ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Loader2 size={32} className={styles.spin} color="rgba(255,255,255,0.2)" />
                    </div>
                ) : (
                    <div className={styles.statsGrid}>
                        {statCards.map(s => (
                            <div key={s.label} className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div className={styles.statIcon} style={{ background: `${s.color}20`, color: s.color }}>
                                        <s.icon size={22} />
                                    </div>
                                </div>
                                <div className={styles.statValue}>{s.value}</div>
                                <div className={styles.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Academic Credentials Form */}
            <div className={styles.card}>
                <div className={`${styles.cardHeader} text-start`}>
                    <h3 className={styles.cardTitle}>{txt.academicTitle}</h3>
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.formGrid}>

                        <div className={`${styles.formGroup} text-start`}>
                            <label className={`${styles.label} justify-start`}>{txt.teacherId} <Hash size={14} /></label>
                            <div className={`${styles.displayField} text-start`}>{formData.employee_id || txt.na}</div>
                        </div>

                        <div className={`${styles.formGroup} text-start`}>
                            <label className={`${styles.label} justify-start`}>{txt.department} <Building size={14} /></label>
                            <div className={`${styles.displayField} text-start`}>{formData.department || txt.na}</div>
                        </div>

                        <div className={`${styles.formGroup} text-start`}>
                            <label className={`${styles.label} justify-start`}>{txt.specialization} <Compass size={14} /></label>
                            <div className={`${styles.displayField} text-start`}>{formData.specialization || txt.na}</div>
                        </div>

                        <div className={`${styles.formGroup} text-start`}>
                            <label className={`${styles.label} justify-start`}>{txt.degree} <Award size={14} /></label>
                            <div className={`${styles.displayField} text-start`}>{formData.academic_degree || txt.na}</div>
                        </div>

                        <div className={`${styles.formGroup} text-start`}>
                            <label className={`${styles.label} justify-start`}>{txt.experience} <Briefcase size={14} /></label>
                            <div className={`${styles.displayField} text-start`}>{formData.years_of_experience || 0} {txt.years}</div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}
