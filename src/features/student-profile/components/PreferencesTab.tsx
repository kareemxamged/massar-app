import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sun, Bell, BellOff } from 'lucide-react';
import styles from '../../../pages/student/StudentProfile.module.css';

export default function PreferencesTab() {
    const { t, i18n } = useTranslation('common');

    return (
        <div className={styles.card} style={{ direction: i18n.dir() }}>
            <div className={styles.cardHeader}>
                <div>
                    <h3 className={styles.cardTitle}>{t('studentProfile.preferencesTab.title', 'Global Preferences')}</h3>
                    <p className={styles.cardSubtitle}>{t('studentProfile.preferencesTab.subtitle', 'Customize your viewing experience.')}</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Language */}
                <div className={styles.securityCard} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                        <div className={styles.securityIconBox} style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                            <Globe size={22} />
                        </div>
                        <div>
                            <h4 style={{ color: 'white', margin: 0 }}>{t('studentProfile.preferencesTab.language', 'Language')}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{t('studentProfile.preferencesTab.languageDesc', 'Interface display language')}</p>
                        </div>
                    </div>
                    {/* The value/onChange should ideally hook into i18n.changeLanguage */}
                    <select
                        className={styles.input}
                        style={{ width: '100%' }}
                        value={i18n.language.startsWith('ar') ? 'ar' : 'en'}
                        onChange={(e) => i18n.changeLanguage(e.target.value)}
                    >
                        <option value="en">English (US)</option>
                        <option value="ar">العربية</option>
                    </select>
                </div>

                {/* Theme */}
                <div className={styles.securityCard} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                        <div className={styles.securityIconBox} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                            <Moon size={22} />
                        </div>
                        <div>
                            <h4 style={{ color: 'white', margin: 0 }}>{t('studentProfile.preferencesTab.appearance', 'Appearance')}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{t('studentProfile.preferencesTab.appearanceDesc', 'Theme preference')}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', width: '100%', background: 'rgba(15,23,42,0.6)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {[
                            { label: t('studentProfile.preferencesTab.dark', 'Dark'), icon: <Moon size={14} /> },
                            { label: t('studentProfile.preferencesTab.light', 'Light'), icon: <Sun size={14} /> },
                        ].map((opt, i) => (
                            <button key={opt.label}
                                style={{
                                    flex: 1, padding: '8px', borderRadius: '8px',
                                    background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: i === 0 ? 'white' : 'var(--text-muted)',
                                    border: 'none', cursor: i === 0 ? 'default' : 'pointer', fontSize: '0.9rem', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                    transition: 'all 0.2s'
                                }}>
                                {opt.icon} {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications */}
                <div className={styles.securityCard}>
                    <div className={styles.securityContent}>
                        <div className={styles.securityIconBox} style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                            <Bell size={22} />
                        </div>
                        <div className={styles.securityInfo}>
                            <h4>{t('studentProfile.preferencesTab.notifications', 'Email Notifications')}</h4>
                            <p>{t('studentProfile.preferencesTab.notifDesc', 'Get notified when new exams are available')}</p>
                        </div>
                    </div>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem', borderRadius: '8px',
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                        color: '#10b981', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                    }}>
                        <Bell size={14} /> {t('studentProfile.preferencesTab.enabled', 'Enabled')}
                    </button>
                </div>

                <div className={styles.securityCard}>
                    <div className={styles.securityContent}>
                        <div className={styles.securityIconBox} style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                            <BellOff size={22} />
                        </div>
                        <div className={styles.securityInfo}>
                            <h4>{t('studentProfile.preferencesTab.pushNotif', 'Push Notifications')}</h4>
                            <p>{t('studentProfile.preferencesTab.pushNotifDesc', 'Browser desktop push alerts (coming soon)')}</p>
                        </div>
                    </div>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-muted)', cursor: 'not-allowed', fontSize: '0.85rem', fontWeight: 600
                    }} disabled>
                        <BellOff size={14} /> {t('studentProfile.securityTab.disabled', 'Disabled')}
                    </button>
                </div>

            </div>
        </div>
    );
}
