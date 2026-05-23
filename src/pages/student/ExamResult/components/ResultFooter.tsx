import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExamResultData } from '../types';
import { ClipboardList, RotateCcw, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ResultFooterProps {
    data: ExamResultData;
}

export default function ResultFooter({ data }: ResultFooterProps) {
    const navigate = useNavigate();
    const { id } = useParams();
    const [showRetryModal, setShowRetryModal] = useState(false);
    const { t } = useTranslation('common');

    // 3. Handle Retry Logic
    const handleRetry = () => {
        if (data.allowRetry) {
            navigate(`/student/exams/${id}/take`);
        } else {
            setShowRetryModal(true);
        }
    };

    return (
        <>
            <div className="result-footer-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                <style>
                    {`
                        @media print {
                            .result-footer-actions { display: none !important; }
                        }
                        
                        /* Button Animations & Hovers */
                        .result-btn {
                            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                            transform: scale(1);
                        }
                        .result-btn:hover {
                            transform: translateY(-2px);
                            filter: brightness(1.2);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                        }
                        .result-btn:active {
                            transform: scale(0.98);
                        }

                        /* Specific Button Colors */
                        .btn-download {
                            background: rgba(51, 65, 85, 0.5) !important;
                            color: #e2e8f0 !important;
                            border: 1px solid rgba(255,255,255,0.1) !important;
                        }
                        .btn-review {
                            background: var(--primary) !important;
                            color: white !important;
                            border: none !important;
                            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                        }
                        .btn-email {
                            background: rgba(139, 92, 246, 0.2) !important;
                            color: #c4b5fd !important;
                            border: 1px solid rgba(139, 92, 246, 0.3) !important;
                        }
                        .btn-retry {
                            background: rgba(234, 179, 8, 0.2) !important;
                            color: #fde047 !important;
                            border: 1px solid rgba(234, 179, 8, 0.3) !important;
                        }
                    `}
                </style>

                <button
                    onClick={() => navigate(`/student/exams/${id}/review`)}
                    className="btn-primary result-btn btn-review"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '3rem', cursor: 'pointer', minWidth: '160px',
                        padding: '0 1.5rem', borderRadius: '0.5rem', fontWeight: 500
                    }}
                >
                    <ClipboardList size={18} />
                    {t('examReview.reviewAnswers', 'Review Answers')}
                </button>

                <button
                    onClick={handleRetry}
                    className="btn-secondary result-btn btn-retry"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '3rem', cursor: 'pointer',
                        padding: '0 1.5rem', borderRadius: '0.5rem', fontWeight: 500
                    }}
                >
                    <RotateCcw size={18} />
                    {t('examReview.retryExam', 'Retry Exam')}
                </button>
            </div>

            {/* Default Retry Modal */}
            {showRetryModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowRetryModal(false)}>
                    <div className="glass-card" style={{
                        width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            <Lock size={40} style={{ opacity: 0.6 }} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Retry Not Allowed</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            This exam is set to one-time only. You cannot retake it at this moment. Please contact your instructor for more information.
                        </p>
                        <button
                            className="btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => setShowRetryModal(false)}
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
