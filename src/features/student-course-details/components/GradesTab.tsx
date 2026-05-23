import React from 'react';
import { useTranslation } from 'react-i18next';
import { MiniBar } from './SharedMetrics';
import { ExamItem } from '../types';
import { gradeColor, gradeLetter } from '../utils';
import { Trophy } from 'lucide-react';

interface GradesTabProps {
    pastResults: ExamItem[];
    earnedPts: number;
    totalPts: number;
    overallPct: number;
    panelStyle: React.CSSProperties;
    tabKey: number;
}

export default function GradesTab({ pastResults, earnedPts, totalPts, overallPct, panelStyle, tabKey }: GradesTabProps) {
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';

    return (
        <div key={`gr-${tabKey}`} style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: '1.25rem', direction: i18n.dir() }}>

            {/* Summary Dashboard Card */}
            <div className="glass-card" style={{
                padding: '1.5rem 2rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
                border: '1px solid rgba(99,102,241,0.2)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                            {t('courseDetails.grades.totalPoints', 'Total Points Earned')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem', direction: 'ltr', justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
                            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white' }}>{earnedPts}</span>
                            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ {totalPts}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', direction: 'ltr' }}>
                            <div style={{ flex: 1, height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', transform: isRtl ? 'scaleX(-1)' : 'none' }}>
                                <div style={{ width: `${overallPct}%`, height: '100%', borderRadius: '99px', background: `linear-gradient(to right, var(--primary), #8b5cf6)`, transition: 'width 1s ease' }} />
                            </div>
                            <span style={{ fontWeight: 700, color: gradeColor(overallPct), fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{overallPct}%</span>
                        </div>
                        {totalPts === 0 && (
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                {t('courseDetails.grades.noGrades', 'No grades available yet.')}
                            </div>
                        )}
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: gradeColor(overallPct), lineHeight: 1 }}>{gradeLetter(overallPct)}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {t('courseDetails.grades.grade', 'Grade')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Individual grade rows */}
            {pastResults.length > 0 ? pastResults.map(res => {
                const pct = Math.round((res.user_score ?? 0) / res.total_marks * 100);
                return (
                    <div key={res.id} className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.6rem' }}>
                            <div>
                                <div style={{ fontWeight: 600, color: 'white', fontSize: '0.97rem', marginBottom: '2px' }}>{res.title}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('courseDetails.grades.submittedOn', 'Submitted on')} {res.start_time ? new Date(res.start_time).toLocaleDateString() : ''}</div>
                            </div>
                            <div style={{ textAlign: isRtl ? 'left' : 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: gradeColor(pct), direction: 'ltr' }}>{res.user_score} / {res.total_marks}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: isRtl ? 'flex-start' : 'flex-end', marginTop: '2px' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pct}%</span>
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', borderRadius: '99px',
                                        color: gradeColor(pct), background: `${gradeColor(pct)}18`,
                                        border: `1px solid ${gradeColor(pct)}33`
                                    }}>{gradeLetter(pct)}</span>
                                </div>
                            </div>
                        </div>
                        <MiniBar pct={pct} />
                    </div>
                );
            }) : (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Trophy size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />
                    <div style={{ margin: '0' }}>{t('courseDetails.grades.noGrades', 'No grades available yet.')}</div>
                </div>
            )}
        </div>
    );
}
