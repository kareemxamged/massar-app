import { useTranslation } from 'react-i18next';

interface ExamFooterProps {
    onNext: () => void;
    onPrev: () => void;
    onFlag: () => void;
    onOverview: () => void;
    isFirst: boolean;
    isLast: boolean;
    isFlagged: boolean;
}

export default function ExamFooter({
    onNext,
    onPrev,
    onFlag,
    onOverview,
    isFirst,
    isLast,
    isFlagged
}: ExamFooterProps) {
    const { t, i18n } = useTranslation('common');
    return (
        <footer className="glass-card" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            padding: '1rem 2rem',
            borderRadius: 0,
            borderBottom: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>

            {/* Left: Previous */}
            <button
                onClick={onPrev}
                disabled={isFirst}
                className="btn-secondary"
                style={{
                    minWidth: '120px',
                    opacity: isFirst ? 0.5 : 1,
                    cursor: isFirst ? 'not-allowed' : 'pointer',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}
            >
                {i18n.dir() === 'rtl' ? '→' : '←'} {t('examEngine.footer.previous')}
            </button>

            {/* Center: Flag & Summary Trigger */}
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={onOverview}
                    style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid #3b82f6',
                        color: '#60a5fa',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span>📋</span>
                    <span className="hidden-mobile">{t('examEngine.footer.overview')}</span>
                </button>

                <button
                    onClick={onFlag}
                    style={{
                        background: 'transparent',
                        border: '1px solid ' + (isFlagged ? '#f59e0b' : 'rgba(255,255,255,0.2)'),
                        color: isFlagged ? '#f59e0b' : 'var(--text-primary)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span>{isFlagged ? '★' : '☆'}</span>
                    <span className="hidden-mobile">{isFlagged ? t('examEngine.footer.marked') : t('examEngine.footer.mark')}</span>
                </button>
            </div>

            {/* Right: Next or Finish */}
            <button
                onClick={isLast ? onOverview : onNext}
                className={isLast ? "btn-danger" : "btn-primary"}
                style={{
                    minWidth: '120px',
                    background: isLast ? '#ef4444' : '',
                    borderColor: isLast ? '#ef4444' : '',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}
            >
                {isLast ? t('examEngine.footer.finish') : <>{t('examEngine.footer.next')} {i18n.dir() === 'rtl' ? '←' : '→'}</>}
            </button>

        </footer>
    );
}
