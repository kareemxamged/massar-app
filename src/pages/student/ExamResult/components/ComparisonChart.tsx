import { ExamResultData } from '../types';
import { useTranslation } from 'react-i18next';

interface ComparisonChartProps {
    data: ExamResultData;
}

export default function ComparisonChart({ data }: ComparisonChartProps) {
    const { t, i18n } = useTranslation('common');
    const youPct = Math.min(data.percentage, 100);
    const avgPct = Math.min(data.classAverage ?? 75, 100);
    const youColor = data.isPassed ? '#10b981' : '#ef4444';
    const avgColor = '#3b82f6';

    const renderBar = (label: string, pct: number, color: string, sublabel: string) => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: color, flexShrink: 0
                    }} />
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{label}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sublabel}</span>
                </div>
                <span style={{ fontWeight: 700, color, fontSize: '1rem' }}>{pct}%</span>
            </div>
            {/* Bar track */}
            <div style={{
                height: '28px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                overflow: 'hidden', position: 'relative'
            }}>
                {/* Filled portion — minWidth ensures always visible */}
                <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    minWidth: pct > 0 ? '28px' : '4px',   // always visible
                    background: `linear-gradient(to ${i18n.dir() === 'rtl' ? 'left' : 'right'}, ${color}cc, ${color})`,
                    borderRadius: '8px',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex', alignItems: 'center', justifyContent: i18n.dir() === 'rtl' ? 'flex-start' : 'flex-end',
                    paddingInlineEnd: '8px'
                }}>
                    {pct >= 12 && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>
                            {pct}%
                        </span>
                    )}
                </div>
                {/* Tick marks at 25 / 50 / 75 */}
                {[25, 50, 75].map(tick => (
                    <div key={tick} style={{
                        position: 'absolute', top: 0, bottom: 0,
                        [i18n.dir() === 'rtl' ? 'right' : 'left']: `${tick}%`, width: '1px',
                        background: 'rgba(255,255,255,0.08)',
                        pointerEvents: 'none'
                    }} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.6rem', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 600 }}>
                {t('examResult.chart.title')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {renderBar(t('examResult.chart.you'), youPct, youColor, `(${data.studentScore}/${data.totalScore} pts)`)}
                {renderBar(t('examResult.chart.classAvg'), avgPct, avgColor, `(${data.classAverage ?? 75}%)`)}
            </div>

            {/* Percentile callout */}
            {data.percentile != null && (
                <div style={{
                    marginTop: '1.25rem', padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.85rem', color: 'var(--text-muted)'
                }}>
                    <span style={{ fontSize: '1rem' }}>📊</span>
                    {t('examResult.chart.percentileMsg1')} <strong style={{ color: 'white' }}>{data.percentile}%</strong> {t('examResult.chart.percentileMsg2')}
                </div>
            )}
        </div>
    );
}
