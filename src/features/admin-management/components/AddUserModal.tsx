import { useState } from 'react';
import { X, UserPlus, GraduationCap, UserCircle } from 'lucide-react';
import Portal from '../../../components/Portal';
import { adminApi } from '../api/adminApi';
import type { UserProfile, Major, AcademicLevel } from '../../../types';

interface Props {
  role: 'student' | 'teacher';
  onClose: () => void;
  onSuccess: () => void;
  majors?: Major[];
  academicLevels?: AcademicLevel[];
}

export default function AddUserModal({ role, onClose, onSuccess, majors = [], academicLevels = [] }: Props) {
  const [formData, setFormData] = useState({
    // Common
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    date_of_birth: '',
    mobile: '',
    // Student
    student_id: '',
    major_id: '',
    level_id: '',
    // Teacher - Personal
    headline: '',
    bio: '',
    // Teacher - Academic
    employee_id: '',
    department: '',
    specialization: '',
    academic_degree: '',
    years_experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.confirm_password) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      const userData: Partial<UserProfile> = {
        full_name: formData.full_name,
        email: formData.email,
        role,
        date_of_birth: formData.date_of_birth || undefined,
        mobile: formData.mobile || undefined,
        ...(role === 'student' && {
          student_id: formData.student_id,
          major_id: formData.major_id ? parseInt(formData.major_id) : undefined,
          level_id: formData.level_id ? parseInt(formData.level_id) : undefined,
        }),
        ...(role === 'teacher' && {
          employee_id: formData.employee_id,
          department: formData.department,
          specialization: formData.specialization,
          headline: formData.headline || undefined,
          bio: formData.bio || undefined,
          academic_degree: formData.academic_degree || undefined,
          years_experience: formData.years_experience ? parseInt(formData.years_experience) : undefined,
        }),
      };

      await adminApi.createUser(userData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Portal>
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 400, background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card w-full max-w-md p-6 relative" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 btn-icon"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="p-2 rounded-lg" 
            style={{ background: role === 'student' ? 'rgba(56,189,248,0.2)' : 'rgba(167,139,250,0.2)' }}
          >
            {role === 'student' ? (
              <GraduationCap size={24} style={{ color: '#38bdf8' }} />
            ) : (
              <UserCircle size={24} style={{ color: '#a78bfa' }} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
              Add New {role === 'student' ? 'Student' : 'Teacher'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Create a new {role} account
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Fields */}
          <div>
            <label 
              className="block text-sm mb-1" 
              style={{ color: 'var(--text-muted)' }}
            >
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'var(--text-main)',
                outline: 'none'
              }}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label 
              className="block text-sm mb-1" 
              style={{ color: 'var(--text-muted)' }}
            >
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'var(--text-main)',
                outline: 'none'
              }}
              placeholder="Enter email address"
            />
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label 
                className="block text-sm mb-1" 
                style={{ color: 'var(--text-muted)' }}
              >
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
                placeholder="Enter password"
              />
            </div>
            <div>
              <label 
                className="block text-sm mb-1" 
                style={{ color: 'var(--text-muted)' }}
              >
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={formData.confirm_password}
                onChange={(e) => handleChange('confirm_password', e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label 
              className="block text-sm mb-1" 
              style={{ color: 'var(--text-muted)' }}
            >
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>

          {/* Role-specific fields */}
          {role === 'student' ? (
            <>
              <div>
                <label 
                  className="block text-sm mb-1" 
                  style={{ color: 'var(--text-muted)' }}
                >
                  Student ID
                </label>
                <input
                  type="text"
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                  placeholder="Enter student ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label 
                    className="block text-sm mb-1" 
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Major
                  </label>
                  <select
                    value={formData.major_id}
                    onChange={(e) => handleChange('major_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      color: 'var(--text-main)',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Major</option>
                    {majors.map(major => (
                      <option key={major.id} value={major.id}>{major.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label 
                    className="block text-sm mb-1" 
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Level
                  </label>
                  <select
                    value={formData.level_id}
                    onChange={(e) => handleChange('level_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      color: 'var(--text-main)',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Level</option>
                    {academicLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Mobile</label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleChange('mobile', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.confirm_password}
                      onChange={(e) => handleChange('confirm_password', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Date of Birth</label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleChange('date_of_birth', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Headline</label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => handleChange('headline', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                      placeholder="e.g. Senior Professor"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none', minHeight: '80px' }}
                    placeholder="Brief professional biography..."
                  />
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="space-y-4 mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Academic Information
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Employee ID</label>
                    <input
                      type="text"
                      value={formData.employee_id}
                      onChange={(e) => handleChange('employee_id', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Academic Degree</label>
                    <select
                      value={formData.academic_degree}
                      onChange={(e) => handleChange('academic_degree', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                    >
                      <option value="">Select Degree</option>
                      <option value="bachelor">Bachelor's</option>
                      <option value="master">Master's</option>
                      <option value="phd">PhD</option>
                      <option value="professor">Professor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Specialization</label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => handleChange('specialization', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                      placeholder="e.g. AI & ML"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.years_experience}
                    onChange={(e) => handleChange('years_experience', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div 
              className="p-3 rounded-lg text-sm" 
              style={{ background: 'rgba(251,113,133,0.1)', color: '#fb7185' }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading || !formData.full_name || !formData.email || !formData.password || !formData.confirm_password}
            >
              {loading ? (
                'Creating...'
              ) : (
                <>
                  <UserPlus size={16} /> 
                  Create {role === 'student' ? 'Student' : 'Teacher'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}
