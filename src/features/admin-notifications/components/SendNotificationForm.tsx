import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Send, Users, GraduationCap, Globe, RefreshCw,
    Search, Info, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { adminNotificationService, AdminNotificationAudience } from '../../../features/notifications/api/adminNotificationService';
import type { NotificationTargetType } from '../../../features/notifications/types';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
type Scope = 'individual' | 'group';
type NotiType = 'info' | 'warning' | 'success';

interface FormState {
    audience: AdminNotificationAudience;
    scope: Scope;
    // individual
    selectedUserId: string;
    searchQuery: string;
    // group – students
    level: string;
    major: string;
    // group – teachers
    department: string;
    // content
    title: string;
    message: string;
    notificationType: NotiType;
}

interface Props {
    onSent?: () => void;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '1.5rem',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: 6,
};

const inputBase =
    'w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ' +
    'border border-white/10 bg-white/5 text-[var(--text-main)] ' +
    'placeholder:text-[var(--text-muted)] focus:border-[#38bdf8]/60 focus:bg-white/8 focus:ring-2 focus:ring-[#38bdf8]/20';

const toggleBase =
    'flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ' +
    'border border-white/10 hover:border-[#38bdf8]/40';

const toggleActive =
    'bg-[#38bdf8]/15 border-[#38bdf8]/50 text-[#38bdf8]';

const toggleIdle = 'text-[var(--text-muted)]';

// ─── Component ────────────────────────────────────────────────────────────────
export default function SendNotificationForm({ onSent }: Props) {
    const { i18n } = useTranslation();
    const isRtl = i18n.language.startsWith('ar');

    const [form, setForm] = useState<FormState>({
        audience: 'students',
        scope: 'group',
        selectedUserId: '',
        searchQuery: '',
        level: '',
        major: '',
        department: '',
        title: '',
        message: '',
        notificationType: 'info',
    });

    const [levels, setLevels] = useState<string[]>([]);
    const [majors, setMajors] = useState<string[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<
        { id: string; full_name: string | null; code: string | null }[]
    >([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load static options once
    useEffect(() => {
        Promise.all([
            adminNotificationService.getAvailableLevels(),
            adminNotificationService.getAvailableMajors(),
            adminNotificationService.getAvailableDepartments(),
        ]).then(([l, m, d]) => {
            setLevels(l);
            setMajors(m);
            setDepartments(d);
        });
    }, []);

    // Debounced search
    useEffect(() => {
        if (form.scope !== 'individual' || form.audience === 'all') return;
        if (form.searchQuery.length < 2) { setSearchResults([]); return; }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            const results = await adminNotificationService.searchUsers(
                form.searchQuery,
                form.audience as 'students' | 'teachers'
            );
            setSearchResults(results);
        }, 300);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [form.searchQuery, form.scope, form.audience]);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const validate = (): boolean => {
        const errs: typeof errors = {};
        if (!form.title.trim()) errs.title = isRtl ? 'العنوان مطلوب' : 'Title is required';
        if (!form.message.trim()) errs.message = isRtl ? 'الرسالة مطلوبة' : 'Message is required';
        if (form.scope === 'individual' && !form.selectedUserId)
            errs.searchQuery = isRtl ? 'يرجى اختيار مستخدم من نتائج البحث' : 'Please select a user from search results';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            // Build target_type
            let targetType: NotificationTargetType = 'global';
            if (form.scope === 'individual') targetType = 'individual';
            else if (form.audience === 'students' && form.level) targetType = 'level';
            else if (form.audience === 'students' && form.major) targetType = 'major';
            else if (form.audience === 'teachers' && form.department) targetType = 'major'; // reuse major field for dept
            else targetType = 'global';

            await adminNotificationService.sendAdminNotification({
                audience: form.audience,
                target_type: targetType,
                target_id: form.scope === 'individual' ? form.selectedUserId : undefined,
                level: form.audience === 'students' && form.scope === 'group' ? form.level || undefined : undefined,
                major: form.audience === 'students' && form.scope === 'group' ? form.major || undefined : undefined,
                department: form.audience === 'teachers' && form.scope === 'group' ? form.department || undefined : undefined,
                title: form.title.trim(),
                message: form.message.trim(),
                notificationType: form.notificationType,
            });

            toast.success(isRtl ? 'تم إرسال الإشعار بنجاح!' : 'Notification sent successfully!');
            setForm({
                audience: 'students',
                scope: 'group',
                selectedUserId: '',
                searchQuery: '',
                level: '',
                major: '',
                department: '',
                title: '',
                message: '',
                notificationType: 'info',
            });
            setSearchResults([]);
            onSent?.();
        } catch (err: any) {
            toast.error(err?.message ?? (isRtl ? 'فشل في إرسال الإشعار' : 'Failed to send notification'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Labels ─────────────────────────────────────────────────────────────────
    const T = {
        heading: isRtl ? 'إرسال إشعار جديد' : 'Send New Notification',
        targetAudience: isRtl ? 'الفئة المستهدفة' : 'Target Audience',
        students: isRtl ? 'الطلاب' : 'Students',
        teachers: isRtl ? 'المعلمين' : 'Teachers',
        allUsers: isRtl ? 'الجميع' : 'All Users',
        scope: isRtl ? 'نطاق الإرسال' : 'Send Scope',
        individual: isRtl ? 'فردي (بحث بالاسم/ID)' : 'Individual (Search by Name/ID)',
        group: isRtl ? 'مجموعة (تصفية)' : 'Group (Filter)',
        searchPlaceholder: isRtl ? 'ابحث بالاسم أو رقم المعرف...' : 'Search by name or ID...',
        selectLevel: isRtl ? 'المستوى الأكاديمي' : 'Academic Level',
        selectLevelPlaceholder: isRtl ? 'كل المستويات' : 'All Levels',
        selectMajor: isRtl ? 'التخصص' : 'Specialty',
        selectMajorPlaceholder: isRtl ? 'كل التخصصات' : 'All Specialties',
        selectDept: isRtl ? 'القسم' : 'Department',
        selectDeptPlaceholder: isRtl ? 'كل الأقسام' : 'All Departments',
        notiType: isRtl ? 'نوع الإشعار' : 'Notification Type',
        infoType: isRtl ? 'معلوماتي' : 'Info',
        warningType: isRtl ? 'تحذير' : 'Warning',
        successType: isRtl ? 'نجاح' : 'Success',
        titleLabel: isRtl ? 'عنوان الإشعار' : 'Notification Title',
        titlePlaceholder: isRtl ? 'أدخل عنوان الإشعار...' : 'Enter notification title...',
        messageLabel: isRtl ? 'نص الإشعار' : 'Notification Message',
        messagePlaceholder: isRtl ? 'اكتب رسالتك هنا...' : 'Write your message here...',
        sendBtn: isRtl ? 'إرسال الإشعار' : 'Send Notification',
        sending: isRtl ? 'جاري الإرسال...' : 'Sending...',
    };

    // Type badge colours
    const typeColors: Record<NotiType, string> = {
        info: '#38bdf8',
        warning: '#fb923c',
        success: '#34d399',
    };

    const notiTypeOptions: { value: NotiType; label: string; icon: React.ReactNode }[] = [
        { value: 'info', label: T.infoType, icon: <Info size={15} /> },
        { value: 'warning', label: T.warningType, icon: <AlertTriangle size={15} /> },
        { value: 'success', label: T.successType, icon: <CheckCircle2 size={15} /> },
    ];

    return (
        <div style={card} dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'font-tajawal' : ''}>
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="p-2.5 rounded-xl shrink-0"
                    style={{ background: 'rgba(56,189,248,0.15)' }}
                >
                    <Send size={20} style={{ color: '#38bdf8' }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                    {T.heading}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* ROW 1: Audience + Scope */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Audience */}
                    <div>
                        <label style={labelStyle}>{T.targetAudience}</label>
                        <div className="flex gap-2">
                            {(
                                [
                                    { val: 'students', label: T.students, icon: <GraduationCap size={15} /> },
                                    { val: 'teachers', label: T.teachers, icon: <Users size={15} /> },
                                    { val: 'all', label: T.allUsers, icon: <Globe size={15} /> },
                                ] as { val: AdminNotificationAudience; label: string; icon: React.ReactNode }[]
                            ).map(({ val, label, icon }) => (
                                <button
                                    key={val}
                                    type="button"
                                    className={`${toggleBase} ${form.audience === val ? toggleActive : toggleIdle}`}
                                    onClick={() => {
                                        set('audience', val);
                                        set('selectedUserId', '');
                                        set('searchQuery', '');
                                        setSearchResults([]);
                                    }}
                                >
                                    {icon}
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scope */}
                    <div>
                        <label style={labelStyle}>{T.scope}</label>
                        <div className="flex gap-2">
                            {(
                                [
                                    { val: 'group', label: T.group },
                                    { val: 'individual', label: T.individual },
                                ] as { val: Scope; label: string }[]
                            ).map(({ val, label }) => (
                                <button
                                    key={val}
                                    type="button"
                                    className={`${toggleBase} ${form.scope === val ? toggleActive : toggleIdle}`}
                                    onClick={() => {
                                        set('scope', val);
                                        set('selectedUserId', '');
                                        set('searchQuery', '');
                                        setSearchResults([]);
                                    }}
                                    disabled={form.audience === 'all' && val === 'individual'}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Dynamic Filters ─────────────────────────────────────────────── */}

                {/* INDIVIDUAL SEARCH */}
                {form.scope === 'individual' && form.audience !== 'all' && (
                    <div className="relative">
                        <label style={labelStyle}>
                            {form.audience === 'students'
                                ? (isRtl ? 'اختر الطالب' : 'Select Student')
                                : (isRtl ? 'اختر المعلم' : 'Select Teacher')}
                        </label>
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute top-1/2 -translate-y-1/2 start-3"
                                style={{ color: 'var(--text-muted)', pointerEvents: 'none' }}
                            />
                            <input
                                type="text"
                                className={`${inputBase} ps-10`}
                                placeholder={T.searchPlaceholder}
                                value={form.searchQuery}
                                onChange={(e) => {
                                    set('searchQuery', e.target.value);
                                    if (!e.target.value) { set('selectedUserId', ''); }
                                }}
                                dir="auto"
                            />
                        </div>
                        {errors.searchQuery && (
                            <p className="text-xs mt-1 text-red-400">{errors.searchQuery}</p>
                        )}
                        {/* Results dropdown */}
                        {searchResults.length > 0 && (
                            <div
                                className="absolute z-30 w-full mt-1 rounded-xl overflow-hidden shadow-xl"
                                style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                {searchResults.map((r) => (
                                    <div
                                        key={r.id}
                                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={() => {
                                            set('selectedUserId', r.id);
                                            set('searchQuery', r.full_name ?? '');
                                            setSearchResults([]);
                                        }}
                                    >
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                                            {r.full_name}
                                        </span>
                                        {r.code && (
                                            <span
                                                className="text-xs px-2 py-0.5 rounded-lg"
                                                style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}
                                            >
                                                {r.code}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* GROUP FILTERS – Students */}
                {form.scope === 'group' && (form.audience === 'students' || form.audience === 'all') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label style={labelStyle}>{T.selectLevel}</label>
                            <select
                                className={inputBase}
                                value={form.level}
                                onChange={(e) => set('level', e.target.value)}
                            >
                                <option value="">{T.selectLevelPlaceholder}</option>
                                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>{T.selectMajor}</label>
                            <select
                                className={inputBase}
                                value={form.major}
                                onChange={(e) => set('major', e.target.value)}
                            >
                                <option value="">{T.selectMajorPlaceholder}</option>
                                {majors.map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {/* GROUP FILTERS – Teachers */}
                {form.scope === 'group' && (form.audience === 'teachers' || form.audience === 'all') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label style={labelStyle}>{T.selectDept}</label>
                            <select
                                className={inputBase}
                                value={form.department}
                                onChange={(e) => set('department', e.target.value)}
                            >
                                <option value="">{T.selectDeptPlaceholder}</option>
                                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {/* ── Notification Type ───────────────────────────────────────────── */}
                <div>
                    <label style={labelStyle}>{T.notiType}</label>
                    <div className="flex gap-2">
                        {notiTypeOptions.map(({ value, label, icon }) => (
                            <button
                                key={value}
                                type="button"
                                className={`${toggleBase}`}
                                style={
                                    form.notificationType === value
                                        ? {
                                            background: `${typeColors[value]}1A`,
                                            borderColor: `${typeColors[value]}70`,
                                            color: typeColors[value],
                                        }
                                        : { color: 'var(--text-muted)' }
                                }
                                onClick={() => set('notificationType', value)}
                            >
                                {icon}
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Content Fields ──────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                        <label style={labelStyle}>{T.titleLabel}</label>
                        <input
                            type="text"
                            className={inputBase}
                            placeholder={T.titlePlaceholder}
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            dir="auto"
                        />
                        {errors.title && <p className="text-xs mt-1 text-red-400">{errors.title}</p>}
                    </div>

                    {/* Message – spans full width on md */}
                    <div className="md:col-span-2">
                        <label style={labelStyle}>{T.messageLabel}</label>
                        <textarea
                            rows={4}
                            className={inputBase}
                            placeholder={T.messagePlaceholder}
                            value={form.message}
                            onChange={(e) => set('message', e.target.value)}
                            dir="auto"
                            style={{ resize: 'vertical' }}
                        />
                        {errors.message && <p className="text-xs mt-1 text-red-400">{errors.message}</p>}
                    </div>
                </div>

                {/* ── Submit ──────────────────────────────────────────────────────── */}
                <div className="flex justify-end pt-1">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                        style={{
                            background: isSubmitting
                                ? 'rgba(56,189,248,0.4)'
                                : 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
                            color: '#fff',
                            boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(56,189,248,0.35)',
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <RefreshCw size={16} className="animate-spin" />
                                {T.sending}
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                {T.sendBtn}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
