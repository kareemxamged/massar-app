import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth';
import { supabase } from '../../services/supabase';
import LanguageToggle from '../../components/LanguageToggle';
import styles from './AdminLogin.module.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Shield, Lock, Mail, AlertCircle, ChevronRight } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { i18n } = useTranslation();
    const isRtl = i18n.language.startsWith('ar');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // 2FA State
    const [showMFA, setShowMFA] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [mfaFactorId, setMfaFactorId] = useState('');

    const loginSuccessRef = useRef(false);

    // Redirect if already logged in as admin
    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        } else if (user && (user.role === 'teacher' || user.role === 'student')) {
            // Non-admin users shouldn't be on admin login
            setError(isRtl ? 'تم رفض الوصول. مطلوب صلاحيات مسؤول.' : 'Access denied. Admin credentials required.');
        }
    }, [user, navigate, isRtl]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        loginSuccessRef.current = false;

        try {
            const performLogin = async () => {
                const { user: authUser } = await authService.signIn(email, password);

                if (authUser && !loginSuccessRef.current) {
                    // Check for 2FA
                    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

                    if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
                        const { data: factors } = await supabase.auth.mfa.listFactors();
                        const totpFactor = factors?.totp?.[0];
                        if (totpFactor) {
                            setMfaFactorId(totpFactor.id);
                            setShowMFA(true);
                            setLoading(false);
                            return;
                        }
                    }

                    // Check if user is admin
                    const profile = await authService.getCurrentProfile();
                    if (profile?.role !== 'admin') {
                        await supabase.auth.signOut();
                        throw new Error('Access denied. Admin credentials required.');
                    }

                    loginSuccessRef.current = true;
                    setLoading(false);
                    navigate('/admin/dashboard', { replace: true });
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
            }
            setError(message);
        } finally {
            if (!loginSuccessRef.current && !showMFA) {
                setLoading(false);
            }
        }
    };

    const handleMFA = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Get challenge first
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: mfaFactorId,
            });
            if (challengeError) throw challengeError;

            const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: challengeData.id,
                code: otpCode,
            });

            if (verifyError) throw verifyError;

            if (verifyData) {
                // Verify admin role after MFA
                const profile = await authService.getCurrentProfile();
                if (profile?.role !== 'admin') {
                    await supabase.auth.signOut();
                    throw new Error('Access denied. Admin credentials required.');
                }

                loginSuccessRef.current = true;
                navigate('/admin/dashboard', { replace: true });
            }
        } catch (err: any) {
            setError(err.message || (isRtl ? 'رمز تحقق غير صالح' : 'Invalid verification code'));
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className={styles.container}>
                <LoadingSpinner />
            </div>
        );
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

            <div className={styles.card}>
                {/* Logo */}
                <div className={styles.logo}>
                    <Shield size={48} className={styles.logoIcon} />
                    <h1 className={styles.title}>{isRtl ? 'بوابة الإدارة' : 'Admin Portal'}</h1>
                    <p className={styles.subtitle}>{isRtl ? 'الوصول إلى إدارة النظام' : 'System Management Access'}</p>
                </div>

                {/* MFA Form */}
                {showMFA ? (
                    <form onSubmit={handleMFA} className={styles.form}>
                        <div className={styles.mfaHeader}>
                            <Lock size={24} className={styles.mfaIcon} />
                            <h2>{isRtl ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</h2>
                            <p>{isRtl ? 'أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة' : 'Enter the 6-digit code from your authenticator app'}</p>
                        </div>

                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                placeholder={isRtl ? "٠٠٠٠٠٠" : "000000"}
                                maxLength={6}
                                className={styles.input}
                                style={{ textAlign: 'center', letterSpacing: isRtl ? '1rem' : '0.8rem', fontSize: '1.5rem', fontWeight: 700 }}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className={styles.error}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className={styles.button}>
                            {loading ? (isRtl ? 'جاري التحقق...' : 'Verifying...') : (isRtl ? 'تحقق من الرمز' : 'Verify Code')}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setShowMFA(false); setOtpCode(''); setError(''); }}
                            className={styles.backButton}
                        >
                            {isRtl ? 'إلغاء والعودة لتسجيل الدخول' : 'Back to Login'}
                        </button>
                    </form>
                ) : (
                    /* Login Form */
                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} style={{ textAlign: isRtl ? 'start' : 'left' }}>
                                <Mail size={16} />
                                {isRtl ? 'البريد الإلكتروني' : 'Admin Email'}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@exam.local"
                                className={styles.input}
                                required
                                autoFocus
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label} style={{ textAlign: isRtl ? 'start' : 'left' }}>
                                <Lock size={16} />
                                {isRtl ? 'كلمة المرور' : 'Password'}
                            </label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={isRtl ? "أدخل كلمة المرور" : "Enter your password"}
                                    className={styles.input}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.togglePassword}
                                >
                                    {showPassword ? (isRtl ? 'إخفاء' : 'Hide') : (isRtl ? 'إظهار' : 'Show')}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className={styles.error}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className={styles.button}
                        >
                            {loading ? (
                                <span className={styles.spinner}></span>
                            ) : (
                                <>
                                    {isRtl ? 'تسجيل الدخول كمسؤول' : 'Sign In as Admin'}
                                    <ChevronRight size={18} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                                </>
                            )}
                        </button>

                        <div className={styles.footer}>
                            <Link to="/login" className={styles.link}>
                                {isRtl ? 'تسجيل دخول الطالب / المعلم' : 'Student/Teacher Login'}
                            </Link>
                        </div>
                    </form>
                )}
            </div>

            {/* Security Notice */}
            <div className={styles.securityNotice}>
                <Shield size={14} />
                <span>{isRtl ? 'وصول آمن للمسؤولين - للموظفين المصرح لهم فقط' : 'Secure Admin Access - Authorized Personnel Only'}</span>
            </div>
        </div>
    );
};

export default AdminLogin;
