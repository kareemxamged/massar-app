import { Camera, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

interface Props {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  uploading: boolean;
  onAvatarChange: (file: File) => Promise<void>;
}

export default function ProfileHeader({ name, email, avatarUrl, uploading, onAvatarChange }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(isRtl ? 'يجب أن يكون حجم الصورة أقل من 2 ميغابايت' : 'Image must be smaller than 2 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error(isRtl ? 'الرجاء اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }
    onAvatarChange(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden glass-card p-5 sm:p-6"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Decorative gradient backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top end, rgba(99,102,241,0.12), transparent 65%)' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-5 sm:flex-row sm:items-center sm:text-start">

        {/* Avatar */}
        <div className="relative group flex-shrink-0">
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl ring-2 ring-primary-500/20 ${uploading ? 'opacity-50' : ''}`}
            style={{ background: '#1e293b' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={isRtl ? 'صورة الملف الشخصي' : 'Profile avatar'} className="w-full h-full object-cover" />
            ) : (
              <User size={40} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>

          {/* Hover overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
          >
            <Camera size={22} className="text-white mb-1" />
            <span className="text-xs text-white font-medium">
              {uploading ? (isRtl ? 'جاري الرفع...' : 'Uploading…') : (isRtl ? 'تغيير الصورة' : 'Change photo')}
            </span>
          </button>

          {/* Floating edit badge */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title={isRtl ? 'تغيير الصورة' : 'Change avatar'}
            className="absolute bottom-0 end-0 -translate-y-0 translate-x-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: '2px solid var(--bg-app, #0f172a)' }}
          >
            <Camera size={13} className="text-white" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold truncate" style={{ color: 'var(--text-main)' }}>
              {name || (isRtl ? 'مسؤول النظام' : 'System Admin')}
            </h2>
            <CheckCircle2 size={17} className="text-primary-400 shrink-0" />
          </div>
          <p className="text-sm mb-3 font-sans truncate" style={{ color: 'var(--text-muted)' }} dir="ltr">
            {email || 'admin@example.com'}
          </p>
          <div className="flex items-center justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 font-semibold">
              <ShieldCheck size={12} />
              {isRtl ? 'حساب مسؤول' : 'Admin Account'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
