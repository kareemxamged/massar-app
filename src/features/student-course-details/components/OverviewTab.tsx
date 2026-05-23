import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RadialProgress } from './SharedMetrics';
import { CourseData, ExamItem, Material, TabId } from '../types';
import { gradeColor } from '../utils';
import { Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

interface OverviewTabProps {
    course: CourseData;
    pastResults: ExamItem[];
    materials: Material[];
    avgGrade: number;
    overallPct: number;
    allExams: ExamItem[];
    getExamStatus: (exam: ExamItem) => string;
    switchTab: (tab: TabId) => void;
    panelStyle: React.CSSProperties;
    tabKey: number;
}

const TYPE_META: Record<string, { color: string }> = {
    pdf: { color: '#ef4444' },
    video: { color: '#8b5cf6' },
    slides: { color: '#3b82f6' },
    link: { color: '#10b981' },
    code: { color: '#f59e0b' },
};

export default function OverviewTab({
    course, pastResults, materials, avgGrade, overallPct,
    allExams, getExamStatus, switchTab, panelStyle, tabKey
}: OverviewTabProps) {
    const { t, i18n } = useTranslation('common');
    const navigate = useNavigate();
    const isRtl = i18n.dir() === 'rtl';

    return (
        <div key={`ov-${tabKey}`} style={{ ...panelStyle, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', direction: i18n.dir() }}>
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Description */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'white', margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600 }}>
                        {t('courseDetails.overview.aboutCourse', 'About This Course')}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', margin: 0, fontSize: '0.95rem' }}>
                        {course.description ?? t('courseDetails.overview.noDescription', 'No description provided.')}
                    </p>
                </div>

                {/* Course Health / Performance */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem 0', color: 'white', fontSize: '1rem', fontWeight: 600 }}>
                        {t('courseDetails.overview.courseHealth', 'Course Health')}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <RadialProgress value={avgGrade} size={120} stroke={10} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { label: t('courseDetails.overview.averageGrade', 'Average Grade'), value: course.performance?.grade ?? overallPct, color: gradeColor(course.performance?.grade ?? overallPct) },
                                { label: t('courseDetails.overview.attendance', 'Attendance'), value: course.performance?.attendance ?? 0, color: '#3b82f6' },
                                { label: t('courseDetails.overview.participation', 'Participation'), value: course.performance?.participation ?? 0, color: '#8b5cf6' },
                            ].map(stat => (
                                <div key={stat.label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{stat.label}</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: stat.color, direction: 'ltr' }}>{stat.value}%</span>
                                    </div>
                                    <div style={{ height: '5px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)' }}>
                                        <div style={{ width: `${stat.value}%`, height: '100%', borderRadius: '99px', background: stat.color, transition: 'width 1s ease', direction: 'ltr' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Results */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'white', margin: 0, fontSize: '1rem', fontWeight: 600 }}>{t('courseDetails.overview.recentResults', 'Recent Results')}</h3>
                        <button style={{ fontSize: '0.82rem', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '3px' }}
                            onClick={() => switchTab('grades')}>
                            {t('courseDetails.overview.viewAll', 'View All')} {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {pastResults.length > 0 ? pastResults.slice(0, 3).map(res => (
                            <div key={res.id} className="glass-card" style={{ padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 500, color: 'white', fontSize: '0.93rem' }}>{res.title}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{res.start_time ? new Date(res.start_time).toLocaleDateString() : 'Always Available'}</div>
                                </div>
                                <div style={{ textAlign: isRtl ? 'left' : 'right', direction: 'ltr' }}>
                                    <div style={{ fontWeight: 700, color: gradeColor(Math.round((res.user_score ?? 0) / res.total_marks * 100)) }}>
                                        {res.user_score ?? 0} / {res.total_marks || 100}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: isRtl ? 'left' : 'right' }}>
                                        {Math.round((res.user_score ?? 0) / res.total_marks * 100)}%
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('courseDetails.overview.noResults', 'No results yet.')}</div>
                        )}
                    </div>
                </div>

                {/* Materials preview */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'white', margin: 0, fontSize: '1rem', fontWeight: 600 }}>{t('courseDetails.overview.courseMaterials', 'Course Materials')}</h3>
                        <button style={{ fontSize: '0.82rem', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '3px' }}
                            onClick={() => switchTab('materials')}>
                            {t('courseDetails.overview.viewAll', 'View All')} ({materials.length}) {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {materials.length > 0 ? materials.slice(0, 4).map(mat => {
                            const meta = TYPE_META[mat.type] ?? TYPE_META.link;
                            return (
                                <div key={mat.id} style={{
                                    padding: '0.9rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
                                    border: '1px solid rgba(255,255,255,0.06)'
                                }}>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.88rem', color: 'white', fontWeight: 500 }}>{mat.title}</div>
                                        <div style={{ fontSize: '0.73rem', color: meta.color, fontWeight: 600 }}>{t(`courseDetails.materials.type.${mat.type}`, mat.type)}</div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ color: 'var(--text-muted)', gridColumn: 'span 2', fontSize: '0.9rem' }}>{t('courseDetails.overview.noMaterials', 'No materials yet.')}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div>
                <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
                    <h3 style={{ margin: '0 0 1.25rem 0', color: 'white', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={15} style={{ color: 'var(--primary)' }} /> {t('courseDetails.upcomingExams', 'Upcoming Exams')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {allExams.filter(e => getExamStatus(e) === 'upcoming').length > 0
                            ? allExams.filter(e => getExamStatus(e) === 'upcoming').slice(0, 3).map(exam => (
                                <div key={exam.id} style={{
                                    padding: '1rem', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'
                                }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'white', fontSize: '0.9rem' }}>{exam.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <Calendar size={12} /> {exam.start_time ? new Date(exam.start_time).toLocaleDateString() : t('courseDetails.exams.alwaysAvailable', 'Always Available')}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            {exam.duration_minutes} {t('courseDetails.exams.min', 'min')}
                                        </span>
                                    </div>
                                    <button className="btn-primary"
                                        style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', justifyContent: 'center' }}
                                        onClick={() => navigate(`/student/exams/${exam.id}`)}>
                                        {t('courseDetails.viewDetails', 'View Details')}
                                    </button>
                                </div>
                            ))
                            : <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('courseDetails.noUpcomingExams', 'No upcoming exams.')}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
