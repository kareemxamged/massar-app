import { useState, useEffect } from 'react';
import { Search, X, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../services/supabase';
import styles from '../ExamCreator.module.css';

interface Student {
    id: string;
    full_name: string;
    student_code: string | null;
    level: string | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    levelFilter: string | null | undefined;
    selectedStudentIds: string[];
    onApplySelection: (ids: string[]) => void;
}

export function StudentPickerModal({ isOpen, onClose, levelFilter, selectedStudentIds, onApplySelection }: Props) {
    const { i18n } = useTranslation('exams');
    const isRtl = i18n.language.startsWith('ar');

    const labels = {
        en: {
            title: 'Select Specific Students',
            onlyLevel: 'Only showing students in level: ',
            allStudents: 'Showing all registered students',
            searchPlaceholder: 'Search by name or Academic ID...',
            loading: 'Loading...',
            loadError: 'Failed to load students. Please try again.',
            retry: 'Retry',
            noStudents: 'No students found matching your search.',
            unknownUser: 'Unknown User',
            noLevel: 'No Level',
            selected: 'selected',
            cancel: 'Cancel',
            apply: 'Apply Selection'
        },
        ar: {
            title: 'اختيار طلاب محددين',
            onlyLevel: 'إظهار طلاب المستوى: ',
            allStudents: 'عرض جميع الطلاب المسجلين',
            searchPlaceholder: 'ابحث بالاسم أو الكود الأكاديمي...',
            loading: 'جاري التحميل...',
            loadError: 'فشل تحميل قائمة الطلاب. يرجى المحاولة.',
            retry: 'إعادة المحاولة',
            noStudents: 'لم يتم العثور على طلاب يطابقون بحثك.',
            unknownUser: 'مستخدم غير معروف',
            noLevel: 'لا يوجد مستوى',
            selected: 'محدد',
            cancel: 'إلغاء',
            apply: 'تأكيد الاختيار'
        }
    };
    const txt = isRtl ? labels.ar : labels.en;

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelected, setTempSelected] = useState<Set<string>>(new Set(selectedStudentIds));

    useEffect(() => {
        if (isOpen) {
            setTempSelected(new Set(selectedStudentIds));
            setError(null);
            fetchStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && levelFilter !== undefined) {
            setError(null);
            fetchStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [levelFilter]);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select(`
                    id, full_name,
                    student_profiles ( student_code, academic_levels ( name ) )
                `)
                .eq('role', 'student')
                .order('full_name', { ascending: true })
                .limit(200);

            if (fetchError) throw fetchError;
            const mapped = (data || []).map((p: any) => {
                const sp = Array.isArray(p.student_profiles) ? p.student_profiles[0] : p.student_profiles;
                return {
                    id: p.id,
                    full_name: p.full_name || 'Unknown User',
                    student_code: sp?.student_code ?? null,
                    level: sp?.academic_levels?.name ?? null,
                };
            });
            const filtered = levelFilter && levelFilter.length > 0
                ? mapped.filter(s => s.level === levelFilter)
                : mapped;
            setStudents(filtered);
        } catch (err: any) {
            console.error('Failed to fetch students', err);
            setError(err.message || 'Failed to load students. Please try again.');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id: string) => {
        const next = new Set(tempSelected);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setTempSelected(next);
    };

    const handleApply = () => {
        onApplySelection(Array.from(tempSelected));
        onClose();
    };

    const filteredStudents = students.filter(s => {
        if (!searchTerm.trim()) return true;
        const sterm = searchTerm.toLowerCase();
        return (s.full_name?.toLowerCase().includes(sterm) || s.student_code?.toLowerCase().includes(sterm));
    });

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem' }} dir={isRtl ? 'rtl' : 'ltr'}>
            <div style={{ background: '#1e293b', width: '100%', maxWidth: '500px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>

                {/* Header */}
                <div style={{ padding: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>{txt.title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Subheader / Search */}
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                    {levelFilter && levelFilter !== 'all' ? (
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#818cf8', fontWeight: 500 }}>
                            {txt.onlyLevel} {levelFilter}
                        </p>
                    ) : (
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {txt.allStudents}
                        </p>
                    )}

                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder={txt.searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem',
                                paddingInlineStart: '2.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none',
                                textAlign: 'start'
                            }}
                        />
                    </div>
                </div>

                {/* List */}
                <div style={{ padding: '0', flex: 1, overflowY: 'auto', minHeight: '300px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                            <Loader2 size={24} className={styles.spin} />
                        </div>
                    ) : error ? (
                        <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                            <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
                            <button
                                onClick={fetchStudents}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.6rem 1rem', background: 'rgba(99,102,241,0.1)',
                                    border: '1px solid var(--primary)', color: 'var(--primary)',
                                    borderRadius: '8px', cursor: 'pointer', fontWeight: 500
                                }}
                            >
                                <RefreshCw size={14} /> {txt.retry}
                            </button>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            {txt.noStudents}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => handleToggle(student.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        cursor: 'pointer', transition: 'background 0.2s',
                                        background: tempSelected.has(student.id) ? 'rgba(129, 140, 248, 0.1)' : 'transparent'
                                    }}
                                >
                                    <div>
                                        <div style={{ color: 'white', fontWeight: 500, textAlign: 'start' }}>{student.full_name || txt.unknownUser}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px', textAlign: 'start', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span dir="ltr">{student.student_code || 'N/A'}</span> • {student.level || txt.noLevel}
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '22px', height: '22px', borderRadius: '6px',
                                        border: tempSelected.has(student.id) ? 'none' : '2px solid rgba(255,255,255,0.2)',
                                        background: tempSelected.has(student.id) ? '#818cf8' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {tempSelected.has(student.id) && <Check size={14} color="white" strokeWidth={3} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <span style={{ color: '#818cf8', fontSize: '0.9rem', fontWeight: 500 }}>
                        {tempSelected.size} {txt.selected}
                    </span>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button onClick={onClose} style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                            {txt.cancel}
                        </button>
                        <button onClick={handleApply} style={{ padding: '0.6rem 1.2rem', background: '#818cf8', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            {txt.apply}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default StudentPickerModal;
