import { useTranslation } from 'react-i18next';
import { Trophy, TrendingUp, Target, Clock } from 'lucide-react';
import styles from '../../../pages/student/StudentResults.module.css';

interface ResultsHeaderProps {
    totalExams: number;
    avgScore: number;
    highestScore: number;
    lowestScore: number;
}

export default function ResultsHeader({ totalExams, avgScore, highestScore, lowestScore }: ResultsHeaderProps) {
    const { t, i18n } = useTranslation('common');

    return (
        <div style={{ direction: i18n.dir() }}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>{t('studentResults.pageTitle', 'My Results')}</h1>
                <p className={styles.pageSubtitle}>{t('studentResults.pageSubtitle', 'Track your progress and analyze your performance.')}</p>
            </div>

            <div className={`glass-card ${styles.statsCard}`}>
                <h3 className={styles.statsHeader}>{t('studentResults.stats.header', 'General Statistics')}</h3>
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>{t('studentResults.stats.overallAverage', 'Overall Average')}</div>
                        <div className={`${styles.statValue} ${avgScore >= 75 ? styles.statValueGreen : avgScore >= 50 ? '' : styles.statValueRed}`} style={{ color: avgScore >= 75 ? '#10b981' : avgScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                            {avgScore}%
                        </div>
                    </div>
                    <div className={`${styles.statItem} ${styles.statItemBordered}`}>
                        <div className={styles.statLabel}>{t('studentResults.stats.totalExams', 'Total Exams')}</div>
                        <div className={`${styles.statValue} ${styles.statValueWhite}`}>
                            {totalExams}
                        </div>
                    </div>
                    <div className={`${styles.statItem} ${styles.statItemBordered}`}>
                        <div className={styles.statLabel}>{t('studentResults.stats.highestScore', 'Highest Score')}</div>
                        <div className={`${styles.statValue} ${styles.statValueGreen}`}>
                            {highestScore}%
                        </div>
                    </div>
                    <div className={`${styles.statItem} ${styles.statItemBordered}`}>
                        <div className={styles.statLabel}>{t('studentResults.stats.lowestScore', 'Lowest Score')}</div>
                        <div className={`${styles.statValue} ${styles.statValueRed}`}>
                            {lowestScore}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Stats Grid relocated here for grouping all stats */}
            <div className={styles.bottomStatsGrid} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                <StatCard icon={<Trophy size={32} />} title={t('studentResults.stats.topResult', 'Top Result')} value={`${highestScore}%`} subtext={t('studentResults.stats.bestPerformance', 'Best performance yet')} color="#fbbf24" />
                <StatCard icon={<TrendingUp size={32} />} title={t('studentResults.stats.progress', 'Progress')} value="+12%" subtext={t('studentResults.stats.vsLastMonth', 'vs last month')} color="#3b82f6" />
                <StatCard icon={<Target size={32} />} title={t('studentResults.stats.accuracy', 'Accuracy')} value="88%" subtext={t('studentResults.stats.correctAnswers', 'Correct answers')} color="#10b981" />
                <StatCard icon={<Clock size={32} />} title={t('studentResults.stats.avgSpeed', 'Avg Speed')} value="35m" subtext={t('studentResults.stats.perExam', 'Per exam')} color="#8b5cf6" />
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, subtext, color }: any) {
    return (
        <div className={`glass-card ${styles.statCard}`}>
            <div className={styles.statCardGlow} style={{ background: color }} />
            <div className={styles.statCardIcon} style={{ color: color }}>
                {icon}
            </div>
            <div className={styles.statCardTitle}>{title}</div>
            <div className={styles.statCardValue}>{value}</div>
            <div className={styles.statCardSubtext}>{subtext}</div>
        </div>
    );
}
