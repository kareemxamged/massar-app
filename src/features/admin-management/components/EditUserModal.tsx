import { useState, useEffect } from 'react';
import { X, Save, GraduationCap, UserCircle } from 'lucide-react';
import Portal from '../../../components/Portal';
import { adminApi } from '../api/adminApi';
import type { UserProfile, Major, AcademicLevel } from '../../../types';

interface Props {
  user: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
  majors?: Major[];
  academicLevels?: AcademicLevel[];
}

export default function EditUserModal({ user, onClose, onSuccess, majors = [], academicLevels = [] }: Props) {
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    major_id: '',
    level_id: '',
    employee_id: '',
    department: '',
    specialization: '',
    mobile: '',
    date_of_birth: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      full_name: user.full_name || '',
      student_id: user.student_id || '',
      major_id: user.major_id?.toString() || '',
      level_id: user.level_id?.toString() || '',
      employee_id: user.employee_id || '',
      department: user.department || '',
      specialization: user.specialization || '',
      mobile: user.mobile || '',
      date_of_birth: user.date_of_birth || '',
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData: Partial<UserProfile> = {
        full_name: formData.full_name,
        mobile: formData.mobile || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        ...(user.role === 'student' && {
          student_id: formData.student_id,
          major_id: formData.major_id ? parseInt(formData.major_id) : undefined,
          level_id: formData.level_id ? parseInt(formData.level_id) : undefined,
        }),
        ...(user.role === 'teacher' && {
          employee_id: formData.employee_id,
          department: formData.department,
          specialization: formData.specialization,
        }),
      };

      await adminApi.updateUser(user.id, updateData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
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
        <button onClick={onClose} className="absolute top-4 right-4 btn-icon" style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div 
            className="p-2 rounded-lg" 
            style={{ background: user.role === 'student' ? 'rgba(56,189,248,0.2)' : 'rgba(167,139,250,0.2)' }}
          >
            {user.role === 'student' ? (
              <GraduationCap size={24} style={{ color: '#38bdf8' }} />
            ) : (
              <UserCircle size={24} style={{ color: '#a78bfa' }} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
              Edit {user.role === 'student' ? 'Student' : 'Teacher'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {user.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
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
            />
          </div>

          {user.role === 'student' ? (
            <>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Student ID</label>
                <input
                  type="text"
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Major</label>
                  <select
                    value={formData.major_id}
                    onChange={(e) => handleChange('major_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="">Select Major</option>
                    {majors.map(major => (
                      <option key={major.id} value={major.id}>{major.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Level</label>
                  <select
                    value={formData.level_id}
                    onChange={(e) => handleChange('level_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none' }}
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
                  />
                </div>
              </div>
            </>
          )}

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

          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(251,113,133,0.1)', color: '#fb7185' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}
