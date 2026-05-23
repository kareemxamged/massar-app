import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, Shield, ShieldCheck, Save, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../services/supabase';
import { toast } from 'react-hot-toast';
import styles from '../StudentProfile.module.css';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const securitySchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'At least 8 characters')
        .regex(/[A-Z]/, 'Needs at least one uppercase letter')
        .regex(/[0-9]/, 'Needs at least one number')
        .regex(/[^A-Za-z0-9]/, 'Needs at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(d => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type SecurityFormData = z.infer<typeof securitySchema>;

// ─── Password Strength ────────────────────────────────────────────────────────
function getStrength(pw: string, txt: any): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { score, label: txt.weak, color: '#ef4444' };
    if (score === 2) return { score, label: txt.fair, color: '#f59e0b' };
    if (score === 3) return { score, label: txt.good, color: '#3b82f6' };
    if (score === 4) return { score, label: txt.strong, color: '#10b981' };
    return { score, label: txt.vStrong, color: '#6ee7b7' };
}

function StrengthMeter({ password, txt }: { password: string, txt: any }) {
    if (!password) return null;
    const { score, label, color } = getStrength(password, txt);
    const pct = (score / 5) * 100;
    return (
        <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{txt.passwordStrength}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color }}>{label}</span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${pct}%`, borderRadius: '99px',
                    background: color, transition: 'width 0.4s ease, background 0.4s ease'
                }} />
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                {[
                    [txt.pwRequirements.chars, password.length >= 8],
                    [txt.pwRequirements.upper, /[A-Z]/.test(password)],
                    [txt.pwRequirements.num, /[0-9]/.test(password)],
                    [txt.pwRequirements.spec, /[^A-Za-z0-9]/.test(password)],
                ].map(([req, met]) => (
                    <span key={String(req)} style={{
                        fontSize: '0.68rem', padding: '1px 7px', borderRadius: '99px',
                        background: met ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
                        color: met ? '#34d399' : '#64748b',
                        border: `1px solid ${met ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.07)'}`,
                        transition: 'all 0.3s'
                    }}>
                        {met ? '✓ ' : '○ '}{String(req)}
                    </span>
                ))}
            </div>
        </div>
    );
}

function PasswordField({ id, label, placeholder, reg, error, children }: {
    id: string; label: string; placeholder: string;
    reg: any; error?: string; children?: React.ReactNode;
}) {
    const { i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');
    const [show, setShow] = useState(false);
    return (
        <div className={`${styles.inputGroup} text-start`} style={{ textAlign: isRtl ? 'right' : 'left' }}>
            <label className={`${styles.label} justify-start`}>
                <Lock size={14} /> {label}
            </label>
            <div className={styles.inputWrapper}>
                <input id={id} {...reg} type={show ? 'text' : 'password'}
                    placeholder={placeholder}
                    className={`${styles.input} pe-10 ${error ? 'ring-error' : ''}`}
                    style={{ paddingRight: undefined, textAlign: isRtl ? 'right' : 'left' }}
                    dir="auto"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                    style={{
                        position: 'absolute', right: undefined, left: undefined,
                        insetInlineEnd: '1rem', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 0,
                        display: 'flex', alignItems: 'center'
                    }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{error}</span>}
            {children}
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SecurityTab() {
    const { i18n } = useTranslation('common');
    const isRtl = i18n.language.startsWith('ar');

    const txt = isRtl ? {
        title: 'الأمان وتسجيل الدخول',
        subtitle: 'قم بتحديث كلمة المرور الخاصة بك. سيتم إبطال جميع الجلسات الأخرى.',
        secured: 'آمن',
        mfaRequired: 'مطلوب تحقق إضافي',
        mfaDesc: 'نظراً لتفعيل المصادقة الثنائية، يرجى إدخال رمز تطبيق المصادقة المكون من 6 أرقام لتأكيد تغيير كلمة المرور.',
        cancel: 'إلغاء',
        verify: 'التحقق والمتابعة',
        verifying: 'جاري التحقق...',
        currentPw: 'كلمة المرور الحالية',
        currentPwPlace: 'أدخل كلمة المرور الحالية',
        newPw: 'كلمة المرور الجديدة',
        newPwPlace: 'قم بإنشاء كلمة مرور قوية',
        confirmPw: 'تأكيد كلمة المرور الجديدة',
        confirmPwPlace: 'أعد إدخال كلمة المرور الجديدة',
        update: 'تحديث كلمة المرور',
        updating: 'جاري التحديث...',
        totpTitle: 'المصادقة الثنائية (TOTP)',
        scanQr: 'امسح رمز الاستجابة السريعة (QR)',
        scanDesc: 'استخدم تطبيق Google Authenticator أو تطبيق TOTP مشابه للمسح.',
        manualKey: 'إذا لم تتمكن من مسح الرمز، أدخل هذا المفتاح اليدوي في تطبيقك.',
        saveKey: 'احفظ هذا المفتاح! إنه طريقة الاسترداد الاحتياطية الوحيدة.',
        enterCode: 'أدخل الرمز المكون من 6 أرقام',
        active: 'نشط',
        disabled: 'معطل',
        disable2fa: 'تعطيل 2FA',
        enable2fa: 'تفعيل 2FA',
        authApp: 'تطبيق المصادقة',
        authAppDesc: 'أضف طبقة أمان إضافية عبر تطبيق TOTP',
        passwordStrength: 'قوة كلمة المرور',
        weak: 'ضعيف',
        fair: 'مقبول',
        good: 'جيد',
        strong: 'قوي',
        vStrong: 'قوي جداً',
        pwRequirements: {
            chars: '8+ أحرف',
            upper: 'حرف كبير',
            num: 'رقم',
            spec: 'رمز خاص'
        }
    } : {
        title: 'Security & Login',
        subtitle: 'Update your password. All other sessions will be invalidated.',
        secured: 'Secured',
        mfaRequired: 'Additional Verification Required',
        mfaDesc: 'Since you have Two-Factor Authentication enabled, please enter your 6-digit authenticator app code to confirm this password change.',
        cancel: 'Cancel',
        verify: 'Verify & Continue',
        verifying: 'Verifying…',
        currentPw: 'Current Password',
        currentPwPlace: 'Enter current password',
        newPw: 'New Password',
        newPwPlace: 'Create a strong password',
        confirmPw: 'Confirm New Password',
        confirmPwPlace: 'Repeat new password',
        update: 'Update Password',
        updating: 'Updating…',
        totpTitle: 'Two-Factor Authentication (TOTP)',
        scanQr: 'Scan QR Code',
        scanDesc: 'Use Google Authenticator or similar TOTP app to scan.',
        manualKey: 'If you cannot scan the QR code, manually enter this Secret Key into your app.',
        saveKey: 'Save this key! It is your only backup recovery method.',
        enterCode: 'Enter 6-digit Code',
        active: 'Active',
        disabled: 'Disabled',
        disable2fa: 'Disable 2FA',
        enable2fa: 'Enable 2FA',
        authApp: 'Authenticator App',
        authAppDesc: 'Add an extra layer of security via a TOTP app',
        passwordStrength: 'Password Strength',
        weak: 'Weak',
        fair: 'Fair',
        good: 'Good',
        strong: 'Strong',
        vStrong: 'Very Strong',
        pwRequirements: {
            chars: '8+ chars',
            upper: 'Uppercase',
            num: 'Number',
            spec: 'Special char'
        }
    };

    // Basic Form Setup
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm<SecurityFormData>({
        resolver: zodResolver(securitySchema),
    });
    const newPw = watch('newPassword', '');

    // MFA / 2FA State
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [mfaFactorId, setMfaFactorId] = useState('');
    const [mfaSecret, setMfaSecret] = useState('');
    const [qrCodeSvg, setQrCodeSvg] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isOtpLoading, setIsOtpLoading] = useState(false);

    // Bypass State for Password Updates
    const [pendingPassword, setPendingPassword] = useState('');
    const [isMfaBypass, setIsMfaBypass] = useState(false);
    const [bypassOtp, setBypassOtp] = useState('');
    const [isBypassLoading, setIsBypassLoading] = useState(false);

    // Initialization
    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.mfa.listFactors();
            if (data?.totp && data.totp.length > 0) {
                const verified = data.totp.find(f => f.status === 'verified');
                if (verified) {
                    setIs2FAEnabled(true);
                    setMfaFactorId(verified.id);
                }
            }
        })();
    }, []);

    // Password Submit
    const onSubmit = async (data: SecurityFormData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) { toast.error('Not authenticated'); return; }

        // Use a temporary, detached client to verify the current password
        // so we don't accidentally overwrite the user's active session!
        const { createClient } = await import('@supabase/supabase-js');
        const tempClient = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY,
            { auth: { persistSession: false, autoRefreshToken: false } }
        );

        const { error: signInError } = await tempClient.auth.signInWithPassword({
            email: user.email,
            password: data.currentPassword,
        });
        if (signInError) { toast.error('Current password is incorrect'); return; }

        if (is2FAEnabled) {
            // Intercept flow: ask for 2FA bypass code
            setPendingPassword(data.newPassword);
            setIsMfaBypass(true);
            return;
        }

        // Direct flow for non-2FA users
        const { error: updateError } = await supabase.auth.updateUser({ password: data.newPassword });
        if (updateError) {
            toast.error(updateError.message || 'Failed to update password');
            return;
        }

        toast.success('Password updated successfully ✓');
        reset();
    };

    const handleVerifyBypass = async () => {
        if (!/^\d{6}$/.test(bypassOtp)) return toast.error('OTP must be exactly 6 digits.');
        setIsBypassLoading(true);
        try {
            const challenge = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
            if (challenge.error) throw challenge.error;

            const verify = await supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: challenge.data.id,
                code: bypassOtp,
            });
            if (verify.error) throw verify.error;

            // Success, apply password
            const { error: updateError } = await supabase.auth.updateUser({ password: pendingPassword });
            if (updateError) throw updateError;

            toast.success('Password updated successfully ✓');
            reset();
            setIsMfaBypass(false);
            setPendingPassword('');
            setBypassOtp('');
        } catch (e: any) {
            toast.error(e.message || 'Verification failed. Incorrect code.');
        } finally {
            setIsBypassLoading(false);
        }
    };

    // ─── MFA Logic ───
    const handleEnable2FA = async () => {
        try {
            // Cleanup any abandoned unverified factors to prevent 422 Unprocessable Entity
            const { data: listData } = await supabase.auth.mfa.listFactors();
            if (listData?.totp) {
                const unverified = listData.totp.filter(f => f.status !== 'verified');
                for (const factor of unverified) {
                    await supabase.auth.mfa.unenroll({ factorId: factor.id });
                }
            }

            const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
            if (error) throw error;
            setMfaFactorId(data.id);
            setMfaSecret(data.totp.secret);
            setQrCodeSvg(data.totp.qr_code);
            setIsEnrolling(true);
            setOtpCode('');
        } catch (e: any) {
            toast.error(e.message || 'Failed to start 2FA enrollment. Please try again.');
        }
    };

    const handleVerifyOTP = async () => {
        if (!/^\d{6}$/.test(otpCode)) return toast.error('OTP must be exactly 6 digits.');
        setIsOtpLoading(true);
        try {
            const challenge = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
            if (challenge.error) throw challenge.error;

            const verify = await supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: challenge.data.id,
                code: otpCode,
            });
            if (verify.error) throw verify.error;

            setIs2FAEnabled(true);
            setIsEnrolling(false);
            toast.success('2FA successfully activated!');

            // Sync with DB
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({ '2fa_enabled': true }).eq('id', user.id);
            }
        } catch (e: any) {
            toast.error(e.message || 'Invalid OTP code.');
        } finally {
            setIsOtpLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm('Are you sure you want to disable Two-Factor Authentication? This makes your account less secure.')) return;
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) throw error;

            const totpFactor = data.totp.find(f => f.status === 'verified');
            if (totpFactor) {
                const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
                if (unenrollError) throw unenrollError;

                setIs2FAEnabled(false);
                toast.success('2FA disabled successfully');

                // Sync with DB
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('profiles').update({ '2fa_enabled': false }).eq('id', user.id);
                }
            }
        } catch (e: any) {
            toast.error(e.message || 'Failed to disable 2FA.');
        }
    };

    // ─── Render ───
    return (
        <div className={styles.card}>
            <style>{`.ring-error { border-color: #f87171 !important; }`}</style>

            {/* Header */}
            <div className={styles.cardHeader}>
                <div className="text-start">
                    <h3 className={styles.cardTitle}>{txt.title}</h3>
                    <p className={styles.cardSubtitle}>{txt.subtitle}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.9rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '99px' }}>
                    <ShieldCheck size={14} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>{txt.secured}</span>
                </div>
            </div>

            {/* Password Form OR Bypass Prompt */}
            {isMfaBypass ? (
                <div style={{ maxWidth: '480px', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4 className="text-start" style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={18} color="#a78bfa" /> {txt.mfaRequired}
                    </h4>
                    <p className="text-start" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                        {txt.mfaDesc}
                    </p>

                    <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
                        <input type="text" maxLength={6} value={bypassOtp} onChange={(e) => setBypassOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000" className={styles.input} style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 600 }} autoFocus />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={() => { setIsMfaBypass(false); setPendingPassword(''); setBypassOtp(''); }} className={styles.actionBtn} style={{ flex: 1, justifyContent: 'center' }}>
                            {txt.cancel}
                        </button>
                        <button type="button" onClick={handleVerifyBypass} disabled={isBypassLoading || bypassOtp.length !== 6} className={`${styles.actionBtn} ${styles.primaryBtn}`} style={{ flex: 1, justifyContent: 'center' }}>
                            {isBypassLoading ? txt.verifying : txt.verify}
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <PasswordField id="currentPassword" label={txt.currentPw} placeholder={txt.currentPwPlace}
                        reg={register('currentPassword')} error={errors.currentPassword?.message} />

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                    <PasswordField id="newPassword" label={txt.newPw} placeholder={txt.newPwPlace}
                        reg={register('newPassword')} error={errors.newPassword?.message}>
                        <StrengthMeter password={newPw} txt={txt} />
                    </PasswordField>

                    <PasswordField id="confirmPassword" label={txt.confirmPw} placeholder={txt.confirmPwPlace}
                        reg={register('confirmPassword')} error={errors.confirmPassword?.message} />

                    <button type="submit" disabled={isSubmitting} className={`${styles.actionBtn} ${styles.primaryBtn}`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.85rem' }}>
                        <Save size={16} /> {isSubmitting ? txt.updating : txt.update}
                    </button>
                </form>
            )}

            {/* 2FA Status Card */}
            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 className="text-start" style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
                    <Shield size={16} style={{ display: 'inline', marginInlineEnd: '0.5rem', verticalAlign: 'middle' }} />
                    {txt.totpTitle}
                </h4>

                {isEnrolling && !is2FAEnabled ? (
                    // Enrollment view
                    <div className={styles.securityCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{txt.scanQr}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{txt.scanDesc}</p>
                        </div>

                        {/* QR Code White Background for Contrast */}
                        <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src={qrCodeSvg} alt="2FA QR Code" style={{ width: '150px', height: '150px', display: 'block' }} />
                        </div>

                        {/* Recovery Secret Key */}
                        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px dashed #475569', textAlign: 'center', width: '100%' }}>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>{txt.manualKey}<br /><strong style={{ color: '#f87171' }}>{txt.saveKey}</strong></p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <code style={{ color: '#a78bfa', letterSpacing: '1px', fontSize: '1.2rem', fontWeight: 600 }}>{mfaSecret}</code>
                                <button type="button" onClick={() => { navigator.clipboard.writeText(mfaSecret); toast.success('Secret copied to clipboard!'); }}
                                    style={{ background: 'transparent', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: '4px' }} title="Copy to clipboard">
                                    <Copy size={20} />
                                </button>
                            </div>
                        </div>

                        {/* OTP Verification Input */}
                        <div style={{ width: '100%', maxWidth: '300px' }}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label} style={{ textAlign: 'center' }}>{txt.enterCode}</label>
                                <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                                    placeholder="123456" className={styles.input} style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 600 }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '300px', marginTop: '0.5rem' }}>
                            <button type="button" onClick={() => setIsEnrolling(false)} disabled={isOtpLoading} className={styles.actionBtn} style={{ flex: 1, justifyContent: 'center' }}>
                                {txt.cancel}
                            </button>
                            <button type="button" onClick={handleVerifyOTP} disabled={isOtpLoading || otpCode.length !== 6} className={`${styles.actionBtn} ${styles.primaryBtn}`} style={{ flex: 1, justifyContent: 'center' }}>
                                {isOtpLoading ? txt.verifying : txt.verify}
                            </button>
                        </div>
                    </div>
                ) : (
                    // Default state (Enabled or Disabled)
                    <div className={styles.securityCard}>
                        <div className={styles.securityContent}>
                            <div className={`${styles.securityIconBox} ${styles.iconBlue}`} style={{ background: is2FAEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(56,189,248,0.15)', color: is2FAEnabled ? '#10b981' : '#38bdf8' }}>
                                <Shield size={24} />
                            </div>
                            <div className={`${styles.securityInfo} text-start`}>
                                <h4>{txt.authApp}</h4>
                                <p>{txt.authAppDesc}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {is2FAEnabled ? (
                                <>
                                    <span className={styles.roleBadge} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        {txt.active}
                                    </span>
                                    <button className={styles.actionBtn} type="button" onClick={handleDisable2FA}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                        {txt.disable2fa}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className={styles.roleBadge} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        {txt.disabled}
                                    </span>
                                    <button className={`${styles.actionBtn} ${styles.primaryBtn}`} type="button" onClick={handleEnable2FA}>
                                        {txt.enable2fa}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
