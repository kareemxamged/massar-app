import React from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AcademicLevel, Major } from '../types';
import { Plus, Trash2, X, Save, AlertTriangle } from 'lucide-react';

interface Props {
    levels: AcademicLevel[];
    majors: Major[];
    onAddLevel: (level: Partial<AcademicLevel>) => Promise<boolean>;
    onRemoveLevel: (id: number) => Promise<boolean>;
    onAddMajor: (major: Partial<Major>) => Promise<boolean>;
    onRemoveMajor: (id: number) => Promise<boolean>;
}

type ConfirmState = { type: 'level' | 'major'; id: number; name: string } | null;

export default function AcademicConfigTab({ levels, majors, onAddLevel, onRemoveLevel, onAddMajor, onRemoveMajor }: Props) {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    // ── Confirm modal state ───────────────────────────────────────────────────
    const [confirm, setConfirm] = React.useState<ConfirmState>(null);
    const [deleting, setDeleting] = React.useState(false);

    const handleConfirmDelete = async () => {
        if (!confirm) return;
        setDeleting(true);
        if (confirm.type === 'level') await onRemoveLevel(confirm.id);
        else await onRemoveMajor(confirm.id);
        setDeleting(false);
        setConfirm(null);
    };

    // ── Level form state ──────────────────────────────────────────────────────
    const [showAddLevel, setShowAddLevel] = React.useState(false);
    const [levelForm, setLevelForm] = React.useState({ name: '', name_ar: '', code: '', display_order: '' });
    const [savingLevel, setSavingLevel] = React.useState(false);

    const handleAddLevel = async () => {
        if (!levelForm.name.trim()) return;
        setSavingLevel(true);
        const ok = await onAddLevel({
            name: levelForm.name,
            name_ar: levelForm.name_ar || null,
            code: levelForm.code || null,
            display_order: levelForm.display_order ? Number(levelForm.display_order) : null,
        });
        setSavingLevel(false);
        if (ok) { setShowAddLevel(false); setLevelForm({ name: '', name_ar: '', code: '', display_order: '' }); }
    };

    // ── Major form state ──────────────────────────────────────────────────────
    const [showAddMajor, setShowAddMajor] = React.useState(false);
    const [majorForm, setMajorForm] = React.useState({ name: '', name_ar: '', code: '', description: '' });
    const [savingMajor, setSavingMajor] = React.useState(false);

    const handleAddMajor = async () => {
        if (!majorForm.name.trim()) return;
        setSavingMajor(true);
        const ok = await onAddMajor({
            name: majorForm.name,
            name_ar: majorForm.name_ar || null,
            code: majorForm.code || null,
            description: majorForm.description || null,
        });
        setSavingMajor(false);
        if (ok) { setShowAddMajor(false); setMajorForm({ name: '', name_ar: '', code: '', description: '' }); }
    };

    const inputCls = 'w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/60 placeholder-white/20';

    return (
        <div className="glass-card p-6 space-y-8">

            {/* ── Confirmation Modal via Portal ────────────────────────────── */}
            {confirm && ReactDOM.createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl p-6 space-y-5 shadow-2xl"
                        style={{ background: '#1e293b', border: '1px solid rgba(239,68,68,0.25)' }}
                        dir={isRtl ? 'rtl' : 'ltr'}
                    >
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                                <AlertTriangle size={28} className="text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">
                                {isRtl ? 'تأكيد الحذف' : 'Confirm Deletion'}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {isRtl
                                    ? <>{' '}هل أنت متأكد من حذف <span className="text-white font-semibold">"{confirm.name}"</span>؟ لا يمكن التراجع عن هذا الإجراء.</>
                                    : <>Are you sure you want to delete <span className="text-white font-semibold">"{confirm.name}"</span>? This action cannot be undone.</>
                                }
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirm(null)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors border border-white/10"
                            >
                                {isRtl ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                                style={{ background: 'rgba(239,68,68,0.85)', border: '1px solid rgba(239,68,68,0.5)' }}
                            >
                                {deleting ? (isRtl ? 'جاري الحذف...' : 'Deleting...') : (isRtl ? 'حذف' : 'Delete')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold">{isRtl ? 'التكوين الأكاديمي' : 'Academic Configuration'}</h2>
            </div>

            {/* ── Levels Section ───────────────────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-primary-400">{isRtl ? 'المستويات الأكاديمية' : 'Academic Levels'}</h3>
                    <button onClick={() => setShowAddLevel((v) => !v)} className="btn-secondary w-full sm:w-auto px-4 py-2 flex items-center justify-center gap-2 bg-black/20">
                        {showAddLevel ? <X size={16} /> : <Plus size={16} />}
                        {isRtl ? 'إضافة مستوى' : 'Add Level'}
                    </button>
                </div>

                {showAddLevel && (
                    <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                        <p className="text-sm font-medium text-indigo-300">{isRtl ? 'مستوى جديد' : 'New Level'}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input className={inputCls} placeholder={isRtl ? 'الاسم بالإنجليزية *' : 'Name (English) *'} value={levelForm.name} onChange={e => setLevelForm(p => ({ ...p, name: e.target.value }))} />
                            <input className={inputCls} placeholder={isRtl ? 'الاسم بالعربية' : 'Name (Arabic)'} value={levelForm.name_ar} onChange={e => setLevelForm(p => ({ ...p, name_ar: e.target.value }))} />
                            <input className={inputCls} placeholder={isRtl ? 'الكود (اختياري)' : 'Code (optional)'} value={levelForm.code} onChange={e => setLevelForm(p => ({ ...p, code: e.target.value }))} />
                            <input className={inputCls} type="number" placeholder={isRtl ? 'الترتيب (اختياري)' : 'Order (optional)'} value={levelForm.display_order} onChange={e => setLevelForm(p => ({ ...p, display_order: e.target.value }))} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddLevel(false)} className="px-4 py-2 text-sm rounded-lg text-gray-400 hover:bg-white/5 transition-colors">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                            <button disabled={savingLevel || !levelForm.name.trim()} onClick={handleAddLevel} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                                <Save size={14} /> {savingLevel ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ' : 'Save')}
                            </button>
                        </div>
                    </div>
                )}

                <div className="w-full overflow-x-auto bg-black/20 border border-white/5 rounded-xl shadow-sm">
                    <table className="w-full text-sm min-w-[600px]">
                        <thead className="bg-white/5 border-b border-white/5 text-gray-400">
                            <tr>
                                <th className="py-3 px-4 text-start font-medium whitespace-nowrap">{isRtl ? 'الاسم' : 'Name'}</th>
                                <th className="py-3 px-4 text-start font-medium whitespace-nowrap">{isRtl ? 'الكود' : 'Code'}</th>
                                <th className="py-3 px-4 text-start font-medium whitespace-nowrap">{isRtl ? 'الترتيب' : 'Order'}</th>
                                <th className="py-3 px-4 text-end font-medium whitespace-nowrap w-24">{isRtl ? 'إجراء' : 'Action'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {levels.length > 0 ? (
                                levels.map((level) => (
                                    <tr key={level.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="font-semibold">{isRtl ? (level.name_ar || level.name) : level.name}</span>
                                            {isRtl && level.name && <span className="block text-xs text-gray-500">{level.name}</span>}
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs text-start" dir="ltr"><span className="inline-block">{level.code || '—'}</span></td>
                                        <td className="py-3 px-4 text-gray-400">{level.display_order ?? '—'}</td>
                                        <td className="py-3 px-4 text-end">
                                            <button
                                                onClick={() => setConfirm({ type: 'level', id: level.id, name: isRtl ? (level.name_ar || level.name) : level.name })}
                                                className="p-1.5 text-danger-400 hover:bg-danger-400/20 rounded-lg transition-colors"
                                                title={isRtl ? 'حذف' : 'Delete'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-gray-500 whitespace-nowrap">{isRtl ? 'لا توجد مستويات — أضف مستوى جديداً' : 'No levels found — add a new level above'}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <hr className="border-white/10" />

            {/* ── Majors Section ───────────────────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-primary-400">{isRtl ? 'التخصصات والأقسام' : 'Majors & Specialties'}</h3>
                    <button onClick={() => setShowAddMajor((v) => !v)} className="btn-secondary w-full sm:w-auto px-4 py-2 flex items-center justify-center gap-2 bg-black/20">
                        {showAddMajor ? <X size={16} /> : <Plus size={16} />}
                        {isRtl ? 'إضافة تخصص' : 'Add Major'}
                    </button>
                </div>

                {showAddMajor && (
                    <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                        <p className="text-sm font-medium text-indigo-300">{isRtl ? 'تخصص جديد' : 'New Major'}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input className={inputCls} placeholder={isRtl ? 'الاسم بالإنجليزية *' : 'Name (English) *'} value={majorForm.name} onChange={e => setMajorForm(p => ({ ...p, name: e.target.value }))} />
                            <input className={inputCls} placeholder={isRtl ? 'الاسم بالعربية' : 'Name (Arabic)'} value={majorForm.name_ar} onChange={e => setMajorForm(p => ({ ...p, name_ar: e.target.value }))} />
                            <input className={inputCls} placeholder={isRtl ? 'الكود (اختياري)' : 'Code (optional)'} value={majorForm.code} onChange={e => setMajorForm(p => ({ ...p, code: e.target.value }))} />
                            <input className={inputCls} placeholder={isRtl ? 'الوصف (اختياري)' : 'Description (optional)'} value={majorForm.description} onChange={e => setMajorForm(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddMajor(false)} className="px-4 py-2 text-sm rounded-lg text-gray-400 hover:bg-white/5 transition-colors">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                            <button disabled={savingMajor || !majorForm.name.trim()} onClick={handleAddMajor} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                                <Save size={14} /> {savingMajor ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ' : 'Save')}
                            </button>
                        </div>
                    </div>
                )}

                <div className="w-full overflow-x-auto bg-black/20 border border-white/5 rounded-xl shadow-sm">
                    <table className="w-full text-sm min-w-[600px]">
                        <thead className="bg-white/5 border-b border-white/5 text-gray-400">
                            <tr>
                                <th className="py-3 px-4 text-start font-medium whitespace-nowrap">{isRtl ? 'الاسم' : 'Name'}</th>
                                <th className="py-3 px-4 text-start font-medium whitespace-nowrap">{isRtl ? 'الكود' : 'Code'}</th>
                                <th className="py-3 px-4 text-start font-medium whitespace-nowrap">{isRtl ? 'الوصف' : 'Description'}</th>
                                <th className="py-3 px-4 text-end font-medium whitespace-nowrap w-24">{isRtl ? 'إجراء' : 'Action'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {majors.length > 0 ? (
                                majors.map((major) => (
                                    <tr key={major.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="font-semibold">{isRtl ? (major.name_ar || major.name) : major.name}</span>
                                            {isRtl && major.name && <span className="block text-xs text-gray-500">{major.name}</span>}
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs text-start" dir="ltr"><span className="inline-block">{major.code || '—'}</span></td>
                                        <td className="py-3 px-4 text-gray-400 truncate max-w-[200px]" title={major.description || ''}>
                                            {major.description || '—'}
                                        </td>
                                        <td className="py-3 px-4 text-end">
                                            <button
                                                onClick={() => setConfirm({ type: 'major', id: major.id, name: isRtl ? (major.name_ar || major.name) : major.name })}
                                                className="p-1.5 text-danger-400 hover:bg-danger-400/20 rounded-lg transition-colors"
                                                title={isRtl ? 'حذف' : 'Delete'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-gray-500 whitespace-nowrap">{isRtl ? 'لا توجد تخصصات — أضف تخصصاً جديداً' : 'No majors found — add a new major above'}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
