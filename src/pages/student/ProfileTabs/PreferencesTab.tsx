import { Globe, Moon, Sun, Bell, BellOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from '../StudentProfile.module.css';

export default function PreferencesTab() {
    const { i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');

    const txt = isRtl ? {
        title: 'التفضيلات العامة',
        subtitle: 'قم بتخصيص تجربة العرض الخاصة بك.',
        language: 'اللغة',
        langDesc: 'لغة واجهة العرض',
        appearance: 'المظهر',
        appDesc: 'تفضیلات السمة',
        dark: 'داكن',
        light: 'مضيء',
        emailNotif: 'إشعارات البريد الإلكتروني',
        emailDesc: 'احصل على إشعارات عند توفر امتحانات جديدة',
        enabled: 'مُفعل',
        pushNotif: 'إشعارات عبر المتصفح',
        pushDesc: 'تنبيهات سطح المكتب للمتصفح (قريباً)',
        disabled: 'مُعطل'
    } : {
        title: 'Global Preferences',
        subtitle: 'Customize your viewing experience.',
        language: 'Language',
        langDesc: 'Interface display language',
        appearance: 'Appearance',
        appDesc: 'Theme preference',
        dark: 'Dark',
        light: 'Light',
        emailNotif: 'Email Notifications',
        emailDesc: 'Get notified when new exams are available',
        enabled: 'Enabled',
        pushNotif: 'Push Notifications',
        pushDesc: 'Browser desktop push alerts (coming soon)',
        disabled: 'Disabled'
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className="text-start">
                    <h3 className={styles.cardTitle}>{txt.title}</h3>
                    <p className={styles.cardSubtitle}>{txt.subtitle}</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Language */}
                <div className={styles.securityCard} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                        <div className={styles.securityIconBox} style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                            <Globe size={22} />
                        </div>
                        <div className="text-start">
                            <h4 style={{ color: 'white', margin: 0 }}>{txt.language}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{txt.langDesc}</p>
                        </div>
                    </div>
                    <select className={styles.input} style={{ width: '100%' }} defaultValue={isRtl ? "ar" : "en"} onChange={(e) => i18n.changeLanguage(e.target.value)}>
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
                        <div className="text-start">
                            <h4 style={{ color: 'white', margin: 0 }}>{txt.appearance}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{txt.appDesc}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', width: '100%', background: 'rgba(15,23,42,0.6)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {[
                            { label: txt.dark, icon: <Moon size={14} /> },
                            { label: txt.light, icon: <Sun size={14} /> },
                        ].map((opt, i) => (
                            <button key={opt.label}
                                style={{
                                    flex: 1, padding: '8px', borderRadius: '8px',
                                    background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: i === 0 ? 'white' : 'var(--text-muted)',
                                    border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
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
                        <div className={`${styles.securityInfo} text-start`}>
                            <h4>{txt.emailNotif}</h4>
                            <p>{txt.emailDesc}</p>
                        </div>
                    </div>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem', borderRadius: '8px',
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                        color: '#10b981', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                    }}>
                        <Bell size={14} /> {txt.enabled}
                    </button>
                </div>

                <div className={styles.securityCard}>
                    <div className={styles.securityContent}>
                        <div className={styles.securityIconBox} style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                            <BellOff size={22} />
                        </div>
                        <div className={`${styles.securityInfo} text-start`}>
                            <h4>{txt.pushNotif}</h4>
                            <p>{txt.pushDesc}</p>
                        </div>
                    </div>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-muted)', cursor: 'not-allowed', fontSize: '0.85rem', fontWeight: 600
                    }} disabled>
                        <BellOff size={14} /> {txt.disabled}
                    </button>
                </div>

            </div>
        </div>
    );
}
