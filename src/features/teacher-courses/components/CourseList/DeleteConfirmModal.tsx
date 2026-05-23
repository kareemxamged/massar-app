import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DeleteConfirmModalProps {
    title: string;
    itemName: string;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmModal({ title, itemName, isDeleting, onConfirm, onCancel }: DeleteConfirmModalProps) {
    const { t, i18n } = useTranslation('common');
    return (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200" dir={i18n.dir()} onClick={onCancel}>
            <div
                className="w-full max-w-md bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-6 lg:p-8 flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-500/10 mb-6">
                    <AlertTriangle className="h-8 w-8 text-rose-400" />
                </div>

                <h3 className="text-xl font-bold text-center text-white mb-2">{title}</h3>

                <p className="text-slate-400 text-center mb-8">
                    {t('teacherCourses.modals.deleteConfirm.areYouSure', 'Are you sure you want to delete')} <span className="font-semibold text-slate-200">"{itemName}"</span>? {t('teacherCourses.modals.deleteConfirm.warning', 'This action cannot be undone and all associated data will be permanently removed.')}
                </p>

                <div className="flex items-center gap-3 w-full">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                        {t('teacherCourses.modals.deleteConfirm.cancel', 'Cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                {t('teacherCourses.modals.deleteConfirm.deleting', 'Deleting...')}
                            </>
                        ) : (
                            t('teacherCourses.modals.deleteConfirm.deleteForever', 'Delete Forever')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
