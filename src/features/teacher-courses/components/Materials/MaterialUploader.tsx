import { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, FileText, Video, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MaterialUploaderProps {
    isUploading: boolean;
    onUploadFile: (file: File, title: string) => Promise<void>;
    onAddLink: (title: string, url: string) => Promise<void>;
}

type UploadMode = 'file' | 'link';

export function MaterialUploader({ isUploading, onUploadFile, onAddLink }: MaterialUploaderProps) {
    const { t } = useTranslation('common');
    const [mode, setMode] = useState<UploadMode>('file');
    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const validTypes = ['application/pdf', 'video/mp4', 'video/webm'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a PDF or Video (MP4/WebM) file.');
                return;
            }
            setSelectedFile(file);
            if (!title) {
                // Auto-set title from filename without extension
                setTitle(file.name.replace(/\.[^/.]+$/, ''));
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (mode !== 'file') return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const validTypes = ['application/pdf', 'video/mp4', 'video/webm'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a PDF or Video (MP4/WebM) file.');
                return;
            }
            setSelectedFile(file);
            if (!title) {
                setTitle(file.name.replace(/\.[^/.]+$/, ''));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        try {
            if (mode === 'file' && selectedFile) {
                await onUploadFile(selectedFile, title);
                setSelectedFile(null);
            } else if (mode === 'link' && linkUrl) {
                await onAddLink(title, linkUrl);
                setLinkUrl('');
            }
            setTitle('');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload material. Please try again.');
        }
    };

    return (
        <div className="bg-slate-950/20 border border-slate-800 rounded-2xl p-5">
            <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800 mb-5">
                <button
                    type="button"
                    onClick={() => setMode('file')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${mode === 'file'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    <UploadCloud className="w-4 h-4" /> {t('teacherCourses.modals.uploader.fileUpload', 'File Upload')}
                </button>
                <button
                    type="button"
                    onClick={() => setMode('link')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${mode === 'link'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    <LinkIcon className="w-4 h-4" /> {t('teacherCourses.modals.uploader.externalLink', 'External Link')}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-start">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('teacherCourses.modals.uploader.title', 'Material Title')}</label>
                    <input
                        type="text"
                        required
                        placeholder={t('teacherCourses.modals.uploader.titlePlaceholder', 'e.g. Chapter 1 Lecture, Syllabus...')}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                </div>

                {mode === 'link' ? (
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('teacherCourses.modals.uploader.url', 'URL')}</label>
                        <input
                            type="url"
                            required
                            placeholder="https://..."
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('teacherCourses.modals.uploader.attachFile', 'Attach File (PDF, Video)')}</label>
                        {!selectedFile ? (
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/50 hover:bg-slate-900 rounded-xl p-6 text-center cursor-pointer transition-all group"
                            >
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    accept="application/pdf,video/mp4,video/webm"
                                    onChange={handleFileChange}
                                />
                                <div className="flex justify-center gap-3 mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <FileText className="w-6 h-6 text-rose-400" />
                                    <Video className="w-6 h-6 text-indigo-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-300">{t('teacherCourses.modals.uploader.uploadInst', 'Click to upload or drag and drop')}</p>
                                <p className="text-xs text-slate-500 mt-1">{t('teacherCourses.modals.uploader.uploadLimit', 'PDF or Video up to 50MB')}</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                        {selectedFile.type.includes('pdf') ? <FileText className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-slate-200 truncate">{selectedFile.name}</p>
                                        <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isUploading || !title || (mode === 'file' && !selectedFile) || (mode === 'link' && !linkUrl)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-medium text-sm transition-all focus:ring-4 focus:ring-indigo-500/20 flex items-center justify-center gap-2"
                >
                    {isUploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            {t('teacherCourses.modals.uploader.uploading', 'Uploading...')}
                        </>
                    ) : (
                        mode === 'file' ? t('teacherCourses.modals.uploader.uploadBtn', 'Upload Material') : t('teacherCourses.modals.uploader.addLinkBtn', 'Add Link')
                    )}
                </button>
            </form>
        </div>
    );
}
