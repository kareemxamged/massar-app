import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Award } from 'lucide-react';
import type { SystemSettings, SettingsPatch } from '../types';

interface Props {
  settings: SystemSettings;
  saving: boolean;
  onSave: (patch: SettingsPatch) => Promise<void>;
}

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  accentColor: string;
  isRtl: boolean;
}

function ToggleRow({ icon, label, description, value, onChange, accentColor, isRtl }: ToggleRowProps) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${value ? `${accentColor}33` : 'rgba(255,255,255,0.08)'}` }}
    >
      <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${accentColor}18` }}>
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : ''}`}>
        <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200"
        style={{ background: value ? accentColor : 'rgba(255,255,255,0.1)' }}
      >
        <span
          className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: `translateX(${value ? '22px' : '2px'})`, marginTop: '2px' }}
        />
      </button>
    </div>
  );
}

export default function FeatureTogglesTab({ settings, saving, onSave }: Props) {
  const { t, i18n } = useTranslation('settings');
  const isRtl = i18n.language.startsWith('ar');

  const [studentChat,      setStudentChat]      = useState(settings.enable_student_chat);
  const [resultsImmediate, setResultsImmediate] = useState(settings.show_exam_results_immediately);

  const handleSave = () =>
    onSave({ enable_student_chat: studentChat, show_exam_results_immediately: resultsImmediate });

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className={`text-sm font-semibold ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-main)' }}>
          {t('features.title')}
        </h3>
        <div className="space-y-3">
          <ToggleRow
            icon={<MessageSquare size={18} />}
            label={t('features.studentChat')}
            description={t('features.studentChatDesc')}
            value={studentChat}
            onChange={setStudentChat}
            accentColor="#6366f1"
            isRtl={isRtl}
          />
          <ToggleRow
            icon={<Award size={18} />}
            label={t('features.showResultsImmediately')}
            description={t('features.showResultsDesc')}
            value={resultsImmediate}
            onChange={setResultsImmediate}
            accentColor="#10b981"
            isRtl={isRtl}
          />
        </div>
      </section>

      <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff' }}
        >
          {saving ? t('features.saving') : t('features.saveChanges')}
        </button>
      </div>
    </div>
  );
}
