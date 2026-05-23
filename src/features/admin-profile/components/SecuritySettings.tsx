import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Key, Shield, ShieldCheck, Monitor, Clock, LogIn,
  Eye, EyeOff, Lock, X, Copy,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../services/supabase';
import { toast } from 'react-hot-toast';

interface Props {
  authUser: User | null;
  createdAt: string;
}

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
  confirmPassword: z.string().min(1),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { labelAr: 'ضعيفة', labelEn: 'Weak', color: '#ef4444', pct: 20 };
  if (s === 2) return { labelAr: 'مقبولة', labelEn: 'Fair', color: '#f59e0b', pct: 40 };
  if (s === 3) return { labelAr: 'جيدة', labelEn: 'Good', color: '#3b82f6', pct: 60 };
  if (s === 4) return { labelAr: 'قوية', labelEn: 'Strong', color: '#10b981', pct: 80 };
  return { labelAr: 'قوية جداً', labelEn: 'Very Strong', color: '#6ee7b7', pct: 100 };
}

function fmt(iso: string | null | undefined, isRtl: boolean) {
  if (!iso) return isRtl ? 'غير معروف' : 'Unknown';
  return new Date(iso).toLocaleString(isRtl ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

const inputBase = 'w-full ps-10 pe-3 py-2.5 rounded-xl text-sm outline-none transition-colors border focus:border-primary-500';
const inputSt = { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text-main)' };

function PwField({ label, reg, error, show, onToggle, placeholder, isRtl }: {
  label: string; reg: object; error?: string;
  show: boolean; onToggle: () => void; placeholder: string; isRtl: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 mb-1.5 text-start">{label}</label>
      <div className="relative">
        <input
          {...reg}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className={inputBase}
          style={inputSt}
          dir="ltr"
        />
        <button type="button" onClick={onToggle}
          className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p className="text-xs mt-1 text-red-500">{isRtl ? 'كلمة المرور لا تستوفي المتطلبات' : error}</p>}
    </div>
  );
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      maxLength={6}
      value={value}
      onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
      placeholder="000000"
      autoFocus
      className={inputBase}
      style={{ ...inputSt, textAlign: 'center', letterSpacing: '0.6em', fontSize: '1.25rem', fontWeight: 700 }}
      dir="ltr"
    />
  );
}

export default function SecuritySettings({ authUser, createdAt }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [modalOpen, setModalOpen] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [mfaBypass, setMfaBypass] = useState(false);
  const [pendingPw, setPendingPw] = useState('');
  const [bypassOtp, setBypassOtp] = useState('');
  const [bypassLoading, setBypassLoading] = useState(false);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [factorId, setFactorId] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const newPw = watch('newPassword', '');
  const strength = newPw ? getStrength(newPw) : null;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.find(f => f.status === 'verified');
      if (verified) { setIs2FAEnabled(true); setFactorId(verified.id); }
    })();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!authUser?.email) { toast.error(isRtl ? 'غير مصرح لك' : 'Unauthorized'); return; }
    const tempClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error: signInErr } = await tempClient.auth.signInWithPassword({ email: authUser.email, password: data.currentPassword });
    if (signInErr) { toast.error(isRtl ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect'); return; }
    if (is2FAEnabled) { setPendingPw(data.newPassword); setMfaBypass(true); return; }
    const { error } = await supabase.auth.updateUser({ password: data.newPassword });
    if (error) { toast.error(error.message); return; }
    toast.success(isRtl ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
    reset(); setModalOpen(false);
  };

  const handleVerifyBypass = async () => {
    if (!/^\d{6}$/.test(bypassOtp)) { toast.error(isRtl ? 'أدخل رمزاً مكوناً من 6 أرقام' : 'Enter a 6-digit code'); return; }
    setBypassLoading(true);
    try {
      const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({ factorId });
      if (chalErr) throw chalErr;
      const { error: verErr } = await supabase.auth.mfa.verify({ factorId, challengeId: chal.id, code: bypassOtp });
      if (verErr) throw verErr;
      const { error: updErr } = await supabase.auth.updateUser({ password: pendingPw });
      if (updErr) throw updErr;
      toast.success(isRtl ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
      reset(); closeModal();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : (isRtl ? 'فشل التحقق' : 'Verification failed'));
    } finally { setBypassLoading(false); }
  };

  const closeModal = () => { setModalOpen(false); setMfaBypass(false); setPendingPw(''); setBypassOtp(''); reset(); };

  const handleEnable2FA = async () => {
    try {
      const { data: list } = await supabase.auth.mfa.listFactors();
      for (const f of list?.totp?.filter(f => f.status !== 'verified') ?? []) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setFactorId(data.id); setMfaSecret(data.totp.secret);
      setQrCodeSvg(data.totp.qr_code); setOtpCode(''); setEnrolling(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : (isRtl ? 'فشل بدء إعداد المصادقة الثنائية' : 'Failed to start 2FA setup'));
    }
  };

  const handleVerifyEnroll = async () => {
    if (!/^\d{6}$/.test(otpCode)) { toast.error(isRtl ? 'يجب أن يتكون الرمز من 6 أرقام' : 'Code must be 6 digits'); return; }
    setOtpLoading(true);
    try {
      const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({ factorId });
      if (chalErr) throw chalErr;
      const { error: verErr } = await supabase.auth.mfa.verify({ factorId, challengeId: chal.id, code: otpCode });
      if (verErr) throw verErr;
      setIs2FAEnabled(true); setEnrolling(false);
      toast.success(isRtl ? 'تم تفعيل المصادقة الثنائية بنجاح!' : '2FA enabled successfully!');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : (isRtl ? 'رمز OTP غير صالح' : 'Invalid OTP code'));
    } finally { setOtpLoading(false); }
  };

  const handleDisable2FA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const verified = data.totp.find(f => f.status === 'verified');
      if (!verified) return;
      const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId: verified.id });
      if (unenrollErr) throw unenrollErr;
      setIs2FAEnabled(false); setFactorId('');
      toast.success(isRtl ? 'تم تعطيل المصادقة الثنائية' : '2FA disabled');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : (isRtl ? 'فشل تعطيل المصادقة الثنائية' : 'Failed to disable 2FA'));
    }
  };

  const sessionItems = [
    { icon: <Clock size={15} />, labelAr: 'آخر تسجيل دخول', labelEn: 'Last Sign In', value: fmt(authUser?.last_sign_in_at, isRtl), color: '#818cf8' },
    { icon: <LogIn size={15} />, labelAr: 'مزود المصادقة', labelEn: 'Auth Provider', value: authUser?.app_metadata?.provider ?? (isRtl ? 'البريد الإلكتروني' : 'Email'), color: '#34d399' },
    { icon: <Monitor size={15} />, labelAr: 'عضو منذ', labelEn: 'Member Since', value: fmt(createdAt, isRtl), color: '#fbbf24' },
  ];

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── Session Info ── */}
      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white text-start">{isRtl ? 'معلومات الجلسة' : 'Session Info'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sessionItems.map(item => (
            <div key={item.labelEn} className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
              <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${item.color}18` }}>
                <span style={{ color: item.color }}>{item.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 text-start">{isRtl ? item.labelAr : item.labelEn}</p>
                <p className="text-sm font-semibold truncate text-white text-start" dir="ltr">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Password ── */}
      <section className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/10 shrink-0">
              <Key size={18} className="text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white text-start">{isRtl ? 'كلمة المرور' : 'Password'}</p>
              <p className="text-xs text-gray-400 text-start">{isRtl ? 'قم بتعيين كلمة مرور قوية وفريدة' : 'Set a strong and unique password'}</p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all shadow-sm bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20"
          >
            {isRtl ? 'تغيير كلمة المرور' : 'Change Password'}
          </button>
        </div>
      </section>

      {/* ── Two-Factor Authentication ── */}
      <section className={`glass-card rounded-2xl p-5 space-y-5 border ${is2FAEnabled ? 'border-emerald-500/30' : 'border-white/5'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${is2FAEnabled ? 'bg-emerald-500/10' : 'bg-primary-500/10'}`}>
              {is2FAEnabled
                ? <ShieldCheck size={18} className="text-emerald-400" />
                : <Shield size={18} className="text-primary-400" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white text-start">{isRtl ? 'المصادقة الثنائية (2FA)' : 'Two-Factor Authentication'}</p>
              <p className="text-xs text-gray-400 text-start">
                {is2FAEnabled
                  ? (isRtl ? 'حسابك محمي بتطبيق مصادقة' : 'Your account is protected by an authenticator app')
                  : (isRtl ? 'أضف طبقة أمان إضافية باستخدام تطبيق مصادقة' : 'Add extra security with an authenticator app')}
              </p>
            </div>
          </div>

          {!enrolling && (
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-danger-500/10 text-danger-400 border-danger-500/20'}`}>
                {is2FAEnabled ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'غير مفعل' : 'Inactive')}
              </span>
              {is2FAEnabled ? (
                <button onClick={handleDisable2FA}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all bg-danger-500/10 text-danger-400 border border-danger-500/20 hover:bg-danger-500/20">
                  {isRtl ? 'تعطيل المصادقة' : 'Disable 2FA'}
                </button>
              ) : (
                <button onClick={handleEnable2FA}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20">
                  {isRtl ? 'تفعيل المصادقة' : 'Enable 2FA'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Enrollment Flow */}
        {enrolling && (
          <div className="rounded-xl p-5 space-y-5 bg-black/20 border border-white/5">
            <div className="text-center">
              <p className="text-sm font-bold text-white mb-1">
                {isRtl ? 'قم بمسح الكود باستخدام تطبيق المصادقة الخاص بك' : 'Scan the QR code with your authenticator app'}
              </p>
              <p className="text-xs text-gray-400">
                {isRtl ? 'استخدم Google Authenticator أو Authy أو أي تطبيق TOTP آخر.' : 'Use Google Authenticator, Authy, or any TOTP app.'}
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-white p-2 rounded-xl inline-flex">
                <img src={qrCodeSvg} alt="2FA QR Code" className="w-40 h-40 object-contain" />
              </div>
            </div>
            <div className="rounded-xl p-4 space-y-2 text-center bg-black/40 border border-dashed border-white/10">
              <p className="text-xs text-gray-400">
                {isRtl
                  ? <>لا تستطيع مسح الكود؟ أدخل هذا المفتاح يدوياً. <span className="text-danger-400 font-bold">احفظه جيداً - إنه نسختك الاحتياطية الوحيدة.</span></>
                  : <>{"Can't scan? Enter this key manually. "}<span className="text-danger-400 font-bold">Save it — this is your only backup.</span></>}
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-lg font-mono font-bold tracking-widest text-[#a78bfa]">{mfaSecret}</code>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(mfaSecret); toast.success(isRtl ? 'تم نسخ المفتاح!' : 'Key copied!'); }}
                  className="text-[#a78bfa] hover:text-white transition-colors"
                  title={isRtl ? 'نسخ المفتاح' : 'Copy key'}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-center text-gray-400">
                {isRtl ? 'أدخل الكود المكون من 6 أرقام من تطبيقك' : 'Enter the 6-digit code from your app'}
              </label>
              <OtpInput value={otpCode} onChange={setOtpCode} />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setEnrolling(false); setOtpCode(''); }} disabled={otpLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors">
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="button" onClick={handleVerifyEnroll} disabled={otpLoading || otpCode.length !== 6}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 btn-primary">
                  {otpLoading ? (isRtl ? 'جارٍ التحقق...' : 'Verifying…') : (isRtl ? 'تأكيد وتفعيل' : 'Confirm & Enable')}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Change Password Modal (Portal) ── */}
      {modalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5 bg-[#0f172a] border border-white/10 shadow-2xl" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-primary-400" />
                <h3 className="text-base font-bold text-white">
                  {mfaBypass
                    ? (isRtl ? 'التحقق من الهوية' : 'Identity Verification')
                    : (isRtl ? 'تغيير كلمة المرور' : 'Change Password')}
                </h3>
              </div>
              <button onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 transition-colors">
                <X size={16} />
              </button>
            </div>

            {mfaBypass ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
                  <ShieldCheck size={16} className="text-primary-400 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-gray-400">
                    {isRtl
                      ? 'حسابك محمي بالمصادقة الثنائية. يرجى إدخال كود المصادقة المكون من 6 أرقام لتأكيد هذا التغيير.'
                      : 'Your account has 2FA enabled. Enter your 6-digit authenticator code to confirm this change.'}
                  </p>
                </div>
                <OtpInput value={bypassOtp} onChange={setBypassOtp} />
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setMfaBypass(false); setBypassOtp(''); setPendingPw(''); }}
                    className="flex-1 py-2.5 rounded-xl text-sm bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors">
                    {isRtl ? 'رجوع' : 'Back'}
                  </button>
                  <button type="button" onClick={handleVerifyBypass} disabled={bypassLoading || bypassOtp.length !== 6}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 btn-primary">
                    {bypassLoading ? (isRtl ? 'جارٍ التحقق...' : 'Verifying…') : (isRtl ? 'تحقق وتحديث' : 'Verify & Update')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <PwField
                  label={isRtl ? 'كلمة المرور الحالية' : 'Current Password'}
                  reg={register('currentPassword')}
                  error={errors.currentPassword?.message}
                  show={showCur} onToggle={() => setShowCur(v => !v)}
                  placeholder={isRtl ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                  isRtl={isRtl}
                />
                <div className="h-px bg-white/10" />
                <div>
                  <PwField
                    label={isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                    reg={register('newPassword')}
                    error={errors.newPassword?.message}
                    show={showNew} onToggle={() => setShowNew(v => !v)}
                    placeholder={isRtl ? 'أنشئ كلمة مرور قوية' : 'Create a strong password'}
                    isRtl={isRtl}
                  />
                  {strength && (
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">{isRtl ? 'قوة كلمة المرور' : 'Strength'}</span>
                        <span className="text-xs font-semibold" style={{ color: strength.color }}>
                          {isRtl ? strength.labelAr : strength.labelEn}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-white/10">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${strength.pct}%`, background: strength.color }} />
                      </div>
                    </div>
                  )}
                </div>
                <PwField
                  label={isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                  reg={register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  show={showConf} onToggle={() => setShowConf(v => !v)}
                  placeholder={isRtl ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'}
                  isRtl={isRtl}
                />
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl text-sm bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors">
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 btn-primary flex items-center justify-center gap-1.5">
                    <Lock size={13} />
                    {isSubmitting ? (isRtl ? 'جارٍ التحقق...' : 'Verifying…') : (isRtl ? 'تحديث كلمة المرور' : 'Update Password')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
