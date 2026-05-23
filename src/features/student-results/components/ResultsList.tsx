import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import styles from '../../../pages/student/StudentResults.module.css';

interface ResultsListProps {
    filteredResults: any[];
}

export default function ResultsList({ filteredResults }: ResultsListProps) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';

    if (filteredResults.length === 0) {
        return (
            <div className={`glass-card ${styles.emptyState}`} style={{ direction: i18n.dir() }}>
                <div className={styles.emptyIconCircle}>
                    <AlertCircle size={40} />
                </div>
                <h3 className={styles.emptyTitle}>{t('studentResults.list.emptyTitle', 'No Results Found')}</h3>
                <p className={styles.emptyText}>
                    {t('studentResults.list.emptyText', "We couldn't find any exams matching your current search or filter criteria. Try adjusting your filters to see more results.")}
                </p>
            </div>
        );
    }

    return (
        <div className={styles.resultsList} style={{ direction: i18n.dir() }}>
            {filteredResults.map((result) => {
                const isPassed = result.percentage >= 50;

                // Format date locale-aware
                const formattedDate = new Date(result.date).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US');
                const subject = result.subject || t('studentResults.list.general', 'General');

                return (
                    <div key={result.id} className={`glass-card ${styles.resultCard}`}>
                        <div className={styles.resultHeader}>
                            <div>
                                <h3 className={styles.resultTitle}>{result.title}</h3>
                                <div className={styles.resultMeta}>
                                    {formattedDate} • {subject}
                                </div>
                            </div>
                            <div className={styles.resultScore}>
                                <div className={styles.scoreValue} style={{ color: result.percentage >= 80 ? '#10b981' : result.percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                                    {result.percentage}%
                                </div>
                                <div className={`${styles.statusBadge} ${isPassed ? styles.statusPassed : styles.statusFailed}`}>
                                    {isPassed ? t('studentResults.list.passed', 'Passed') : t('studentResults.list.failed', 'Failed')}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${result.percentage}%`,
                                    background: result.percentage >= 80 ? '#10b981' : result.percentage >= 50 ? '#f59e0b' : '#ef4444'
                                }}
                            />
                        </div>

                        {/* Actions */}
                        <div className={styles.actions}>
                            <button
                                onClick={() => navigate(`/student/exams/${result.examId}/result`)}
                                className={styles.viewDetailsBtn}
                            >
                                {t('studentResults.list.viewDetails', 'View Details')}
                            </button>
                            <button
                                onClick={() => navigate(`/student/exams/${result.examId}/review`)}
                                className={`btn-primary ${styles.reviewBtn}`}
                            >
                                {t('studentResults.list.reviewAnswers', 'Review Answers')}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
