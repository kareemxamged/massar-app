import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isAr = i18n.language.startsWith('ar');

  const toggle = async () => {
    const next = isAr ? 'en' : 'ar';
    await i18n.changeLanguage(next);

    if (user?.id) {
      await supabase
        .from('profiles')
        .update({ preferred_language: next })
        .eq('id', user.id);
    }
  };

  return (
    <button
      onClick={() => { void toggle(); }}
      title={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.05)',
        color: 'var(--text-main)',
        fontSize: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
        letterSpacing: '0.03em',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.15)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.4)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
      }}
    >
      <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{isAr ? '🇬🇧' : '🇸🇦'}</span>
      <span style={{ fontFamily: isAr ? "'Inter', sans-serif" : "'Cairo', sans-serif" }}>
        {isAr ? 'EN' : 'ع'}
      </span>
    </button>
  );
}
