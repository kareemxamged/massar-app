import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth';
import { supabase } from '../services/supabase';
import PasswordStrength from '../components/register/PasswordStrength';
import styles from './Login.module.css';

// Enhanced Toast Component
const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
    <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#10B981' : '#EF4444',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '90vw'
    }}>
        <span style={{ fontSize: '1.2rem' }}>{type === 'success' ? '✅' : '❌'}</span>
        <span style={{ fontWeight: 500 }}>{message}</span>
        <style>{`
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `}</style>
    </div>
);

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // --- State Management ---
    const [isVerifying, setIsVerifying] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Form States
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Process States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);

    const verifiedOnce = useRef(false);
    const updateSuccessRef = useRef(false); // Track success via event to ignore promise errors

    // --- 1. Session Verification Logic ---
    useEffect(() => {
        let mounted = true;
        let authSubscription: any = null;

        const verifySession = async () => {
            const errorDescription = searchParams.get('error_description');
            if (errorDescription) {
                if (mounted) {
                    setError(decodeURIComponent(errorDescription));
                    setIsVerifying(false);
                }
                return;
            }

            const hasHash = window.location.hash && window.location.hash.length > 5;
            console.log('ResetPassword: URL Hash detected:', hasHash);

            try {
                if (!hasHash) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        console.log('ResetPassword: Verify - Existing Session found (No Hash)');
                        if (mounted) {
                            setIsAuthenticated(true);
                            setIsVerifying(false);
                        }
                        return;
                    }
                } else {
                    console.log('ResetPassword: Hash present. Waiting for auth event...');
                }

                const timeoutId = setTimeout(() => {
                    if (mounted && !verifiedOnce.current) {
                        console.log('ResetPassword: Verify - Timeout reached (No valid event)');
                        const checkAgain = async () => {
                            const { data: { session } } = await supabase.auth.getSession();
                            if (session) {
                                console.log('ResetPassword: Verify - Session found after timeout');
                                if (mounted) {
                                    setIsAuthenticated(true);
                                    setIsVerifying(false);
                                }
                            } else {
                                if (mounted) {
                                    setError('Link expired or invalid. Please try again.');
                                    setIsVerifying(false);
                                }
                            }
                        };
                        checkAgain();
                    }
                }, 5000);

                const { data } = supabase.auth.onAuthStateChange((event, session) => {
                    console.log('ResetPassword: Auth Event:', event);

                    // Handle Verification
                    if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                        if (session) {
                            console.log('ResetPassword: Verify - Signed In via Link/Event');
                            verifiedOnce.current = true;
                            clearTimeout(timeoutId);
                            if (mounted) {
                                setIsAuthenticated(true);
                                setIsVerifying(false);
                            }
                        }
                    }

                    // Handle Update Success (Bypass Hanging Promise)
                    if (event === 'USER_UPDATED') {
                        console.log('ResetPassword: USER_UPDATED event detected! Marking success.');
                        updateSuccessRef.current = true;
                        if (mounted) {
                            setSuccess(true);
                            setIsSubmitting(false); // Stop spinner
                        }
                    }
                });
                authSubscription = data.subscription;

            } catch (err) {
                console.error('ResetPassword: Verify Error', err);
                if (mounted) {
                    setError('An unexpected error occurred during verification.');
                    setIsVerifying(false);
                }
            }
        };

        verifySession();

        return () => {
            mounted = false;
            if (authSubscription) authSubscription.unsubscribe();
        };
    }, [searchParams]);

    // --- 2. Countdown Effect ---
    useEffect(() => {
        if (success && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (success && countdown === 0) {
            navigate('/login');
        }
    }, [success, countdown, navigate]);


    // --- 3. Handlers ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('ResetPassword: handleSubmit triggered');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        updateSuccessRef.current = false; // Reset success tracker

        try {
            console.log('ResetPassword: Fetching current session details...');
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error('ResetPassword: NO SESSION before update!', sessionError);
                throw new Error('Session lost. Please try clicking the link again.');
            }

            console.log('ResetPassword: Session found for user:', session.user.id);

            console.log('ResetPassword: Calling authService.updatePassword...');
            await authService.updatePassword(password);
            console.log('ResetPassword: Update returned successfully');

            setSuccess(true);

        } catch (err: any) {
            console.error('ResetPassword: Submit Error details:', err);

            // CRITICAL: Check if we actually succeeded via event before showing error
            if (updateSuccessRef.current) {
                console.log('ResetPassword: Error ignored because USER_UPDATED event was received.');
                return;
            }

            setError(err.message || 'Failed to update password. Please try again.');
            setIsSubmitting(false);
        }
    };


    // --- RENDER STATES ---

    // A. Verifying / Loading
    if (isVerifying) {
        return (
            <div className={styles.container}>
                <div className={`${styles.card} glass-card`} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{
                        width: '40px', height: '40px',
                        border: '4px solid rgba(255,255,255,0.1)',
                        borderTop: '4px solid var(--primary)',
                        borderRadius: '50%',
                        margin: '0 auto 1rem',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Verifying Link...</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Please wait while we secure your session.</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    // B. Error State
    if (!isAuthenticated && !success) {
        return (
            <div className={styles.container}>
                <div className={`${styles.card} glass-card`} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 className={styles.title} style={{ color: '#EF4444' }}>Link Invalid or Expired</h2>
                    <p className={styles.subtitle}>
                        {error || "The password reset link is invalid or has expired. Please request a new one."}
                    </p>
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="btn-primary"
                        style={{ width: '100%', display: 'block', boxSizing: 'border-box' }}
                    >
                        Request New Link
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className={styles.logoutBtn}
                        style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid var(--border-glass)', padding: '0.75rem', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // C. Success State
    if (success) {
        return (
            <div className={styles.container}>
                <Toast message="Password updated successfully!" type="success" />
                <div className={`${styles.card} glass-card`} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 className={styles.title} style={{ color: '#10B981' }}>Password Updated!</h2>
                    <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
                        Your password has been changed successfully.
                    </p>
                    <div style={{
                        margin: '1rem 0',
                        color: 'var(--primary)',
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                    }}>
                        Redirecting to login in {countdown}...
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary"
                        style={{ width: '100%', display: 'block', boxSizing: 'border-box' }}
                    >
                        Go to Login Now
                    </button>
                </div>
            </div>
        );
    }

    // D. Main Form
    return (
        <div className={styles.container}>
            {error && <Toast message={error} type="error" />}

            <div className={`${styles.card} glass-card`}>
                <div className={styles.logoSection}>
                    <div className={styles.logo}>🔐</div>
                    <h2 className={styles.title}>Reset Password</h2>
                    <p className={styles.subtitle}>Create a new strong password</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>New Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                required
                                placeholder="••••••••"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                                disabled={isSubmitting}
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
                        <PasswordStrength password={password} />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Confirm New Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={styles.input}
                                required
                                placeholder="••••••••"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                title={showConfirmPassword ? "Hide password" : "Show password"}
                                disabled={isSubmitting}
                            >
                                {showConfirmPassword ? (
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

                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span className="spinner" style={{
                                    width: '16px', height: '16px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></span>
                                Updating Password...
                            </span>
                        ) : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
