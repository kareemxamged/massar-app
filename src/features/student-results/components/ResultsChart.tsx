import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import styles from '../../../pages/student/StudentResults.module.css';

interface ResultsChartProps {
    results: any[];
}

export default function ResultsChart({ results }: ResultsChartProps) {
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';

    return (
        <div className={`glass-card ${styles.chartCard}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
            <h3 className={styles.chartHeader}>
                <span className={styles.chartHeaderIcon}><TrendingUp size={24} /></span> {t('studentResults.chart.title', 'Performance Trend')}
            </h3>
            <div className={styles.chartWrapper}>
                {results.length > 1 ? (
                    <div className={styles.chartContainer} style={{ direction: 'ltr' /* Recharts needs LTR block to render correctly, but we can reverse the XAxis if we want, or just leave it LTR since dates progress rightward */ }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[...results].reverse()} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    reversed={isRtl} // Automatically flip axis for RTL
                                    tickFormatter={(tValue) => new Date(tValue).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                                    stroke="rgba(255,255,255,0.2)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    stroke="rgba(255,255,255,0.2)"
                                    orientation={isRtl ? 'right' : 'left'}
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', direction: isRtl ? 'rtl' : 'ltr' }}
                                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}
                                    formatter={(value: any) => [`${value}%`, t('studentResults.chart.score', 'Score')]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="percentage"
                                    stroke="url(#colorScore)"
                                    strokeWidth={4}
                                    dot={{ fill: 'var(--bg-card)', stroke: '#8b5cf6', strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 7, fill: '#6366f1', stroke: 'white' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : results.length === 1 ? (
                    <div className={styles.singleResultPlaceholder}>
                        <svg viewBox="0 0 1000 300" style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none' }}>
                            <path d="M 0 300 Q 250 150 500 200 T 1000 50" fill="none" stroke="url(#placeholderGradient)" strokeWidth="4" />
                            <defs>
                                <linearGradient id="placeholderGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className={styles.placeholderCard}>
                            <TrendingUp size={36} color="#8b5cf6" />
                            <h4 className={styles.placeholderTitle}>{t('studentResults.chart.baselineTitle', 'Baseline Established')}</h4>
                            <p className={styles.placeholderText}>
                                {t('studentResults.chart.baselineText1', 'You scored')} <strong>{results[0].percentage}%</strong> {t('studentResults.chart.baselineText2', 'on your first exam. Take more exams to unlock live trend tracking!')}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyChart}>
                        <div style={{ opacity: 0.3 }}><TrendingUp size={48} /></div>
                        {t('studentResults.chart.emptyChart', 'Insufficient data. Take your first exam to view statistics.')}
                    </div>
                )}
            </div>
        </div>
    );
}
