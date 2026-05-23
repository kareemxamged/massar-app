import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const FONTS: Record<string, string> = {
  ar: "'Cairo', system-ui, sans-serif",
  en: "'Inter', system-ui, -apple-system, sans-serif",
};

export function useDirection(): void {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language.split('-')[0]; // normalise 'ar-SA' → 'ar'
    const isRtl = lang === 'ar';
    const html = document.documentElement;

    html.dir = isRtl ? 'rtl' : 'ltr';
    html.lang = lang;
    html.style.setProperty('--font-sans', FONTS[lang] ?? FONTS['en']);
  }, [i18n.language]);
}
