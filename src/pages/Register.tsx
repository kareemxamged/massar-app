import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import StepIndicator from '../components/register/StepIndicator';
import PasswordStrength from '../components/register/PasswordStrength';
import RoleCard from '../components/register/RoleCard';
import styles from './Register.module.css';

const DEPARTMENTS = ['Computer Science', 'Engineering', 'Science', 'Mathematics', 'Arts & Humanities', 'Business'];
const DEGREES = ['PhD', 'MSc', 'BSc', 'Professor', 'Assistant Professor'];

export default function Register() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth(); // Get auth state
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'student') navigate('/student/dashboard');
            else if (user.role === 'teacher') navigate('/teacher/dashboard');
            else if (user.role === 'admin') navigate('/admin/dashboard');
            else navigate('/');
        }
    }, [user, navigate]);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        role: '',
        // Student Details
        studentId: '',
        major: '',
        level: '',
        // Teacher Details
        employeeId: '',
        department: '',
        subjects: '',
        specialization: '',
        academicDegree: '',
        yearsOfExperience: ''
    });

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('reg_progress');
        if (saved) {
            setFormData(JSON.parse(saved));
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('reg_progress', JSON.stringify(formData));
    }, [formData]);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.fullName || !formData.email || !formData.password) {
                setError('Please fill in all required fields');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }
        }
        if (step === 2 && !formData.role) {
            setError('Please select a role');
            return;
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    // Success State
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            // Prepare Metadata
            const metadata: any = {
                role: formData.role.toLowerCase(),
                date_of_birth: formData.dateOfBirth || null,
            };

            if (formData.role === 'student') {
                metadata.student_id = formData.studentId;
                metadata.major = formData.major;
                metadata.level = formData.level;
            } else if (formData.role === 'teacher' || formData.role === 'admin') {
                metadata.employee_id = formData.employeeId;
                metadata.department = formData.department;
                if (formData.role === 'teacher') {
                    metadata.specialization = formData.specialization;
                    metadata.academic_degree = formData.academicDegree;
                    metadata.years_of_experience = formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : 0;
                }
            }

            // 1. Sign Up (Trigger will handle profile creation)
            const { user, session } = await authService.signUp(formData.email, formData.password, formData.fullName, metadata);

            if (user && !session) {
                // Email confirmation required
                setSuccess(true);
                localStorage.removeItem('reg_progress');
            } else if (user && session) {
                // Auto-login success (if email confirm is off)
                localStorage.removeItem('reg_progress');
                if (formData.role === 'student') navigate('/student/dashboard');
                else if (formData.role === 'teacher') navigate('/teacher/dashboard');
                else if (formData.role === 'admin') navigate('/admin/dashboard');
                else navigate('/login');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className={`${styles.card} glass-card`} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✉️</div>
                    <h2 className={styles.title}>Verify Your Email</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        We've sent a confirmation link to <strong>{formData.email}</strong>.<br />
                        Please check your inbox to complete your registration.
                    </p>
                    <Link to="/login" className="btn-primary">Back to Login</Link>
                </div>
            </div>
        );
    }

    if (authLoading) return null;

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-card`}>
                <h2 className={styles.title}>Create New Account</h2>
                <StepIndicator currentStep={step} totalSteps={3} />

                {error && <div className={styles.error}>{error}</div>}

                {/* STEP 1: Basic Info */}
                {step === 1 && (
                    <div className={styles.stepContent}>
                        <h3>Basic Information</h3>
                        <div className={styles.formGroup}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={e => updateField('fullName', e.target.value)}
                                placeholder="Ahmed Mohamed"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => updateField('email', e.target.value)}
                                placeholder="ahmed@example.com"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={e => updateField('password', e.target.value)}
                                    className={styles.input}
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
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
                            <PasswordStrength password={formData.password} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Confirm Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={e => updateField('confirmPassword', e.target.value)}
                                    className={styles.input}
                                    style={{ paddingRight: '48px' }}
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    title={showConfirmPassword ? "Hide password" : "Show password"}
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

                        {/* Date of Birth — applies to all roles */}
                        <div className={styles.formGroup}>
                            <label>Date of Birth <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(optional)</span></label>
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={e => updateField('dateOfBirth', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className={styles.input}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: Role Selection */}
                {step === 2 && (
                    <div className={styles.stepContent}>
                        <h3>Choose your role</h3>
                        <div className={styles.roleGrid}>
                            <RoleCard
                                role="student"
                                label="Student"
                                icon="👨‍🎓"
                                selected={formData.role === 'student'}
                                onSelect={r => updateField('role', r)}
                            />
                            <RoleCard
                                role="teacher"
                                label="Teacher"
                                icon="👨‍🏫"
                                selected={formData.role === 'teacher'}
                                onSelect={r => updateField('role', r)}
                            />
                            <RoleCard
                                role="admin"
                                label="Admin"
                                icon="👨‍💼"
                                selected={formData.role === 'admin'}
                                onSelect={r => updateField('role', r)}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 3: Details */}
                {step === 3 && (
                    <div className={styles.stepContent}>
                        <h3>Additional Details</h3>

                        {formData.role === 'student' && (
                            <>
                                <div className={styles.formGroup}>
                                    <label>Student ID</label>
                                    <input type="text" className={styles.input}
                                        value={formData.studentId} onChange={e => updateField('studentId', e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Major</label>
                                    <select className={styles.input} value={formData.major} onChange={e => updateField('major', e.target.value)}>
                                        <option value="">Select Major</option>
                                        <option value="cs">Computer Science</option>
                                        <option value="it">Information Technology</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Level</label>
                                    <select className={styles.input} value={formData.level} onChange={e => updateField('level', e.target.value)}>
                                        <option value="">Select Level</option>
                                        <option value="1">Level 1</option>
                                        <option value="2">Level 2</option>
                                        <option value="3">Level 3</option>
                                        <option value="4">Level 4</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {(formData.role === 'teacher' || formData.role === 'admin') && (
                            <>
                                <div className={styles.formGroup}>
                                    <label>Employee ID</label>
                                    <input type="text" className={styles.input}
                                        value={formData.employeeId} onChange={e => updateField('employeeId', e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Department</label>
                                    <select className={styles.input} value={formData.department} onChange={e => updateField('department', e.target.value)}>
                                        <option value="">Select Department...</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

                        {formData.role === 'teacher' && (
                            <>
                                <div className={styles.formGroup}>
                                    <label>Specialization</label>
                                    <input type="text" className={styles.input} placeholder="e.g. Quantum Mechanics"
                                        value={formData.specialization} onChange={e => updateField('specialization', e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Academic Degree</label>
                                    <select className={styles.input} value={formData.academicDegree} onChange={e => updateField('academicDegree', e.target.value)}>
                                        <option value="">Select Degree...</option>
                                        {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Years of Experience</label>
                                    <input type="number" min="0" max="50" className={styles.input} placeholder="0"
                                        value={formData.yearsOfExperience} onChange={e => updateField('yearsOfExperience', e.target.value)} />
                                </div>
                            </>
                        )}

                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" id="terms" required />
                            <label htmlFor="terms">I agree to the Terms & Conditions</label>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className={styles.actions}>
                    {step > 1 ? (
                        <button className={styles.backBtn} onClick={prevStep}>Back</button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {step < 3 ? (
                        <button className="btn-primary" onClick={nextStep}>Next step</button>
                    ) : (
                        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    )}
                </div>

                <div className={styles.footerLink}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login here</Link>
                </div>

            </div>
        </div>
    );
}
