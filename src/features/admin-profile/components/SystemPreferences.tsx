import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor, Globe, Save } from 'lucide-react';
import { useTheme, type Theme } from '../../../hooks/useTheme';
import { toast } from 'react-hot-toast';

type LangPref = 'en' | 'ar';
const LANG_KEY = 'app-language';

export default function SystemPreferences() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState<LangPref>(
    () => (localStorage.getItem(LANG_KEY) as LangPref) ?? 'ar',
  );

  const THEME_OPTIONS: { id: Theme; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'dark', labelAr: 'داكن', labelEn: 'Dark', icon: <Moon size={15} /> },
    { id: 'light', labelAr: 'فاتح', labelEn: 'Light', icon: <Sun size={15} /> },
    { id: 'system', labelAr: 'حسب النظام', labelEn: 'System', icon: <Monitor size={15} /> },
  ];

  const handleSave = () => {
    localStorage.setItem(LANG_KEY, lang);
    toast.success(isRtl ? 'تم حفظ التفضيلات' : 'Preferences saved');
    setTimeout(() => { window.location.reload(); }, 1000);
  };

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Theme ── */}
      <section className="glass-card rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white text-start">{isRtl ? 'المظهر' : 'Appearance'}</h3>
          <p className="text-xs text-gray-400 mt-1 text-start">
            {isRtl ? 'اختر كيف تبدو واجهة النظام بالنسبة لك.' : 'Choose how the interface looks for you.'}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {THEME_OPTIONS.map(opt => {
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105 ${active
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'bg-black/20 text-gray-400 border border-white/5 hover:bg-white/5'
                  }`}
              >
                {opt.icon} {isRtl ? opt.labelAr : opt.labelEn}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Language ── */}
      <section className="glass-card rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white text-start">{isRtl ? 'لغة العرض' : 'Display Language'}</h3>
          <p className="text-xs text-gray-400 mt-1 text-start">
            {isRtl ? 'اللغة المفضلة لعرض واجهة المستخدم.' : 'Your preferred language for the user interface.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Globe size={18} className="text-gray-400 shrink-0" />
          <select
            className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none bg-black/20 border border-white/5 text-white focus:border-primary-500 transition-colors"
            value={lang}
            onChange={e => setLang(e.target.value as LangPref)}
          >
            <option value="ar">العربية</option>
            <option value="en">English (US)</option>
          </select>
        </div>
      </section>

      {/* ── Save ── */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button
          onClick={handleSave}
          className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm"
        >
          <Save size={14} />
          {isRtl ? 'حفظ التفضيلات' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
