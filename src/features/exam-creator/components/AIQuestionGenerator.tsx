import { useState, useCallback, useEffect } from 'react';
import { X, Upload, FileText, BookOpen, Sparkles, Loader2, CheckCircle, AlertCircle, Cpu, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { aiQuestionService } from '../../ai-question-generator/api/aiQuestionService';
import type {
    GeneratedQuestion,
    AIGenerationConfig,
    DocumentSource,
    AIProcessingState
} from '../../ai-question-generator/types';
import styles from '../ExamCreator.module.css';

interface AIQuestionGeneratorProps {
    courseId?: number;
    onQuestionsGenerated: (questions: GeneratedQuestion[]) => void;
    onClose: () => void;
}

export default function AIQuestionGenerator({
    courseId,
    onQuestionsGenerated,
    onClose
}: AIQuestionGeneratorProps) {
    const { i18n } = useTranslation('exams');
    const isRtl = i18n.language.startsWith('ar');

    const labels = {
        en: {
            title: 'AI Question Generator',
            uploadTab: 'Upload PDF',
            materialTab: 'Course Materials',
            loadingMaterials: 'Loading course materials...',
            noMaterials: 'No materials found for this course.',
            noMaterialsHint: 'Upload materials in Course Management first.',
            materialSelectHint: 'Click on materials to select (you can select multiple)',
            clearSelection: (count: number) => `Clear selection (${count} selected)`,
            dragDrop: 'Drag & drop your PDF here, or ',
            browse: 'browse',
            supportHint: 'Supports PDF files up to 50MB',
            remove: 'Remove',
            genSettings: 'Generation Settings',
            numQuestions: 'Number of Questions',
            difficulty: 'Difficulty Level',
            diffEasy: 'Easy',
            diffMedium: 'Medium',
            diffHard: 'Hard',
            examLang: 'Exam Language / لغة الامتحان',
            langEn: 'English / الإنجليزية',
            langAr: 'Arabic / العربية',
            qTypes: 'Question Types',
            typeMcq: 'Multiple Choice',
            typeTf: 'True/False',
            typeEssay: 'Essay / Subjective',
            cancel: 'Cancel',
            generate: 'Generate Questions',
            poweredBy: (provider: string) => `Powered by ${provider === 'mock' ? 'Demo AI' : provider}`,
            autoFailover: '(with auto-failover)',
            viewQuestions: 'View Questions in Builder',
            questionsGenerated: 'Questions Generated!',
            insufficientBalance: '⚠️ Insufficient Balance',
            rateLimit: '⏳ Rate Limit Exceeded',
            genFailed: '❌ Generation Failed',
            insufficientBalanceDesc: 'Your AI provider account has insufficient balance. Please check your billing status.',
            rateLimitDesc: 'You have exceeded your daily quota. Please wait 24 hours or upgrade your plan.',
            deepseekBilling: 'DeepSeek Billing',
            googlePricing: 'Google AI Pricing',
            addFunds: ' to add funds',
            upgradePlan: ' to upgrade your plan',
            tryAgain: 'Try Again',
            indexingMsg: (isAr: boolean) => isAr ? 'هذه الخطوة تتم مرة واحدة فقط لكل مستند' : 'This step only happens once per document'
        },
        ar: {
            title: 'توليد الأسئلة بالذكاء الاصطناعي',
            uploadTab: 'رفع ملف PDF',
            materialTab: 'مذكرات المادة',
            loadingMaterials: 'جاري تحميل المذكرات...',
            noMaterials: 'لا توجد مذكرات لهذه المادة.',
            noMaterialsHint: 'قم برفع المذكرات في إدارة المرفقات أولاً.',
            materialSelectHint: 'اضغط على الماتيريال لتحديدها (يمكن تحديد أكثر من واحد)',
            clearSelection: (count: number) => `مسح التحديد (${count} محدد)`,
            dragDrop: 'اسحب وأفلت ملف PDF هنا، أو ',
            browse: 'تصفح',
            supportHint: 'يدعم ملفات PDF بحجم أقصاه 50 ميغابايت',
            remove: 'إزالة',
            genSettings: 'إعدادات التوليد',
            numQuestions: 'عدد الأسئلة',
            difficulty: 'مستوى الصعوبة',
            diffEasy: 'سهل',
            diffMedium: 'متوسط',
            diffHard: 'صعب',
            examLang: 'لغة الامتحان / Exam Language',
            langEn: 'الإنجليزية / English',
            langAr: 'العربية / Arabic',
            qTypes: 'أنواع الأسئلة',
            typeMcq: 'اختيار من متعدد',
            typeTf: 'صواب / خطأ',
            typeEssay: 'إجابة حرة',
            cancel: 'إلغاء',
            generate: 'توليد الأسئلة',
            poweredBy: (provider: string) => `مشغل بواسطة ${provider === 'mock' ? 'Demo AI' : provider}`,
            autoFailover: '(مع التبديل التلقائي)',
            viewQuestions: 'عرض الأسئلة في المحرر',
            questionsGenerated: 'تم توليد الأسئلة بنجاح!',
            insufficientBalance: '⚠️ رصيد غير كافٍ',
            rateLimit: '⏳ تجاوزت الحد المسموح',
            genFailed: '❌ فشل التوليد',
            insufficientBalanceDesc: 'حساب مزود الذكاء الاصطناعي الخاص بك لا يحتوي على رصيد كافٍ. يرجى التحقق من حالة الفواتير.',
            rateLimitDesc: 'لقد تجاوزت الحصة اليومية. يرجى الانتظار 24 ساعة أو ترقية خطتك.',
            deepseekBilling: 'فواتير DeepSeek',
            googlePricing: 'أسعار Google AI',
            addFunds: ' لإضافة رصيد',
            upgradePlan: ' لترقية خطتك',
            tryAgain: 'حاول مرة أخرى',
            indexingMsg: (isAr: boolean) => isAr ? 'هذه الخطوة تتم مرة واحدة فقط لكل مستند' : 'This step only happens once per document'
        }
    };
    const txt = isRtl ? labels.ar : labels.en;

    console.log('AIQuestionGenerator component rendering');

    const [activeTab, setActiveTab] = useState<'upload' | 'material'>('upload');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [courseMaterials, setCourseMaterials] = useState<Array<{ id: number; title: string; url: string }>>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

    // Fetch course materials
    const loadCourseMaterials = useCallback(async () => {
        if (!courseId) return;

        setIsLoadingMaterials(true);
        try {
            const materials = await aiQuestionService.fetchCourseMaterials(courseId);
            setCourseMaterials(materials.map(m => ({
                id: m.id,
                title: m.title,
                url: m.url
            })));
        } catch (error) {
            console.error('Failed to load course materials:', error);
        } finally {
            setIsLoadingMaterials(false);
        }
    }, [courseId]);

    // Load materials immediately when component mounts if courseId exists
    useEffect(() => {
        if (courseId) {
            console.log('Loading materials for course:', courseId);
            loadCourseMaterials();
        }
    }, [courseId, loadCourseMaterials]);

    // Config state
    const [config, setConfig] = useState<AIGenerationConfig>({
        questionCount: 5,
        difficulty: 'medium',
        types: ['mcq', 'true_false'],
        language: 'en',
        courseId
    });

    // Processing state
    const [processingState, setProcessingState] = useState<AIProcessingState>({
        status: 'idle',
        progress: 0,
        message: ''
    });

    // AI Provider info
    const [activeProvider, setActiveProvider] = useState<string>('');
    const [showProviderBadge, setShowProviderBadge] = useState(false);

    // Load materials when tab switches to 'material'
    useEffect(() => {
        if (activeTab === 'material' && courseId) {
            loadCourseMaterials();
        }
    }, [activeTab, courseId, loadCourseMaterials]);

    // Handle file upload
    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file);
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file);
        }
    }, []);

    // Handle material selection toggle
    const toggleMaterialSelection = (materialId: number) => {
        setSelectedMaterials(prev =>
            prev.includes(materialId)
                ? prev.filter(id => id !== materialId)
                : [...prev, materialId]
        );
    };

    // Generate questions
    const handleGenerate = async () => {
        let source: DocumentSource;

        if (activeTab === 'upload' && uploadedFile) {
            source = {
                type: 'upload',
                file: uploadedFile,
                title: uploadedFile.name
            };
        } else if (activeTab === 'material' && selectedMaterials.length > 0) {
            const selectedMaterialsData = courseMaterials.filter(m => selectedMaterials.includes(m.id));
            source = {
                type: 'course_material',
                materialIds: selectedMaterials,
                materialUrls: selectedMaterialsData.map(m => m.url),
                title: selectedMaterialsData.map(m => m.title).join(', ')
            };
        } else {
            return;
        }

        try {
            const result = await aiQuestionService.generateQuestions(
                source,
                config,
                (state) => {
                    setProcessingState(state);
                    if (state.provider) {
                        setActiveProvider(state.provider);
                    }
                }
            );

            setActiveProvider(result.provider);
            setShowProviderBadge(true);
            onQuestionsGenerated(result.questions);
        } catch (error) {
            console.error('Generation failed:', error);
        }
    };

    // Switch tab handler
    const handleTabChange = (tab: 'upload' | 'material') => {
        setActiveTab(tab);
        if (tab === 'material' && courseMaterials.length === 0) {
            loadCourseMaterials();
        }
    };

    const canGenerate = (activeTab === 'upload' && uploadedFile) ||
        (activeTab === 'material' && selectedMaterials.length > 0);

    console.log('AIQuestionGenerator about to render JSX');

    return (
        <div className={styles.aiGeneratorOverlay} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={styles.aiGeneratorModal}>
                {/* Header */}
                <div className={styles.aiGeneratorHeader}>
                    <div className={styles.aiGeneratorTitle}>
                        <Sparkles size={24} className={styles.aiIcon} />
                        <h2>{txt.title}</h2>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                {/* Processing State */}
                {processingState.status === 'uploading' ||
                    processingState.status === 'extracting' ||
                    processingState.status === 'generating' ? (
                    <div className={styles.aiProcessingState}>
                        {activeProvider === 'indexing' ? (
                            <Database size={48} className={styles.aiSpinner} />
                        ) : (
                            <Loader2 size={48} className={styles.aiSpinner} />
                        )}
                        <div className={styles.aiProgressBar}>
                            <div
                                className={styles.aiProgressFill}
                                style={{ width: `${processingState.progress}%` }}
                            />
                        </div>
                        <p className={styles.aiProcessingMessage}>{processingState.message}</p>
                        {activeProvider === 'indexing' && (
                            <p className={styles.aiProcessingSubMessage}>
                                {txt.indexingMsg(isRtl)}
                            </p>
                        )}
                    </div>
                ) : processingState.status === 'complete' ? (
                    <div className={styles.aiCompleteState}>
                        <CheckCircle size={64} className={styles.aiSuccessIcon} />
                        <h3>{txt.questionsGenerated}</h3>
                        <p>{processingState.message}</p>
                        {showProviderBadge && (
                            <div className={styles.aiProviderBadge}>
                                <Cpu size={14} />
                                <span>{txt.poweredBy(activeProvider)}</span>
                                {activeProvider !== 'mock' && (
                                    <span className={styles.aiProviderNote}>
                                        {txt.autoFailover}
                                    </span>
                                )}
                            </div>
                        )}
                        <button onClick={onClose} className={styles.aiCloseSuccessBtn}>
                            {txt.viewQuestions}
                        </button>
                    </div>
                ) : processingState.status === 'error' ? (
                    <div className={styles.aiErrorState}>
                        <AlertCircle size={48} className={styles.aiErrorIcon} />
                        <h3>
                            {processingState.error?.includes('Insufficient Balance')
                                ? txt.insufficientBalance
                                : processingState.error?.includes('Quota exceeded')
                                    ? txt.rateLimit
                                    : txt.genFailed}
                        </h3>
                        <div className={styles.aiErrorDetails}>
                            <p className={styles.aiErrorMainMessage}>
                                {processingState.error?.includes('Insufficient Balance')
                                    ? txt.insufficientBalanceDesc
                                    : processingState.error?.includes('Quota exceeded')
                                        ? txt.rateLimitDesc
                                        : processingState.error}
                            </p>
                            {processingState.error?.includes('Insufficient Balance') && (
                                <p className={styles.aiErrorHelp}>
                                    💡 <a href="https://platform.deepseek.com/billing" target="_blank" rel="noopener">{txt.deepseekBilling}</a>{txt.addFunds}
                                </p>
                            )}
                            {processingState.error?.includes('Quota exceeded') && (
                                <p className={styles.aiErrorHelp}>
                                    💡 <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener">{txt.googlePricing}</a>{txt.upgradePlan}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setProcessingState({ status: 'idle', progress: 0, message: '' })}
                            className={styles.aiRetryBtn}
                        >
                            {txt.tryAgain}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className={styles.aiGeneratorTabs}>
                            <button
                                className={`${styles.aiTab} ${activeTab === 'upload' ? styles.active : ''}`}
                                onClick={() => handleTabChange('upload')}
                            >
                                <Upload size={18} />
                                {txt.uploadTab}
                            </button>
                            <button
                                className={`${styles.aiTab} ${activeTab === 'material' ? styles.active : ''}`}
                                onClick={() => handleTabChange('material')}
                            >
                                <BookOpen size={18} />
                                {txt.materialTab}
                            </button>
                        </div>

                        {/* Content */}
                        <div className={styles.aiGeneratorContent}>
                            {activeTab === 'upload' ? (
                                <div
                                    className={styles.aiDropZone}
                                    onDrop={handleFileDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    {uploadedFile ? (
                                        <div className={styles.aiFilePreview}>
                                            <FileText size={48} />
                                            <p className={styles.aiFileName}>{uploadedFile.name}</p>
                                            <p className={styles.aiFileSize}>
                                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            <button
                                                onClick={() => setUploadedFile(null)}
                                                className={styles.aiRemoveFile}
                                            >
                                                {txt.remove}
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={48} className={styles.aiDropIcon} />
                                            <p className={styles.aiDropText}>
                                                {txt.dragDrop}
                                                <label className={styles.aiBrowseLink}>
                                                    {txt.browse}
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={handleFileSelect}
                                                        hidden
                                                    />
                                                </label>
                                            </p>
                                            <p className={styles.aiDropHint}>
                                                {txt.supportHint}
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.aiMaterialsList}>
                                    {isLoadingMaterials ? (
                                        <div className={styles.aiLoadingMaterials}>
                                            <Loader2 size={24} className={styles.aiSpinner} />
                                            <p>{txt.loadingMaterials}</p>
                                        </div>
                                    ) : courseMaterials.length === 0 ? (
                                        <div className={styles.aiNoMaterials}>
                                            <BookOpen size={48} />
                                            <p>{txt.noMaterials}</p>
                                            <p className={styles.aiNoMaterialsHint}>
                                                {txt.noMaterialsHint}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className={styles.aiMaterialsHint}>
                                                {txt.materialSelectHint}
                                            </p>
                                            {courseMaterials.map(material => (
                                                <div
                                                    key={material.id}
                                                    className={`${styles.aiMaterialCard} ${selectedMaterials.includes(material.id) ? styles.selected : ''
                                                        }`}
                                                    onClick={() => toggleMaterialSelection(material.id)}
                                                >
                                                    <FileText size={24} />
                                                    <div className={styles.aiMaterialInfo}>
                                                        <p className={styles.aiMaterialTitle}>{material.title}</p>
                                                    </div>
                                                    {selectedMaterials.includes(material.id) && (
                                                        <CheckCircle size={20} className={styles.aiSelectedIcon} />
                                                    )}
                                                </div>
                                            ))}
                                            {selectedMaterials.length > 0 && (
                                                <button
                                                    className={styles.aiClearSelection}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedMaterials([]);
                                                    }}
                                                >
                                                    {txt.clearSelection(selectedMaterials.length)}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Configuration */}
                        <div className={styles.aiConfigSection}>
                            <h3>{txt.genSettings}</h3>

                            <div className={styles.aiConfigGrid}>
                                <div className={styles.aiConfigField}>
                                    <label>{txt.numQuestions}</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={config.questionCount}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev,
                                            questionCount: parseInt(e.target.value) || 5
                                        }))}
                                    />
                                </div>

                                <div className={styles.aiConfigField}>
                                    <label>{txt.difficulty}</label>
                                    <select
                                        value={config.difficulty}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev,
                                            difficulty: e.target.value as AIGenerationConfig['difficulty']
                                        }))}
                                    >
                                        <option value="easy">{txt.diffEasy}</option>
                                        <option value="medium">{txt.diffMedium}</option>
                                        <option value="hard">{txt.diffHard}</option>
                                    </select>
                                </div>

                                <div className={styles.aiConfigField}>
                                    <label>{txt.examLang}</label>
                                    <select
                                        value={config.language}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev,
                                            language: e.target.value as 'ar' | 'en'
                                        }))}
                                    >
                                        <option value="en">{txt.langEn}</option>
                                        <option value="ar">{txt.langAr}</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.aiQuestionTypes}>
                                <label>{txt.qTypes}</label>
                                <div className={styles.aiTypeCheckboxes}>
                                    <label className={styles.aiTypeCheckbox}>
                                        <input
                                            type="checkbox"
                                            checked={config.types.includes('mcq')}
                                            onChange={(e) => {
                                                const types = e.target.checked
                                                    ? [...config.types, 'mcq']
                                                    : config.types.filter(t => t !== 'mcq');
                                                setConfig(prev => ({ ...prev, types: types as AIGenerationConfig['types'] }));
                                            }}
                                        />
                                        <span>{txt.typeMcq}</span>
                                    </label>
                                    <label className={styles.aiTypeCheckbox}>
                                        <input
                                            type="checkbox"
                                            checked={config.types.includes('true_false')}
                                            onChange={(e) => {
                                                const types = e.target.checked
                                                    ? [...config.types, 'true_false']
                                                    : config.types.filter(t => t !== 'true_false');
                                                setConfig(prev => ({ ...prev, types: types as AIGenerationConfig['types'] }));
                                            }}
                                        />
                                        <span>{txt.typeTf}</span>
                                    </label>
                                    <label className={styles.aiTypeCheckbox}>
                                        <input
                                            type="checkbox"
                                            checked={config.types.includes('essay')}
                                            onChange={(e) => {
                                                const types = e.target.checked
                                                    ? [...config.types, 'essay']
                                                    : config.types.filter(t => t !== 'essay');
                                                setConfig(prev => ({ ...prev, types: types as AIGenerationConfig['types'] }));
                                            }}
                                        />
                                        <span>{txt.typeEssay}</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.aiGeneratorActions}>
                            <button onClick={onClose} className={styles.aiCancelBtn}>
                                {txt.cancel}
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={!canGenerate || config.types.length === 0}
                                className={styles.aiGenerateBtn}
                                title={activeProvider ? `AI: ${activeProvider}` : 'Click to generate'}
                            >
                                <Sparkles size={18} />
                                {txt.generate}
                                {processingState.provider && processingState.provider !== 'mock' && (
                                    <span className={styles.aiProviderTag}>
                                        {processingState.provider}
                                    </span>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
