import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Globe, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import type { SystemSettings, SettingsPatch } from '../types';
import { settingsApi } from '../api/settingsApi';

interface Props {
  settings: SystemSettings;
  saving: boolean;
  onSave: (patch: SettingsPatch) => Promise<void>;
}

export default function GeneralTab({ settings, saving, onSave }: Props) {
  const { t, i18n } = useTranslation('settings');
  const isRtl = i18n.language.startsWith('ar');

  const [siteName,      setSiteName]      = useState(settings.site_name);
  const [contactEmail,  setContactEmail]  = useState(settings.contact_email ?? '');
  const [supportPhone,  setSupportPhone]  = useState(settings.support_phone ?? '');
  const [faviconUrl,    setFaviconUrl]    = useState(settings.favicon_url ?? '');
  const [social,        setSocial]        = useState({ ...settings.social_links });
  const [logoPreview,   setLogoPreview]   = useState<string | null>(settings.site_logo_url);
  const [logoFile,      setLogoFile]      = useState<File | null>(null);
  const [logoError,     setLogoError]     = useState('');
  const [uploading,     setUploading]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setLogoError(t('general.logoError'));
      return;
    }
    setLogoError('');
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    let site_logo_url = settings.site_logo_url;
    if (logoFile) {
      setUploading(true);
      try {
        site_logo_url = await settingsApi.uploadLogo(logoFile);
      } finally {
        setUploading(false);
      }
    }
    await onSave({
      site_name:     siteName,
      site_logo_url,
      favicon_url:   faviconUrl || null,
      contact_email: contactEmail || null,
      support_phone: supportPhone || null,
      social_links:  social,
    });
  };

  const inputCls = 'w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors';
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-main)',
    textAlign: isRtl ? 'right' as const : 'left' as const,
  };
  const labelCls = `block text-xs font-medium mb-1.5 ${isRtl ? 'text-right' : ''}`;
  const labelStyle = { color: 'var(--text-muted)' };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Branding */}
      <section className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className={`text-sm font-semibold ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-main)' }}>
          {t('general.branding')}
        </h3>

        {/* Site Logo */}
        <div>
          <label className={labelCls} style={labelStyle}>{t('general.siteLogo')}</label>
          <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {logoPreview
                ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                : <Globe size={28} style={{ color: 'var(--text-muted)' }} />
              }
            </div>
            <div className="flex-1">
              <button
                onClick={() => fileRef.current?.click()}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${isRtl ? 'flex-row-reverse' : ''}`}
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                <Upload size={14} /> {t('general.uploadLogo')}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <p className={`text-xs mt-1.5 ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>
                {t('general.logoHint')}
              </p>
              {logoError && <p className={`text-xs mt-1 ${isRtl ? 'text-right' : ''}`} style={{ color: '#f87171' }}>{logoError}</p>}
            </div>
          </div>
        </div>

        {/* Site Name */}
        <div>
          <label className={labelCls} style={labelStyle}>{t('general.siteName')}</label>
          <input
            className={inputCls}
            style={inputStyle}
            value={siteName}
            onChange={e => setSiteName(e.target.value)}
            placeholder="Exam Management System"
          />
        </div>

        {/* Favicon */}
        <div>
          <label className={labelCls} style={labelStyle}>{t('general.faviconUrl')}</label>
          <input
            className={inputCls}
            style={inputStyle}
            value={faviconUrl}
            onChange={e => setFaviconUrl(e.target.value)}
            placeholder={t('general.faviconPlaceholder')}
          />
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className={`text-sm font-semibold ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-main)' }}>
          {t('general.contact')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>
              <span className={`inline-flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Mail size={12} />{t('general.contactEmail')}
              </span>
            </label>
            <input
              className={inputCls}
              style={inputStyle}
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              placeholder={t('general.contactEmailPlaceholder')}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              <span className={`inline-flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Phone size={12} />{t('general.supportPhone')}
              </span>
            </label>
            <input
              className={inputCls}
              style={inputStyle}
              value={supportPhone}
              onChange={e => setSupportPhone(e.target.value)}
              placeholder={t('general.supportPhonePlaceholder')}
            />
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className={`text-sm font-semibold ${isRtl ? 'text-right' : ''}`} style={{ color: 'var(--text-main)' }}>
          {t('general.socialLinks')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { key: 'facebook',  icon: <Facebook  size={13} />, placeholder: 'https://facebook.com/...' },
            { key: 'twitter',   icon: <Twitter   size={13} />, placeholder: 'https://twitter.com/...' },
            { key: 'instagram', icon: <Instagram size={13} />, placeholder: 'https://instagram.com/...' },
            { key: 'linkedin',  icon: <Linkedin  size={13} />, placeholder: 'https://linkedin.com/in/...' },
            { key: 'youtube',   icon: <Youtube   size={13} />, placeholder: 'https://youtube.com/...' },
          ] as const).map(({ key, icon, placeholder }) => (
            <div key={key}>
              <label className={labelCls} style={labelStyle}>
                <span className={`inline-flex items-center gap-1 capitalize ${isRtl ? 'flex-row-reverse' : ''}`}>{icon}{key}</span>
              </label>
              <input
                className={inputCls}
                style={inputStyle}
                value={(social as Record<string, string>)[key] ?? ''}
                onChange={e => setSocial(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
        <button
          onClick={handleSubmit}
          disabled={saving || uploading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff' }}
        >
          {uploading ? t('general.uploading') : saving ? t('general.saving') : t('general.saveChanges')}
        </button>
      </div>
    </div>
  );
}
