import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, X, Eye } from 'lucide-react';
import type { SystemSettings, SettingsPatch } from '../types';

interface Props {
  settings: SystemSettings;
  saving: boolean;
  onSave: (patch: SettingsPatch) => Promise<void>;
}

export default function BroadcastManager({ settings, saving, onSave }: Props) {
  const { t, i18n } = useTranslation('settings');
  const isRtl = i18n.language.startsWith('ar');

  const [message, setMessage] = useState(settings.broadcast_message ?? '');
  const [preview, setPreview] = useState(false);

  const isLive = Boolean(settings.broadcast_message);
  const maxLen = 280;

  const handlePublish = () => onSave({ broadcast_message: message.trim() || null });
  const handleClear   = () => onSave({ broadcast_message: null }).then(() => setMessage(''));

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Live Banner Indicator */}
      {isLive && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isRtl ? 'flex-row-reverse' : ''}`} style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <Megaphone size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: '#fbbf24' }}>
            {t('broadcast.activeLabel')}
          </p>
        </div>
      )}

      <section className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
          <h3 className={`text-sm font-semibold ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-main)' }}>
            {t('broadcast.title')}
          </h3>
          <button
            onClick={() => setPreview(v => !v)}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Eye size={12} />
            {preview ? 'Hide Preview' : 'Preview'}
          </button>
        </div>

        <p className={`text-xs ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>
          {t('broadcast.description')}
        </p>

        <div>
          <textarea
            rows={4}
            maxLength={maxLen}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--text-main)',
              textAlign: isRtl ? 'right' : 'left',
            }}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={t('broadcast.messagePlaceholder')}
          />
          <div className={`flex mt-1 ${isRtl ? 'justify-start' : 'justify-end'}`}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{message.length}/{maxLen}</span>
          </div>
        </div>

        {/* Live Preview */}
        {preview && message.trim() && (
          <div>
            <p className={`text-xs font-medium mb-2 ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>Preview:</p>
            <div
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${isRtl ? 'flex-row-reverse' : ''}`}
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <div className={`flex items-center gap-2 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Megaphone size={14} style={{ color: '#818cf8', flexShrink: 0 }} />
                <p className="text-sm truncate" style={{ color: '#c7d2fe' }}>{message}</p>
              </div>
              <X size={14} style={{ color: '#818cf8', flexShrink: 0 }} />
            </div>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className={`flex items-center gap-3 ${isRtl ? 'justify-start flex-row-reverse' : 'justify-end'}`}>
        {isLive && (
          <button
            onClick={handleClear}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 ${isRtl ? 'flex-row-reverse' : ''}`}
            style={{ background: 'rgba(251,113,133,0.1)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.25)' }}
          >
            <X size={14} /> {t('broadcast.clearMessage')}
          </button>
        )}
        <button
          onClick={handlePublish}
          disabled={saving || !message.trim()}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${isRtl ? 'flex-row-reverse' : ''}`}
          style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', color: '#fff' }}
        >
          <Megaphone size={14} /> {saving ? t('broadcast.saving') : t('broadcast.saveChanges')}
        </button>
      </div>
    </div>
  );
}
