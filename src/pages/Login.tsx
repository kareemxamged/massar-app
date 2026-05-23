import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { supabase } from '../services/supabase';
import LanguageToggle from '../components/LanguageToggle';
import styles from './Login.module.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { Shield } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading, refreshProfile } = useAuth();
    const { i18n } = useTranslation();
    const isRtl = i18n.language.startsWith('ar');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auth Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // 2FA / MFA State
    const [showMFA, setShowMFA] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [mfaFactorId, setMfaFactorId] = useState('');
    const [isMfaLoading, setIsMfaLoading] = useState(false);

    const loginSuccessRef = useRef(false);

    const handleRoleRedirect = useCallback(async () => {
        try {
            const from = (location.state as any)?.from?.pathname;
            if (from && !from.includes('/login')) {
                navigate(from, { replace: true });
                return;
            }

            let role = 'student';
            try {
                let profile = user;
                if (!profile) profile = await refreshProfile();

                // When 2FA is needed, this might fail or return null due to RLS, which is handled correctly
                if (profile && profile.role) role = profile.role;
            } catch (profileErr) {
                console.error("Login: Profile fetch failed, defaulting to student", profileErr);
            }

            switch (role) {
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'teacher':
                    navigate('/teacher/dashboard');
                    break;
                case 'student':
                    navigate('/student/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            navigate('/student/dashboard');
        }
    }, [location.state, navigate, refreshProfile, user]);

    // 1. Check if user is ALREADY fully logged in on mount
    useEffect(() => {
        if (user) {
            handleRoleRedirect();
        }
    }, [user, handleRoleRedirect]);

    // 2. Initial AAL Check on Mount (to catch any stranded aal1 sessions on refresh)
    useEffect(() => {
        supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data: aal }) => {
            if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
                // We have an active session but it's only aal1. Reveal the MFA prompt immediately.
                supabase.auth.mfa.listFactors().then(({ data: factors }) => {
                    const totpFactor = factors?.totp.find(f => f.status === 'verified');
                    if (totpFactor) {
                        setMfaFactorId(totpFactor.id);
                        setShowMFA(true);
                    }
                });
            }
        });
    }, []);

    // 3. Listen to Auth State Changes
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Dislodge from Supabase auth lock execution thread
                setTimeout(async () => {
                    // Before considering it a valid login, check Assurance Level
                    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

                    if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
                        // Halt! Require 2FA verification.
                        const factors = await supabase.auth.mfa.listFactors();
                        const totpFactor = factors.data?.totp.find(f => f.status === 'verified');
                        if (totpFactor) {
                            setMfaFactorId(totpFactor.id);
                            setShowMFA(true);
                            setLoading(false);
                            return; // Stop flow
                        }
                    }

                    // If fully authenticated (aal2 or no 2FA required)
                    loginSuccessRef.current = true;
                    setLoading(false);
                    await handleRoleRedirect();
                }, 10);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate, handleRoleRedirect]);



    // ─── LOGIN HANDLER ───
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        loginSuccessRef.current = false;

        try {
            const performLogin = async () => {
                const { user: authUser } = await authService.signIn(email, password);

                if (authUser && !loginSuccessRef.current) {
                    // Check AAL because authListener might be delayed
                    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

                    if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
                        const factors = await supabase.auth.mfa.listFactors();
                        const totpFactor = factors.data?.totp.find(f => f.status === 'verified');
                        if (totpFactor) {
                            setMfaFactorId(totpFactor.id);
                            setShowMFA(true);
                            return; // Stop redirect, wait for MFA
                        }
                    }

                    // AAL1 perfectly fine (2FA not enabled)
                    await handleRoleRedirect();
                }
            };

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timed out. Please check your connection.')), 10000)
            );

            await Promise.race([performLogin(), timeoutPromise]);
        } catch (err: any) {
            if (loginSuccessRef.current || showMFA) return;

            let message = err.message || (isRtl ? 'فشل تسجيل الدخول' : 'Failed to login');
            if (message === 'Invalid login credentials') {
                message = isRtl ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.' : 'Incorrect email or password. Please try again.';
            } else if (message.includes('Email not confirmed')) {
                message = isRtl ? 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.' : 'Please verify your email address before logging in.';
            }
            setError(message);
        } finally {
            if (!loginSuccessRef.current && !showMFA) {
                setLoading(false);
            }
        }
    };

    // ─── VERIFY 2FA HANDLER ───
    const handleVerifyMFA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otpCode.length !== 6) {
            setError(isRtl ? 'يرجى إدخال رمز صحيح مكون من 6 أرقام.' : 'Please enter a valid 6-digit code.');
            return;
        }
        setIsMfaLoading(true);
        setError('');

        try {
            console.log('Login: Sending MFA challenge for factor', mfaFactorId);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('MFA request timed out. Check network.')), 8000));

            const challengeTask = supabase.auth.mfa.challenge({ factorId: mfaFactorId });
            const challenge: any = await Promise.race([challengeTask, timeoutPromise]);
            if (challenge.error) throw challenge.error;

            console.log('Login: Sending MFA verify with code', otpCode);
            const verifyTask = supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: challenge.data.id,
                code: otpCode,
            });
            const verify: any = await Promise.race([verifyTask, timeoutPromise]);
            if (verify.error) throw verify.error;

            console.log('Login: MFA Verification successful. Elevating session to aal2.');
            loginSuccessRef.current = true;

            // Wait briefly to allow global AuthProvider to digest the TOKEN_REFRESHED event natively
            await new Promise(r => setTimeout(r, 600));

            // Force global useAuth cache to fetch and store the user BEFORE navigating
            await refreshProfile();

            await handleRoleRedirect();
        } catch (err: any) {
            console.error('Login: MFA Verify Error:', err);
            setError(err.message || (isRtl ? 'رمز مصادقة غير صالح أو خطأ في الاتصال.' : 'Invalid Two-Factor Auth code or connection error.'));
        } finally {
            setIsMfaLoading(false);
        }
    };

    const handleCancelMFA = async () => {
        await supabase.auth.signOut();
        setShowMFA(false);
        setOtpCode('');
        setError('');
        setLoading(false);
    };

    if (authLoading || (user && !showMFA)) {
        return <LoadingSpinner fullScreen text="Checking session..." />;
    }

    return (
        <div
            className={styles.container}
            style={{
                direction: isRtl ? 'rtl' : 'ltr',
                fontFamily: isRtl ? "'Cairo', 'Tajawal', sans-serif" : "'Inter', sans-serif"
            }}
        >
            <div className={styles.languageToggleWrapper}>
                <LanguageToggle />
            </div>

            <div className={`${styles.card} glass-card`}>

                {showMFA ? (
                    // ─── MFA VIEW ───
                    <>
                        <div className={styles.logoSection}>
                            <div style={{
                                background: 'rgba(139, 92, 246, 0.15)',
                                color: '#a78bfa',
                                width: '72px',
                                height: '72px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem auto',
                                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
                            }}>
                                <Shield size={32} />
                            </div>
                            <h2 className={styles.title}>{isRtl ? 'المصادقة الثنائية' : 'Two-Factor Auth'}</h2>
                            <p className={styles.subtitle}>{isRtl ? 'أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة' : 'Enter the 6-digit code from your authenticator app.'}</p>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <form onSubmit={handleVerifyMFA}>
                            <div className={styles.formGroup}>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // only digits
                                        className={styles.input}
                                        style={{ textAlign: 'center', letterSpacing: isRtl ? '1rem' : '0.8rem', fontSize: '1.5rem', fontWeight: 700, padding: '1rem', width: '200px' }}
                                        placeholder={isRtl ? "٠٠٠٠٠٠" : "000000"}
                                        autoComplete="one-time-code"
                                        inputMode="numeric"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }} disabled={isMfaLoading || otpCode.length !== 6}>
                                {isMfaLoading ? (isRtl ? 'جاري التحقق...' : 'Verifying...') : (isRtl ? 'تحقق من الرمز' : 'Verify Code')}
                            </button>

                            <button type="button" onClick={handleCancelMFA} style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
                                {isRtl ? 'إلغاء والعودة لتسجيل الدخول' : 'Cancel & Back to Login'}
                            </button>
                        </form>
                    </>
                ) : (
                    // ─── STANDARD LOGIN VIEW ───
                    <>
                        <div className={styles.logoSection}>
                            <div className={styles.logo}>🎓</div>
                            <h2 className={styles.title}>{isRtl ? 'مرحباً بعودتك' : 'Welcome Back'}</h2>
                            <p className={styles.subtitle}>{isRtl ? 'قم بتسجيل الدخول للوصول إلى حسابك' : 'Sign in to access your account'}</p>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <form onSubmit={handleLogin}>
                            <div className={styles.formGroup}>
                                <label style={{ textAlign: isRtl ? 'start' : 'left' }}>{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                                <input
                                    type="email"
                                    placeholder={isRtl ? "name@example.com" : "name@example.com"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label style={{ textAlign: isRtl ? 'start' : 'left' }}>{isRtl ? 'كلمة المرور' : 'Password'}</label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder={isRtl ? "••••••••" : "••••••••"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={styles.input}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? (isRtl ? 'إخفاء كلمة المرور' : "Hide password") : (isRtl ? 'إظهار كلمة المرور' : "Show password")}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.optionsRow}>
                                <label className={styles.rememberMe}>
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    {isRtl ? 'تذكرني' : 'Remember me'}
                                </label>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? (isRtl ? 'جاري تسجيل الدخول...' : 'Signing in...') : (isRtl ? 'تسجيل الدخول' : 'Sign In')}
                            </button>
                        </form>
                    </>
                )}

            </div>
        </div>
    );
};

export default Login;
