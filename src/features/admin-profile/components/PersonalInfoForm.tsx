import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { User, Phone, Mail, Calendar, Lock } from 'lucide-react';
import type { AdminProfilePatch } from '../api/adminProfileApi';

const infoSchema = z.object({
  full_name: z.string().min(2).max(100),
  mobile: z.string().regex(/^[\d\+\-\s]+$/).min(8).optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
});

type InfoFormData = z.infer<typeof infoSchema>;

interface ProfileSnapshot {
  full_name: string | null;
  mobile: string | null;
  date_of_birth: string | null;
  email: string | null;
}

interface Props {
  profile: ProfileSnapshot;
  saving: boolean;
  onSave: (patch: AdminProfilePatch) => Promise<void>;
}

export default function PersonalInfoForm({ profile, saving, onSave }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { register, handleSubmit, formState: { errors } } = useForm<InfoFormData>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      mobile: profile.mobile || '',
      date_of_birth: profile.date_of_birth || '',
    }
  });

  const onSubmit = async (data: InfoFormData) => {
    await onSave({
      full_name: data.full_name || null,
      mobile: data.mobile || null,
      date_of_birth: data.date_of_birth || null,
    });
  };

  const inputBase = 'w-full ps-10 pe-3 py-2.5 rounded-xl text-sm outline-none transition-colors border focus:border-primary-500';
  const inputSt = {
    background: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.12)',
    color: 'var(--text-main)',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Personal fields ── */}
      <section className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white text-start">
          {isRtl ? 'المعلومات الشخصية' : 'Personal Information'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name — spans both columns */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 text-start">
              <User size={12} />
              {isRtl ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <User size={14} />
              </span>
              <input
                {...register('full_name')}
                className={inputBase}
                style={inputSt}
                placeholder={isRtl ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              />
            </div>
            {errors.full_name && <p className="text-xs text-red-500 mt-1">{isRtl ? 'الاسم مطلوب (حرفان على الأقل)' : 'Name must be at least 2 characters'}</p>}
          </div>

          {/* Mobile */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 text-start">
              <Phone size={12} />
              {isRtl ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <Phone size={14} />
              </span>
              <input
                {...register('mobile')}
                className={inputBase}
                style={inputSt}
                placeholder="+966 5X XXX XXXX"
                dir="ltr"
              />
            </div>
            {errors.mobile && <p className="text-xs text-red-500 mt-1">{isRtl ? 'رقم الهاتف غير صالح' : 'Invalid phone number'}</p>}
          </div>

          {/* Date of birth */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 text-start">
              <Calendar size={12} />
              {isRtl ? 'تاريخ الميلاد' : 'Date of Birth'}
            </label>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <Calendar size={14} />
              </span>
              <input
                type="date"
                {...register('date_of_birth')}
                className={inputBase}
                style={inputSt}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Email — read-only ── */}
      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white text-start">
          {isRtl ? 'البريد الإلكتروني للحساب' : 'Account Email'}
        </h3>
        <div>
          <label className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 text-start">
            <Mail size={12} />
            {isRtl ? 'عنوان البريد الإلكتروني' : 'Email Address'}
          </label>
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <Lock size={13} />
            </span>
            <input
              className={inputBase}
              style={{ ...inputSt, background: 'rgba(255,255,255,0.02)', opacity: 0.65, cursor: 'not-allowed' }}
              value={profile.email ?? ''}
              readOnly
              dir="ltr"
            />
          </div>
          <p className="text-xs mt-1.5 text-gray-400 text-start">
            {isRtl
              ? 'عنوان البريد الإلكتروني مقفل. تواصل مع المسؤول الرئيسي لتحديثه.'
              : 'Email address is locked. Contact your primary admin to change it.'}
          </p>
        </div>
      </section>

      {/* ── Save button ── */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm"
        >
          {saving
            ? (isRtl ? 'جارٍ الحفظ...' : 'Saving…')
            : (isRtl ? 'حفظ التغييرات' : 'Save Changes')}
        </button>
      </div>
    </form>
  );
}
