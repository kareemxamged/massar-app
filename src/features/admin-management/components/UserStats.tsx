import { useState, useEffect } from 'react';
import { X, BarChart3, GraduationCap, BookOpen, Users, Award, Calendar, Loader2 } from 'lucide-react';
import Portal from '../../../components/Portal';
import { supabase } from '../../../services/supabase';
import type { UserProfile } from '../../../types';

interface Props {
  user: UserProfile;
  onClose: () => void;
}

interface StudentStats {
  totalExamsTaken: number;
  averageScore: number | null;
  enrollmentDate: string | null;
  coursesEnrolled: number;
}

interface TeacherStats {
  totalCoursesCreated: number;
  totalStudentsTaught: number;
  totalExamsCreated: number;
  averageParticipationRate: number;
}

export default function UserStats({ user, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StudentStats | TeacherStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);

      try {
        if (user.role === 'student') {
          // Fetch student submissions
          const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select('score, submitted_at')
            .eq('student_id', user.id)
            .eq('status', 'completed');

          if (subError) throw subError;

          // Fetch first enrollment date
          const { data: enrollments, error: enrollError } = await supabase
            .from('enrollments')
            .select('enrolled_at')
            .eq('student_id', user.id)
            .order('enrolled_at', { ascending: true })
            .limit(1);

          if (enrollError) throw enrollError;

          // Count courses enrolled
          const { count: coursesCount, error: coursesError } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', user.id);

          if (coursesError) throw coursesError;

          // Calculate average score
          const scores = submissions?.map(s => s.score).filter((s): s is number => s !== null) || [];
          const avgScore = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : null;

          setStats({
            totalExamsTaken: submissions?.length || 0,
            averageScore: avgScore,
            enrollmentDate: enrollments?.[0]?.enrolled_at || user.created_at,
            coursesEnrolled: coursesCount || 0,
          } as StudentStats);
        } else {
          // Fetch teacher courses
          const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select('id')
            .eq('teacher_id', user.id);

          if (coursesError) throw coursesError;

          const courseIds = courses?.map(c => c.id) || [];

          // Count unique students across all teacher's courses
          let uniqueStudents = 0;
          if (courseIds.length > 0) {
            const { data: enrollments, error: enrollError } = await supabase
              .from('enrollments')
              .select('student_id')
              .in('course_id', courseIds);

            if (enrollError) throw enrollError;
            uniqueStudents = new Set(enrollments?.map(e => e.student_id)).size;
          }

          // Count exams created by this teacher (via courses they own)
          let examsCount = 0;
          if (courseIds.length > 0) {
            const { count, error: examsError } = await supabase
              .from('exams')
              .select('*', { count: 'exact', head: true })
              .in('course_id', courseIds);

            if (examsError) throw examsError;
            examsCount = count || 0;
          }

          // Participation rate calculation would need more complex query
          // For now, set to 0 (placeholder)
          setStats({
            totalCoursesCreated: courses?.length || 0,
            totalStudentsTaught: uniqueStudents,
            totalExamsCreated: examsCount,
            averageParticipationRate: 0,
          } as TeacherStats);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user.id, user.role, user.created_at]);

  return (
    <Portal>
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 400, background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 btn-icon" style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(56,189,248,0.15)' }}>
            <BarChart3 size={24} style={{ color: '#38bdf8' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
              User Statistics
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {user.full_name} • {user.role}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading statistics...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg" style={{ background: 'rgba(251,113,133,0.1)', color: '#fb7185' }}>
            {error}
          </div>
        ) : user.role === 'student' ? (
          <StudentStatsView stats={stats as StudentStats} />
        ) : (
          <TeacherStatsView stats={stats as TeacherStats} />
        )}
      </div>
    </div>
    </Portal>
  );
}

function StudentStatsView({ stats }: { stats: StudentStats }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard 
        icon={<GraduationCap size={20} style={{ color: '#38bdf8' }} />}
        label="Exams Taken"
        value={stats.totalExamsTaken.toString()}
      />
      <StatCard 
        icon={<Award size={20} style={{ color: '#34d399' }} />}
        label="Average Score"
        value={stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
      />
      <StatCard 
        icon={<BookOpen size={20} style={{ color: '#a78bfa' }} />}
        label="Courses Enrolled"
        value={stats.coursesEnrolled.toString()}
      />
      <StatCard 
        icon={<Calendar size={20} style={{ color: '#fb923c' }} />}
        label="Member Since"
        value={stats.enrollmentDate ? new Date(stats.enrollmentDate).toLocaleDateString() : 'N/A'}
      />
    </div>
  );
}

function TeacherStatsView({ stats }: { stats: TeacherStats }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard 
        icon={<BookOpen size={20} style={{ color: '#38bdf8' }} />}
        label="Courses Created"
        value={stats.totalCoursesCreated.toString()}
      />
      <StatCard 
        icon={<Users size={20} style={{ color: '#34d399' }} />}
        label="Students Taught"
        value={stats.totalStudentsTaught.toString()}
      />
      <StatCard 
        icon={<GraduationCap size={20} style={{ color: '#a78bfa' }} />}
        label="Exams Created"
        value={stats.totalExamsCreated.toString()}
      />
      <StatCard 
        icon={<BarChart3 size={20} style={{ color: '#fb923c' }} />}
        label="Participation Rate"
        value={`${stats.averageParticipationRate.toFixed(0)}%`}
      />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
          {label}
        </p>
        <p style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 'bold' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
