import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Search, Mail, GraduationCap, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../../../services/supabase';
import styles from './TeacherStudents.module.css';

interface Student {
    id: string;
    full_name: string | null;
    email: string;
    student_code: string | null;
    avatar_url: string | null;
    level: string | null;
}
export default function TeacherStudents() {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const isRtl = i18n.language.startsWith('ar');

    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        const filtered = students.filter(student =>
            (student.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (student.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (student.student_code?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        );
        setFilteredStudents(filtered);
    }, [searchQuery, students]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id, full_name, email, avatar_url,
                    student_profiles ( student_code, academic_levels ( name ) )
                `)
                .eq('role', 'student')
                .order('full_name', { ascending: true });

            if (error) throw error;
            const mapped = (data || []).map((p: any) => {
                const sp = Array.isArray(p.student_profiles) ? p.student_profiles[0] : p.student_profiles;
                return {
                    id: p.id,
                    full_name: p.full_name,
                    email: p.email,
                    student_code: sp?.student_code ?? null,
                    avatar_url: p.avatar_url,
                    level: sp?.academic_levels?.name ?? null,
                };
            });
            setStudents(mapped);
            setFilteredStudents(mapped);
        } catch (err) {
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string | null) => {
        if (!name) return 'ST';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleViewProfile = (studentId: string) => {
        navigate(`/teacher/students/${studentId}`);
    };

    return (
        <div className={styles.container} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{isRtl ? 'الطلاب' : 'Students'}</h1>
                    <p className={styles.subtitle}>{isRtl ? 'عرض وإدارة ملفات الطلاب وأدائهم.' : "View and manage your students' profiles and performance."}</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className={styles.searchBar}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={isRtl ? 'البحث بالاسم، البريد الإلكتروني، أو رقم الطالب...' : 'Search by name, email, or student ID...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <span className={styles.studentCount}>
                    {filteredStudents.length} {isRtl ? (filteredStudents.length === 1 ? 'طالب' : 'طلاب') : ('student' + (filteredStudents.length !== 1 ? 's' : ''))}
                </span>
            </div>

            {/* Students Grid */}
            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>{isRtl ? 'جاري تحميل الطلاب...' : 'Loading students...'}</p>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className={styles.emptyState}>
                    <Users size={48} color="#64748b" />
                    <h3>{isRtl ? 'لا يوجد طلاب مضافون' : 'No students found'}</h3>
                    <p>{searchQuery ? (isRtl ? 'حاول تعديل كلمة البحث.' : 'Try adjusting your search query.') : (isRtl ? 'لا يوجد طلاب مسجلون في النظام.' : 'No students registered in the system.')}</p>
                </div>
            ) : (
                <div className={styles.studentsGrid}>
                    {filteredStudents.map((student) => (
                        <div
                            key={student.id}
                            className={styles.studentCard}
                            onClick={() => handleViewProfile(student.id)}
                        >
                            <div className={styles.cardHeader}>
                                {student.avatar_url ? (
                                    <img
                                        src={student.avatar_url}
                                        alt={student.full_name || 'Student'}
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {getInitials(student.full_name)}
                                    </div>
                                )}
                                <div className={styles.cardActions}>
                                    {isRtl ? <ChevronLeft size={20} color="#64748b" /> : <ChevronRight size={20} color="#64748b" />}
                                </div>
                            </div>

                            <div className={styles.cardInfo}>
                                <h3 className={styles.studentName}>
                                    {student.full_name || (isRtl ? 'طالب غير معروف' : 'Unknown Student')}
                                </h3>
                                <div className={styles.metaList}>
                                    <span className={styles.metaItem}>
                                        <Mail size={14} />
                                        <span dir="ltr">{student.email}</span>
                                    </span>
                                    <span className={styles.metaItem}>
                                        <GraduationCap size={14} />
                                        {isRtl ? 'رقم التعريف:' : 'ID:'} {student.student_code || (isRtl ? 'غير متاح' : 'N/A')} • {isRtl ? 'المستوى:' : 'Level:'} {student.level || (isRtl ? 'غير متاح' : 'N/A')}
                                    </span>
                                </div>
                            </div>

                            <button className={styles.viewProfileBtn}>
                                {isRtl ? 'عرض الملف الشخصي' : 'View Profile'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
