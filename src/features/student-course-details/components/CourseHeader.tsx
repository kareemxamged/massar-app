import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Users, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { CourseData } from '../types';

interface CourseHeaderProps {
    course: CourseData;
}

export default function CourseHeader({ course }: CourseHeaderProps) {
    const { t, i18n } = useTranslation('common');
    const navigate = useNavigate();
    const isRtl = i18n.dir() === 'rtl';

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', direction: i18n.dir() }}>
                <button className="btn-icon"
                    onClick={() => navigate('/student/courses')}
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', flexShrink: 0 }}>
                    {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                </button>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {course.code}
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                        {course.name}
                    </h1>
                </div>
            </div>

            <div className="glass-card" style={{
                padding: '1rem 1.5rem', marginBottom: '1.5rem',
                position: 'sticky', top: '0px', zIndex: 20,
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem',
                backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)',
                direction: i18n.dir()
            }}>
                {[
                    { icon: <Users size={14} />, label: t('courseDetails.instructor', 'Instructor'), value: course.instructor ?? '—' },
                    { icon: <BookOpen size={14} />, label: t('courseDetails.department', 'Department'), value: course.department ?? '—' },
                    { icon: <TrendingUp size={14} />, label: t('courseDetails.credits', 'Credits'), value: `${course.credits ?? '—'}` },
                    { icon: <Calendar size={14} />, label: t('courseDetails.semester', 'Semester'), value: course.semester ?? '—' },
                ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ color: 'var(--primary)', flexShrink: 0 }}>{item.icon}</div>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</div>
                            <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 500 }}>{item.value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
