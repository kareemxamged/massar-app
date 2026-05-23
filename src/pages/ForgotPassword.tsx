import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth';
import styles from './Login.module.css'; // Reusing Login styles for consistency

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await authService.resetPassword(email);
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className={`${styles.card} glass-card`} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                    <h2 className={styles.title}>Check Your Email</h2>
                    <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
                        We've sent a password reset link to<br />
                        <strong>{email}</strong>
                    </p>
                    <Link to="/login" className="btn-primary" style={{ display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'center', marginTop: '1rem' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-card`}>
                <div className={styles.logoSection}>
                    <div className={styles.logo}>🔑</div>
                    <h2 className={styles.title}>Forgot Password?</h2>
                    <p className={styles.subtitle}>Enter your email to receive a reset link</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            // Reusing Register input styles if Login styles aren't enough, 
                            // but Login.module.css has .input defined so it's fine.
                            className={styles.input}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className={styles.signupLink}>
                    Remembered your password? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
