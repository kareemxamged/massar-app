import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, UserPlus, Loader2 } from "lucide-react";
import { adminApi } from "../api/adminApi";
import type { Major, AcademicLevel, CreateUserInput } from "../types";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: "student" | "teacher";
  onSuccess?: () => void;
}

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--text-main)',
} as const;

export default function AddUserModal({
  isOpen,
  onClose,
  initialRole = "student",
  onSuccess,
}: AddUserModalProps) {
  const { t } = useTranslation('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: initialRole,
    mobile: "",
    date_of_birth: "",
    major: "",
    level: "",
    student_code: "",
    department: "",
    specialization: "",
    headline: "",
    bio: "",
    academic_degree: "",
    years_of_experience: "",
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        adminApi.getMajors().then(setMajors).catch(console.error),
        adminApi.getAcademicLevels().then(setAcademicLevels).catch(console.error),
      ]);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        role: initialRole,
        mobile: "",
        date_of_birth: "",
        major: "",
        level: "",
        student_code: "",
        department: "",
        specialization: "",
        headline: "",
        bio: "",
        academic_degree: "",
        years_of_experience: "",
      });
      setError(null);
    }
  }, [isOpen, initialRole]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userData: CreateUserInput = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        mobile: formData.mobile || null,
        date_of_birth: formData.date_of_birth || null,
        major: formData.role === "student" ? (formData.major || null) : null,
        level: formData.role === "student" ? (formData.level || null) : null,
        student_code: formData.role === "student" ? (formData.student_code || null) : null,
        department: formData.role === "teacher" ? (formData.department || null) : null,
        specialization: formData.role === "teacher" ? (formData.specialization || null) : null,
        headline: formData.role === "teacher" ? (formData.headline || null) : null,
        bio: formData.role === "teacher" ? (formData.bio || null) : null,
        academic_degree: formData.role === "teacher" ? (formData.academic_degree || null) : null,
        years_of_experience: formData.role === "teacher" && formData.years_of_experience ? Number(formData.years_of_experience) : null,
      };
      await adminApi.createUser(userData);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('modal.failedSave'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", zIndex: 400 }}>
      <div className="glass-card w-full max-w-md shadow-2xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <UserPlus size={22} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                {formData.role === "student" ? t('modal.addStudentTitle') : t('modal.addTeacherTitle')}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {t('modal.createAccount')}
              </p>
            </div>
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

          {/* Email */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('modal.email')} <span style={{ color: '#fb7185' }}>{t('modal.required')}</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
              placeholder="user@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('modal.password')} <span style={{ color: '#fb7185' }}>{t('modal.required')}</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
              placeholder={t('modal.passwordPlaceholder')}
            />
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('modal.passwordHint')}
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('modal.fullName')} <span style={{ color: '#fb7185' }}>{t('modal.required')}</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
              placeholder={t('modal.enterFullName')}
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
              value={formData.mobile}
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
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Role hidden */}
          <input type="hidden" name="role" value={formData.role} />

          {/* Student Fields */}
          {formData.role === "student" && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t('modal.studentCode', 'Student Code/ID')}
                </label>
                <input
                  type="text"
                  name="student_code"
                  value={formData.student_code}
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
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="" style={{ background: '#1e293b', color: 'white' }}>{t('modal.selectMajor')}</option>
                  {majors.map((m) => (
                    <option key={m.id} value={m.name} style={{ background: '#1e293b', color: 'white' }}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t('modal.academicLevel')}
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="" style={{ background: '#1e293b', color: 'white' }}>{t('modal.selectLevel')}</option>
                  {academicLevels.map((l) => (
                    <option key={l.id} value={l.name} style={{ background: '#1e293b', color: 'white' }}>{l.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Teacher Fields */}
          {formData.role === "teacher" && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t('modal.headline', 'Headline')}
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
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
                  value={formData.bio}
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
                  value={formData.academic_degree}
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
                  value={formData.years_of_experience}
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
                  value={formData.department}
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
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  placeholder={t('modal.specializationPlaceholder')}
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {t('modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff' }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t('modal.creating')}
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  {formData.role === "student" ? t('modal.createStudent') : t('modal.createTeacher')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
