import { ExamResultData } from '../types';
import { CheckCircle, AlertCircle, CheckCircle2, XCircle, Clock, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ResultHeaderProps {
    data: ExamResultData;
}

export default function ResultHeader({ data }: ResultHeaderProps) {
    const { t } = useTranslation('common');
    // ── SVG Radial Gauge ──────────────────────────────────────────────────────
    // r=45 in a 100×100 viewBox → circumference = 2π×45 ≈ 282.74
    const CIRCUM = 2 * Math.PI * 45;
    // offset = how much of the stroke to hide; 0 = full ring, CIRCUM = empty ring
    const strokeDashoffset = CIRCUM * (1 - Math.min(data.percentage, 100) / 100);
    const gaugeColor = data.isPassed ? '#10b981' : '#ef4444';
    const glowColor = data.isPassed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)';

    return (
        <div className="glass-card" style={{
            padding: '2rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute', top: '-50%', left: '50%',
                transform: 'translate(-50%, 0)',
                width: '300px', height: '300px',
                background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                zIndex: 0, pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '2rem', fontWeight: 600 }}>
                    {data.isPassed ? t('examResult.header.excellentWork') : t('examResult.header.needsImprovement')}
                </h2>

                {/* ── Gauge ─────────────────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '1rem' }}>
                        <svg width="160" height="160" viewBox="0 0 100 100">
                            {/* Visible track ring */}
                            <circle
                                cx="50" cy="50" r="45" fill="none"
                                stroke="rgba(255,255,255,0.12)"
                                strokeWidth="9"
                            />
                            {/* Subtle inner glow ring */}
                            <circle
                                cx="50" cy="50" r="45" fill="none"
                                stroke={gaugeColor}
                                strokeWidth="9"
                                strokeOpacity="0.08"
                                strokeDasharray={CIRCUM}
                                strokeDashoffset="0"
                            />
                            {/* Progress arc */}
                            <circle
                                cx="50" cy="50" r="45" fill="none"
                                stroke={gaugeColor}
                                strokeWidth="9"
                                strokeDasharray={CIRCUM}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                            />
                        </svg>

                        {/* Centre label */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: '2px'
                        }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, color: gaugeColor }}>
                                {data.percentage}%
                            </div>
                            <div style={{ color: gaugeColor, display: 'flex', alignItems: 'center' }}>
                                {data.isPassed
                                    ? <CheckCircle size={20} strokeWidth={2} />
                                    : <AlertCircle size={20} strokeWidth={2} />}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                {data.isPassed ? t('examResult.header.passed') : t('examResult.header.failed')}
                            </div>
                        </div>
                    </div>

                    <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {data.studentScore} / {data.totalScore} {t('examResult.header.points')}
                    </div>
                </div>

                {/* ── Stats Grid ────────────────────────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: '0.75rem',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.06)'
                }}>
                    {[
                        {
                            icon: <CheckCircle2 size={16} />,
                            label: t('examResult.stats.correct'),
                            value: data.correctAnswers,
                            color: '#10b981'
                        },
                        {
                            icon: <XCircle size={16} />,
                            label: t('examResult.stats.wrong'),
                            value: data.wrongAnswers,
                            color: '#ef4444'
                        },
                        {
                            icon: <Clock size={16} />,
                            label: t('examResult.stats.skipped'),
                            value: data.skippedAnswers ?? 0,
                            color: '#94a3b8'
                        },
                        {
                            icon: <Clock size={16} />,
                            label: t('examResult.stats.time'),
                            value: data.timeSpent,
                            color: '#f59e0b'
                        },
                        {
                            icon: <Trophy size={16} />,
                            label: t('examResult.stats.rank'),
                            value: data.rank,
                            color: '#3b82f6'
                        },
                    ].map(stat => (
                        <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ color: stat.color, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 500 }}>
                                {stat.icon} {stat.label}
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
