import { useState, useEffect } from 'react';
import { BookOpen, BarChart2, Clock, CheckCircle, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../../../services/supabase';
import styles from '../StudentProfile.module.css';

// ─── Radial GPA Gauge ────────────────────────────────────────────────────────
function GpaGauge({ gpa, maxGpa = 4.0 }: { gpa: number; maxGpa?: number }) {
    const CIRCUM = 2 * Math.PI * 45;
    const pct = Math.min(gpa / maxGpa, 1);
    const offset = CIRCUM * (1 - pct);
    const color = pct >= 0.75 ? '#10b981' : pct >= 0.5 ? '#f59e0b' : '#ef4444';
    const label = pct >= 0.9 ? 'A+' : pct >= 0.8 ? 'A' : pct >= 0.7 ? 'B' : pct >= 0.6 ? 'C' : pct >= 0.5 ? 'D' : 'F';

    return (
        <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0, minWidth: '100px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
                {/* Track */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
                {/* Glow base */}
                <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="9" strokeOpacity="0.07"
                    strokeDasharray={CIRCUM} strokeDashoffset="0" />
                {/* Arc */}
                <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="9"
                    strokeDasharray={CIRCUM} strokeDashoffset={offset}
                    strokeLinecap="round" transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color, lineHeight: 1 }}>
                    {gpa.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '1px' }}>/ {maxGpa.toFixed(1)} GPA</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color, marginTop: '1px' }}>{label}</span>
            </div>
        </div>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface AcademicStats {
    totalExams: number;
    avgScore: number;    // percentage 0-100
    gpa: number;         // derived: avgScore/100 * 4.0
    passRate: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AcademicTab({ userId }: { userId: string }) {
    const [stats, setStats] = useState<AcademicStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await supabase
                    .from('submissions')
                    .select('score, exams(total_marks)')
                    .eq('student_id', userId)
                    .eq('status', 'submitted');

                if (!data || data.length === 0) {
                    setStats({ totalExams: 0, avgScore: 0, gpa: 0, passRate: 0 });
                    return;
                }

                const rows = (data as unknown) as { score: number; exams: { total_marks: number } }[];
                const scored = rows.filter(r => r.exams?.total_marks > 0);
                const avgScore = scored.length > 0
                    ? scored.reduce((s, r) => s + (r.score / r.exams.total_marks) * 100, 0) / scored.length
                    : 0;
                const passed = rows.filter(r => r.exams?.total_marks > 0 && (r.score / r.exams.total_marks) >= 0.5).length;

                setStats({
                    totalExams: rows.length,
                    avgScore: Math.round(avgScore),
                    gpa: parseFloat(((avgScore / 100) * 4.0).toFixed(2)),
                    passRate: rows.length > 0 ? Math.round((passed / rows.length) * 100) : 0,
                });
            } catch { /* silent */ } finally { setLoading(false); }
        })();
    }, [userId]);

    const statCards = [
        { label: 'Total Exams Taken', value: stats ? String(stats.totalExams) : '—', icon: BookOpen, color: '#60a5fa' },
        { label: 'Average Score', value: stats ? `${stats.avgScore}%` : '—', icon: BarChart2, color: '#34d399' },
        { label: 'Pass Rate', value: stats ? `${stats.passRate}%` : '—', icon: TrendingUp, color: '#fb923c' },
        { label: 'Study Hours', value: '42h', icon: Clock, color: '#a78bfa' },
        { label: 'Attendance', value: '96%', icon: CheckCircle, color: '#f472b6' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* GPA Banner */}
            <div className={styles.card} style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)',
                border: '1px solid rgba(99,102,241,0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
                    {loading
                        ? <div style={{ width: '100px', height: '100px', minWidth: '100px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
                        : <GpaGauge gpa={stats?.gpa ?? 0} />
                    }
                    <div style={{ flex: 1 }}>
                        <h3 className={styles.cardTitle} style={{ marginBottom: '0.5rem' }}>Academic Performance</h3>
                        <p className={styles.cardSubtitle}>Computed from all submitted exam results.</p>
                        {stats && (
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {[
                                    { label: 'Exams', val: stats.totalExams },
                                    { label: 'Avg Score', val: `${stats.avgScore}%` },
                                    { label: 'Pass Rate', val: `${stats.passRate}%` },
                                ].map(item => (
                                    <div key={item.label} style={{ minWidth: '70px' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{item.val}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {statCards.map(s => (
                    <div key={s.label} className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: `${s.color}20`, color: s.color }}>
                                <s.icon size={22} />
                            </div>
                        </div>
                        <div className={styles.statValue}>{s.value}</div>
                        <div className={styles.statLabel}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Achievements */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Recent Achievements</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {(stats?.avgScore ?? 0) >= 80 && (
                        <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'rgba(234,179,8,0.06)', borderRadius: '12px', border: '1px solid rgba(234,179,8,0.15)', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', minWidth: '40px', borderRadius: '50%', background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
                                <Award size={20} />
                            </div>
                            <div>
                                <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '0.9rem' }}>High Achiever</h4>
                                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.75rem' }}>Average score above 80%</p>
                            </div>
                        </div>
                    )}
                    {(stats?.totalExams ?? 0) >= 5 && (
                        <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'rgba(59,130,246,0.06)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.15)', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', minWidth: '40px', borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '0.9rem' }}>Exam Veteran</h4>
                                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.75rem' }}>Completed 5+ exams</p>
                            </div>
                        </div>
                    )}
                    {(stats?.totalExams ?? 0) === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.75rem', gridColumn: '1 / -1' }}>
                            No achievements yet — complete your first exam to unlock badges!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
