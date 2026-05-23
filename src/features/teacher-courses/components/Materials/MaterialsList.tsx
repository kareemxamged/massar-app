import { FileText, Video, Link as LinkIcon, Trash, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CourseMaterial, MaterialType } from '../../api/materialsApi';
import { format } from 'date-fns';

interface MaterialsListProps {
    materials: CourseMaterial[];
    isLoading: boolean;
    onDelete: (id: string, type: MaterialType, url: string) => Promise<void>;
}

export function MaterialsList({ materials, isLoading, onDelete }: MaterialsListProps) {
    const { t } = useTranslation('common');
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-800/50 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (materials.length === 0) {
        return (
            <div className="text-center py-10 px-4 border-2 border-dashed border-slate-800 rounded-2xl">
                <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <h3 className="text-slate-300 font-medium">{t('teacherCourses.modals.materials.noMaterials', 'No materials yet')}</h3>
                <p className="text-slate-500 text-sm mt-1">{t('teacherCourses.modals.materials.noMaterialsDesc', 'Upload a PDF, Video, or add a Link to get started.')}</p>
            </div>
        );
    }

    const getIcon = (type: MaterialType) => {
        switch (type) {
            case 'pdf': return <FileText className="w-5 h-5 text-rose-400" />;
            case 'video': return <Video className="w-5 h-5 text-indigo-400" />;
            case 'link': return <LinkIcon className="w-5 h-5 text-emerald-400" />;
        }
    };

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {materials.map((material) => (
                <div
                    key={material.id}
                    className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800/60 rounded-xl hover:border-slate-700 transition-colors group"
                >
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                            {getIcon(material.type)}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <a
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-semibold text-slate-200 hover:text-indigo-400 transition-colors truncate text-start"
                                >
                                    {material.title}
                                </a>
                                {material.approval_status === 'pending' && (
                                    <span className="inline-flex items-center gap-1 mx-2 py-0.5 px-2 rounded-full text-xs font-medium" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                                        <Clock size={10} />{t('teacherCourses.modals.materials.pendingReview', 'Pending Review')}
                                    </span>
                                )}
                                {material.approval_status === 'approved' && (
                                    <span className="inline-flex items-center gap-1 mx-2 py-0.5 px-2 rounded-full text-xs font-medium" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
                                        <CheckCircle size={10} />{t('teacherCourses.modals.materials.approved', 'Approved')}
                                    </span>
                                )}
                                {material.approval_status === 'rejected' && (
                                    <span className="inline-flex items-center gap-1 mx-2 py-0.5 px-2 rounded-full text-xs font-medium" style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185' }}>
                                        <XCircle size={10} />{t('teacherCourses.modals.materials.rejected', 'Rejected')}
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                <span className="uppercase tracking-wider font-medium">{material.type}</span>
                                <span>•</span>
                                <span>{format(new Date(material.created_at), 'MMM d, yyyy')}</span>
                                {material.approval_status === 'rejected' && material.review_notes && (
                                    <span className="text-rose-400">• {material.review_notes}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (window.confirm(t('teacherCourses.modals.materials.deleteConfirm', 'Are you sure you want to delete this material?'))) {
                                void onDelete(material.id, material.type, material.url);
                            }
                        }}
                        className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                        title="Delete material"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
