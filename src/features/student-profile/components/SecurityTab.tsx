import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, Shield, ShieldCheck, Save, Copy } from 'lucide-react';
import { supabase } from '../../../services/supabase';
import { toast } from 'react-hot-toast';
import styles from '../../../pages/student/StudentProfile.module.css';

// ─── Component ────────────────────────────────────────────────────────────────
export default function SecurityTab() {
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';

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

    function getStrength(pw: string): { score: number; label: string; color: string } {
        let score = 0;
        if (pw.length >= 8) score++;
        if (pw.length >= 12) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;

        if (score <= 1) return { score, label: t('studentProfile.securityTab.weak', 'Weak'), color: '#ef4444' };
        if (score === 2) return { score, label: t('studentProfile.securityTab.fair', 'Fair'), color: '#f59e0b' };
        if (score === 3) return { score, label: t('studentProfile.securityTab.good', 'Good'), color: '#3b82f6' };
        if (score === 4) return { score, label: t('studentProfile.securityTab.strong', 'Strong'), color: '#10b981' };
        return { score, label: t('studentProfile.securityTab.veryStrong', 'Very Strong'), color: '#6ee7b7' };
    }

    function StrengthMeter({ password }: { password: string }) {
        if (!password) return null;
        const { score, label, color } = getStrength(password);
        const pct = (score / 5) * 100;
        return (
            <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('studentProfile.securityTab.passwordStrength', 'Password Strength')}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color }}>{label}</span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden', transform: isRtl ? 'scaleX(-1)' : 'none' }}>
                    <div style={{
                        height: '100%', width: `${pct}%`, borderRadius: '99px',
                        background: color, transition: 'width 0.4s ease, background 0.4s ease'
                    }} />
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {[
                        [t('studentProfile.securityTab.req8Chars', '8+ chars'), password.length >= 8],
                        [t('studentProfile.securityTab.reqUppercase', 'Uppercase'), /[A-Z]/.test(password)],
                        [t('studentProfile.securityTab.reqNumber', 'Number'), /[0-9]/.test(password)],
                        [t('studentProfile.securityTab.reqSpecial', 'Special char'), /[^A-Za-z0-9]/.test(password)],
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
        const [show, setShow] = useState(false);
        return (
            <div className={styles.inputGroup} style={{ direction: i18n.dir() }}>
                <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Lock size={14} /> {label}
                </label>
                <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                    <input id={id} {...reg} type={show ? 'text' : 'password'}
                        placeholder={placeholder}
                        className={`${styles.input} ${error ? 'ring-error' : ''}`}
                        style={{
                            paddingRight: isRtl ? '1rem' : '3rem',
                            paddingLeft: isRtl ? '3rem' : '1rem',
                            textAlign: isRtl ? 'right' : 'left',
                            direction: isRtl ? 'rtl' : 'ltr'
                        }} />
                    <button type="button" onClick={() => setShow(s => !s)}
                        style={{
                            position: 'absolute',
                            right: isRtl ? 'auto' : '1rem',
                            left: isRtl ? '1rem' : 'auto',
                            top: '50%', transform: 'translateY(-50%)',
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
        <div className={styles.card} style={{ direction: i18n.dir() }}>
            <style>{`.ring-error { border-color: #f87171 !important; }`}</style>

            {/* Header */}
            <div className={styles.cardHeader}>
                <div>
                    <h3 className={styles.cardTitle}>{t('studentProfile.securityTab.title', 'Security & Login')}</h3>
                    <p className={styles.cardSubtitle}>{t('studentProfile.securityTab.subtitle', 'Update your password. All other sessions will be invalidated.')}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.9rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '99px' }}>
                    <ShieldCheck size={14} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>{t('studentProfile.securityTab.secured', 'Secured')}</span>
                </div>
            </div>

            {/* Password Form OR Bypass Prompt */}
            {isMfaBypass ? (
                <div style={{ maxWidth: '480px', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={18} color="#a78bfa" /> {t('studentProfile.securityTab.verificationRequired', 'Additional Verification Required')}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                        {t('studentProfile.securityTab.verificationDesc', 'Since you have Two-Factor Authentication enabled, please enter your 6-digit authenticator app code to confirm this password change.')}
                    </p>

                    <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
                        <input type="text" maxLength={6} value={bypassOtp} onChange={(e) => setBypassOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000" className={styles.input} style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 600, direction: 'ltr' }} autoFocus />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={() => { setIsMfaBypass(false); setPendingPassword(''); setBypassOtp(''); }} className={styles.actionBtn} style={{ flex: 1, justifyContent: 'center' }}>
                            {t('studentProfile.securityTab.cancel', 'Cancel')}
                        </button>
                        <button type="button" onClick={handleVerifyBypass} disabled={isBypassLoading || bypassOtp.length !== 6} className={`${styles.actionBtn} ${styles.primaryBtn}`} style={{ flex: 1, justifyContent: 'center' }}>
                            {isBypassLoading ? t('studentProfile.securityTab.verifying', 'Verifying…') : t('studentProfile.securityTab.verifyContinue', 'Verify & Continue')}
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <PasswordField id="currentPassword"
                        label={t('studentProfile.securityTab.currentPassword', 'Current Password')}
                        placeholder={t('studentProfile.securityTab.enterCurrentPw', 'Enter current password')}
                        reg={register('currentPassword')} error={errors.currentPassword?.message} />

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                    <PasswordField id="newPassword"
                        label={t('studentProfile.securityTab.newPassword', 'New Password')}
                        placeholder={t('studentProfile.securityTab.createStrongPw', 'Create a strong password')}
                        reg={register('newPassword')} error={errors.newPassword?.message}>
                        <StrengthMeter password={newPw} />
                    </PasswordField>

                    <PasswordField id="confirmPassword"
                        label={t('studentProfile.securityTab.confirmPassword', 'Confirm New Password')}
                        placeholder={t('studentProfile.securityTab.repeatNewPw', 'Repeat new password')}
                        reg={register('confirmPassword')} error={errors.confirmPassword?.message} />

                    <button type="submit" disabled={isSubmitting} className={`${styles.actionBtn} ${styles.primaryBtn}`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.85rem' }}>
                        <Save size={16} /> {isSubmitting ? t('studentProfile.securityTab.updating', 'Updating…') : t('studentProfile.securityTab.updatePassword', 'Update Password')}
                    </button>
                </form>
            )}

            {/* 2FA Status Card */}
            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={16} />
                    {t('studentProfile.securityTab.twoFactorAuth', 'Two-Factor Authentication (TOTP)')}
                </h4>

                {isEnrolling && !is2FAEnabled ? (
                    // Enrollment view
                    <div className={styles.securityCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t('studentProfile.securityTab.scanQr', 'Scan QR Code')}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('studentProfile.securityTab.scanDesc', 'Use Google Authenticator or similar TOTP app to scan.')}</p>
                        </div>

                        {/* QR Code White Background for Contrast */}
                        <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src={qrCodeSvg} alt="2FA QR Code" style={{ width: '150px', height: '150px', display: 'block' }} />
                        </div>

                        {/* Recovery Secret Key */}
                        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px dashed #475569', textAlign: 'center', width: '100%' }}>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>
                                {t('studentProfile.securityTab.manualKey', 'If you cannot scan the QR code, manually enter this Secret Key into your app.')}<br />
                                <strong style={{ color: '#f87171' }}>{t('studentProfile.securityTab.backupWarning', 'Save this key! It is your only backup recovery method.')}</strong>
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <code style={{ color: '#a78bfa', letterSpacing: '1px', fontSize: '1.2rem', fontWeight: 600, direction: 'ltr' }}>{mfaSecret}</code>
                                <button type="button" onClick={() => { navigator.clipboard.writeText(mfaSecret); toast.success('Secret copied to clipboard!'); }}
                                    style={{ background: 'transparent', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: '4px' }} title="Copy to clipboard">
                                    <Copy size={20} />
                                </button>
                            </div>
                        </div>

                        {/* OTP Verification Input */}
                        <div style={{ width: '100%', maxWidth: '300px' }}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label} style={{ textAlign: 'center' }}>{t('studentProfile.securityTab.enterCode', 'Enter 6-digit Code')}</label>
                                <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                                    placeholder="123456" className={styles.input} style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 600, direction: 'ltr' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '300px', marginTop: '0.5rem' }}>
                            <button type="button" onClick={() => setIsEnrolling(false)} disabled={isOtpLoading} className={styles.actionBtn} style={{ flex: 1, justifyContent: 'center' }}>
                                {t('studentProfile.securityTab.cancel', 'Cancel')}
                            </button>
                            <button type="button" onClick={handleVerifyOTP} disabled={isOtpLoading || otpCode.length !== 6} className={`${styles.actionBtn} ${styles.primaryBtn}`} style={{ flex: 1, justifyContent: 'center' }}>
                                {isOtpLoading ? t('studentProfile.securityTab.verifying', 'Verifying…') : t('studentProfile.securityTab.verify', 'Verify')}
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
                            <div className={styles.securityInfo}>
                                <h4>{t('studentProfile.securityTab.authApp', 'Authenticator App')}</h4>
                                <p>{t('studentProfile.securityTab.authAppDesc', 'Add an extra layer of security via a TOTP app')}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {is2FAEnabled ? (
                                <>
                                    <span className={styles.roleBadge} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        {t('studentProfile.securityTab.active', 'Active')}
                                    </span>
                                    <button className={styles.actionBtn} type="button" onClick={handleDisable2FA}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                        {t('studentProfile.securityTab.disable2FA', 'Disable 2FA')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className={styles.roleBadge} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        {t('studentProfile.securityTab.disabled', 'Disabled')}
                                    </span>
                                    <button className={`${styles.actionBtn} ${styles.primaryBtn}`} type="button" onClick={handleEnable2FA}>
                                        {t('studentProfile.securityTab.enable2FA', 'Enable 2FA')}
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
