import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ShieldOff } from 'lucide-react';
import type { SystemSettings, SettingsPatch } from '../types';

interface Props {
  settings: SystemSettings;
  saving: boolean;
  onSave: (patch: SettingsPatch) => Promise<void>;
}

export default function MaintenanceTab({ settings, saving, onSave }: Props) {
  const { t, i18n } = useTranslation('settings');
  const isRtl = i18n.language.startsWith('ar');

  const [enabled, setEnabled] = useState(settings.maintenance_mode);
  const [message, setMessage] = useState(settings.maintenance_message ?? '');
  const [confirm, setConfirm] = useState(false);

  const isOn = enabled;

  const handleToggle = () => {
    if (!enabled) {
      setConfirm(true);
    } else {
      setEnabled(false);
    }
  };

  const confirmEnable = () => {
    setEnabled(true);
    setConfirm(false);
  };

  const handleSave = () =>
    onSave({ maintenance_mode: enabled, maintenance_message: message || null });

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Active Warning Banner */}
      {isOn && (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl ${isRtl ? 'flex-row-reverse' : ''}`} style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)' }}>
          <AlertTriangle size={18} style={{ color: '#fb7185', flexShrink: 0, marginTop: 1 }} />
          <div className={isRtl ? 'text-right' : ''}>
            <p className="text-sm font-semibold" style={{ color: '#fb7185' }}>{t('maintenance.title')} ON</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(251,113,133,0.75)' }}>
              {t('maintenance.description')}
            </p>
          </div>
        </div>
      )}

      {/* Danger Zone Card */}
      <section className="rounded-2xl p-5 space-y-5" style={{ background: 'rgba(255,255,255,0.03)', border: isOn ? '1px solid rgba(251,113,133,0.35)' : '1px solid rgba(255,255,255,0.08)' }}>
        <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(251,113,133,0.1)' }}>
            <ShieldOff size={20} style={{ color: '#fb7185' }} />
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-semibold ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-main)' }}>
              {t('maintenance.title')}
            </h3>
            <p className={`text-xs mt-0.5 ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>
              {t('maintenance.description')}
            </p>
          </div>
          {/* Toggle Switch */}
          <button
            role="switch"
            aria-checked={enabled}
            onClick={handleToggle}
            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200"
            style={{ background: enabled ? '#fb7185' : 'rgba(255,255,255,0.1)' }}
          >
            <span
              className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: `translateX(${enabled ? '22px' : '2px'})`, marginTop: '2px' }}
            />
          </button>
        </div>

        {/* Message */}
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>
            {t('maintenance.message')}
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--text-main)',
              textAlign: isRtl ? 'right' : 'left',
            }}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={t('maintenance.messagePlaceholder')}
          />
        </div>
      </section>

      {/* Confirm Dialog */}
      {confirm && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.4)' }}>
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <AlertTriangle size={16} style={{ color: '#fb7185' }} />
            <p className="text-sm font-semibold" style={{ color: '#fb7185' }}>{t('maintenance.warningTitle')}</p>
          </div>
          <p className={`text-xs ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>
            {t('maintenance.warningBody')}
          </p>
          <div className={`flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={confirmEnable}
              className="px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ background: '#fb7185', color: '#fff' }}
            >
              {t('maintenance.toggle')}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: isOn ? 'linear-gradient(135deg,#fb7185,#f43f5e)' : 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff' }}
        >
          {saving ? t('maintenance.saving') : t('maintenance.saveChanges')}
        </button>
      </div>
    </div>
  );
}
