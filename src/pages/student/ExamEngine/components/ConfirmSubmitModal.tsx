import { useTranslation } from 'react-i18next';

interface ConfirmSubmitModalProps {
    onCancel: () => void;
    onConfirm: () => void;
    unansweredCount: number;
    timeLeft: number;
}

export default function ConfirmSubmitModal({
    onCancel,
    onConfirm,
    unansweredCount,
    timeLeft
}: ConfirmSubmitModalProps) {
    const { t, i18n } = useTranslation('common');
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 110, // Higher than summary
            direction: i18n.dir()
        }}>
            <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❓</div>
                <h2 style={{ marginBottom: '1rem' }}>{t('examEngine.confirm.title')}</h2>

                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {t('examEngine.confirm.warning')}
                </p>

                {/* Using a layout that supports auto-direction for the bullets */}
                <div style={{ textAlign: i18n.dir() === 'rtl' ? 'right' : 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <p style={{ direction: 'rtl', textAlign: i18n.dir() === 'rtl' ? 'right' : 'left' }}>
                        • {t('examEngine.confirm.minutesRemaining', { min: Math.floor(timeLeft / 60) })}
                    </p>
                    <p style={{ direction: 'rtl', textAlign: i18n.dir() === 'rtl' ? 'right' : 'left' }}>
                        • {t('examEngine.confirm.unanswered', { count: unansweredCount })}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                        style={{ flex: 1 }}
                    >
                        {t('examEngine.confirm.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn-primary"
                        style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444' }}
                    >
                        {t('examEngine.confirm.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
}
