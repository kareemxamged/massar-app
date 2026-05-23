import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Save } from 'lucide-react';
import Portal from '../../../components/Portal';
import { adminApi } from '../api/adminApi';
import { getSupabaseClient } from '../../../services/supabase';
import type { AdminUser, UpdateUserProfileInput, Major, AcademicLevel } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
  onSave: () => void;
}

interface StudentExtra {
  major_id: number | null;
  level_id: number | null;
  student_code?: string;
}

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--text-main)',
} as const;

const disabledStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  color: 'var(--text-muted)',
} as const;

export default function EditUserModal({ isOpen, onClose, user, onSave }: Props) {
  const { t } = useTranslation('users');
  const [form, setForm] = useState<UpdateUserProfileInput>({
    full_name: user.full_name,
    mobile: user.mobile ?? '',
    date_of_birth: user.date_of_birth ?? '',
    department: user.department ?? '',
    specialization: user.specialization ?? '',
    headline: user.headline ?? '',
    bio: user.bio ?? '',
    academic_degree: user.academic_degree ?? '',
    years_of_experience: user.years_of_experience ?? 0,
  });
  const [studentExtra, setStudentExtra] = useState<StudentExtra>({ major_id: null, level_id: null, student_code: '' });
  const [majors, setMajors] = useState<Major[]>([]);
  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const supabase = getSupabaseClient();

    if (user.role === 'student') {
      Promise.all([
        adminApi.getMajors(),
        adminApi.getAcademicLevels(),
        supabase
          .from('student_profiles')
          .select('major_id, level_id, student_code')
          .eq('id', user.id)
          .maybeSingle(),
      ]).then(([maj, lvl, { data: sp }]) => {
        setMajors(maj as Major[]);
        setLevels(lvl as AcademicLevel[]);
        setStudentExtra({
          major_id: sp?.major_id ?? null,
          level_id: sp?.level_id ?? null,
          student_code: sp?.student_code ?? '',
        });
      });
    } else if (user.role === 'teacher') {
      supabase
        .from('teacher_profiles')
        .select('department, specialization, headline, bio, academic_degree, years_experience')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data: tp }) => {
          setForm(prev => ({
            ...prev,
            department: tp?.department ?? '',
            specialization: tp?.specialization ?? '',
            headline: tp?.headline ?? '',
            bio: tp?.bio ?? '',
            academic_degree: tp?.academic_degree ?? '',
            years_of_experience: tp?.years_experience ?? 0,
          }));
        });
    }
  }, [isOpen, user.id, user.role]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'major_id' || name === 'level_id') {
      setStudentExtra(prev => ({ ...prev, [name]: value ? Number(value) : null }));
    } else if (name === 'student_code') {
      setStudentExtra(prev => ({ ...prev, student_code: value }));
    } else if (name === 'years_of_experience') {
      setForm(prev => ({ ...prev, years_of_experience: value ? Number(value) : null }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name?.trim()) {
      setError(t('modal.fullNameRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminApi.updateUserProfile(user.id, {
        full_name: form.full_name.trim(),
        mobile: form.mobile || null,
        date_of_birth: form.date_of_birth || null,
      });

      if (user.role === 'student') {
        await adminApi.updateStudentProfile(user.id, {
          major_id: studentExtra.major_id,
          level_id: studentExtra.level_id,
          student_code: studentExtra.student_code || null,
        });
      } else if (user.role === 'teacher') {
        await adminApi.updateTeacherProfile(user.id, {
          department: form.department || null,
          specialization: form.specialization || null,
          headline: form.headline || null,
          bio: form.bio || null,
          academic_degree: form.academic_degree || null,
          years_experience: form.years_of_experience || null,
        });
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('modal.failedSave'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.65)', zIndex: 400 }}>
        <div className="glass-card w-full max-w-md shadow-2xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

          {/* Header */}
          <div
            className="flex items-center justify-between p-6"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>{t('modal.editTitle')}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: 'rgba(251,113,133,0.12)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.25)' }}
              >
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {t('modal.fullName')} <span style={{ color: '#fb7185' }}>{t('modal.required')}</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={form.full_name ?? ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                placeholder={t('modal.fullNamePlaceholder')}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {t('modal.email')}
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2.5 rounded-xl text-sm cursor-not-allowed"
                style={disabledStyle}
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {t('modal.mobile', 'Mobile Number')}
              </label>
              <input
                type="text"
                name="mobile"
                value={form.mobile ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                dir="ltr"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {t('modal.dateOfBirth', 'Date of Birth')}
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {/* Teacher fields */}
            {user.role === 'teacher' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {t('modal.headline', 'Headline')}
                  </label>
                  <input
                    type="text"
                    name="headline"
                    value={form.headline ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    placeholder="e.g. Senior Lecturer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {t('modal.bio', 'Bio')}
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    placeholder="Short biography"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {t('modal.academicDegree', 'Academic Degree')}
                  </label>
                  <input
                    type="text"
                    name="academic_degree"
                    value={form.academic_degree ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    placeholder="e.g. Ph.D. in Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {t('modal.yearsOfExperience', 'Years of Experience')}
                  </label>
                  <input
                    type="number"
                    name="years_of_experience"
                    value={form.years_of_experience ?? ''}
                    onChange={handleChange}
                    min={0}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {t('modal.department')}
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={form.department ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    placeholder={t('modal.departmentPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {t('modal.specialization')}
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={form.specialization ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    placeholder={t('modal.specializationPlaceholder')}
                  />
                </div>
              </>
            )}

            {/* Student fields: Major & Level */}
            {user.role === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {t('modal.studentCode', 'Student Code/ID')}
                  </label>
                  <input
                    type="text"
                    name="student_code"
                    value={studentExtra.student_code ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    placeholder="e.g. STU-12345"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {t('modal.major')}
                  </label>
                  <select
                    name="major_id"
                    value={studentExtra.major_id ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="" style={{ background: '#1e293b', color: 'white' }}>{t('modal.selectMajor')}</option>
                    {majors.map(m => (
                      <option key={m.id} value={m.id} style={{ background: '#1e293b', color: 'white' }}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {t('modal.academicLevel')}
                  </label>
                  <select
                    name="level_id"
                    value={studentExtra.level_id ?? ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="" style={{ background: '#1e293b', color: 'white' }}>{t('modal.selectLevel')}</option>
                    {levels.map(l => (
                      <option key={l.id} value={l.id} style={{ background: '#1e293b', color: 'white' }}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
                style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {t('modal.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff' }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? t('modal.saving') : t('modal.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
