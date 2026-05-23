import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ExamItem } from '../types';
import { StatusTag, MiniBar } from './SharedMetrics';
import { getExamStatus, gradeColor } from '../utils';
import { BookMarked, Calendar, Clock, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

interface ExamsTabProps {
    groupedExams: Record<string, ExamItem[]>;
    allExamsLength: number;
    panelStyle: React.CSSProperties;
    tabKey: number;
}

export default function ExamsTab({ groupedExams, allExamsLength, panelStyle, tabKey }: ExamsTabProps) {
    const { t, i18n } = useTranslation('common');
    const navigate = useNavigate();
    const isRtl = i18n.dir() === 'rtl';

    return (
        <div key={`ex-${tabKey}`} style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: '2rem', direction: i18n.dir() }}>
            {allExamsLength === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <BookMarked size={32} style={{ opacity: 0.3, marginBottom: '0.75rem', display: 'block', margin: '0 auto' }} />
                    <div>{t('courseDetails.exams.noExams', 'No exams for this course yet.')}</div>
                </div>
            ) : Object.entries(groupedExams).map(([month, exams]) => (
                <div key={month}>
                    <div style={{
                        fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        marginBottom: '0.75rem', paddingBottom: '0.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.06)'
                    }}>{month}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {exams.map(exam => {
                            const status = getExamStatus(exam);
                            const pct = exam.user_score != null
                                ? Math.round(exam.user_score / (exam.total_marks || 100) * 100) : null;
                            return (
                                <div key={exam.id} className="glass-card" style={{
                                    padding: '1.25rem 1.5rem',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                                    opacity: status === 'completed' && exam.user_status !== 'submitted' ? 0.6 : 1
                                }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 600, color: 'white', fontSize: '1rem' }}>{exam.title}</span>
                                            <StatusTag status={status} />
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', display: 'flex', gap: '1rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Calendar size={12} /> {exam.start_time ? new Date(exam.start_time).toLocaleDateString() : t('courseDetails.exams.alwaysAvailable', 'Always Available')}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={12} /> {exam.duration_minutes} {t('courseDetails.exams.min', 'min')}</span>
                                            <span>{exam.total_questions} {t('courseDetails.exams.questions', 'Questions')}</span>
                                        </div>
                                        {status === 'submitted' && pct !== null && (
                                            <MiniBar pct={pct} />
                                        )}
                                    </div>
                                    <div style={{ flexShrink: 0 }}>
                                        {status === 'submitted' ? (
                                            <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: gradeColor(pct ?? 0), direction: 'ltr' }}>
                                                    {exam.user_score} / {exam.total_marks || 100}
                                                </div>
                                                <button style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                                                    onClick={() => navigate(`/student/exams/${exam.id}/result`)}>
                                                    {t('courseDetails.exams.viewResult', 'View Result')} {isRtl ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                                                </button>
                                            </div>
                                        ) : status === 'active' ? (
                                            <button className="btn-primary"
                                                style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem', justifyContent: 'center' }}
                                                onClick={() => navigate(`/student/exams/${exam.id}`)}>
                                                {t('courseDetails.exams.startNow', 'Start Now')} {isRtl ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                                            </button>
                                        ) : status === 'upcoming' ? (
                                            <button disabled style={{
                                                padding: '0.5rem 1.25rem', fontSize: '0.85rem',
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'var(--text-muted)', borderRadius: '8px', cursor: 'not-allowed',
                                                display: 'flex', alignItems: 'center', gap: '5px'
                                            }}>
                                                <Lock size={13} /> {t('courseDetails.exams.locked', 'Locked')}
                                            </button>
                                        ) : (
                                            <button style={{
                                                padding: '0.5rem 1.25rem', fontSize: '0.85rem',
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                                color: 'var(--text-muted)', borderRadius: '8px', cursor: 'default'
                                            }}>
                                                {t('courseDetails.exams.missed', 'Missed')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
