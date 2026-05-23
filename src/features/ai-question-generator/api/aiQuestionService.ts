/**
 * AI Question Generator Service
 * Service for generating questions from documents using AI
 * 
 * Supports:
 * - Mock AI for testing/development
 * - Real AI with multi-provider failover (Gemini, OpenAI, Anthropic)
 * - PDF parsing for document text extraction
 */

import type { GeneratedQuestion, AIGenerationConfig, DocumentSource, AIProcessingState } from '../types';
import { realAiService } from './realAiService';

// Mode configuration - set VITE_USE_REAL_AI=true in .env.local to use real AI
const USE_REAL_AI = import.meta.env.VITE_USE_REAL_AI === 'true' || false;

/**
 * Main service object for AI Question Generation
 * Automatically switches between mock and real AI based on configuration
 */
export const aiQuestionService = {
    /**
     * Check if real AI is available and which provider is active
     */
    async checkAIStatus(): Promise<{ useRealAI: boolean; provider: string; available: boolean }> {
        if (!USE_REAL_AI) {
            return { useRealAI: false, provider: 'mock', available: true };
        }
        
        const status = await realAiService.testConnection();
        return { 
            useRealAI: status.available, 
            provider: status.provider, 
            available: status.available 
        };
    },

    /**
     * Process documents and generate questions
     * This is the main entry point for AI question generation
     * Automatically uses real AI if configured, otherwise falls back to mock
     */
    async generateQuestions(
        source: DocumentSource,
        config: AIGenerationConfig,
        onProgress?: (state: AIProcessingState) => void
    ): Promise<{ questions: GeneratedQuestion[]; provider: string }> {
        const useRealAI = USE_REAL_AI;
        
        if (useRealAI) {
            // Use real AI with multi-provider failover
            let realSource;
            if (source.file) {
                realSource = { type: 'file' as const, file: source.file };
            } else if (source.materialUrls && source.materialUrls.length > 0) {
                // Multiple materials — pass materialIds for RAG mode
                realSource = { 
                    type: 'material' as const, 
                    urls: source.materialUrls, 
                    titles: source.title.split(', '),
                    title: source.title,
                    materialIds: source.materialIds
                };
            } else {
                // Single material
                realSource = { 
                    type: 'material' as const, 
                    url: source.materialUrl || '', 
                    title: source.title 
                };
            }
            
            return await realAiService.generateQuestions(
                realSource,
                config,
                undefined,
                onProgress
            );
        } else {
            // Use mock AI
            return await mockGenerateQuestions(source, config, onProgress);
        }
    },
    
    /**
     * Fetch course materials for selection
     */
    async fetchCourseMaterials(courseId: number) {
        const { supabase } = await import('../../../services/supabase');
        
        const { data, error } = await supabase
            .from('course_materials')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error fetching course materials:', error);
            throw error;
        }
        
        return data || [];
    }
};

// ==================== MOCK IMPLEMENTATION ====================

/**
 * Mock function to simulate PDF text extraction
 */
async function mockExtractTextFromPDF(source: DocumentSource): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return `
        Document: ${source.title}
        
        This is a sample educational document about ${source.title}.
        
        Key Concepts:
        1. The fundamental principles of the subject matter
        2. Important historical developments
        3. Practical applications and examples
        4. Theoretical frameworks and models
        5. Current trends and future directions
        
        Detailed Content:
        The study of ${source.title} involves understanding multiple dimensions
        including theoretical foundations, practical implementations, and critical
        analysis of key concepts. Students should focus on mastering the core
        principles before advancing to complex applications.
        
        Important topics include:
        - Basic definitions and terminology
        - Core methodologies and approaches
        - Case studies and real-world examples
        - Common challenges and solutions
        - Best practices in the field
    `;
}

/**
 * Mock function to generate questions
 */
async function mockGenerateQuestionsWithAI(
    _content: string,
    config: AIGenerationConfig
): Promise<GeneratedQuestion[]> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const questions: GeneratedQuestion[] = [];
    
    const isArabic = config.language === 'ar';
    
    if (config.types.includes('mcq')) {
        const mcqCount = Math.ceil(config.questionCount * 0.6);
        for (let i = 0; i < mcqCount; i++) {
            questions.push(isArabic ? {
                text: `ما هو المفهوم الرئيسي المناقش في المستند حول الموضوعات ذات المستوى ${config.difficulty === 'easy' ? 'سهل' : config.difficulty === 'medium' ? 'متوسط' : 'صعب'}؟`,
                type: 'mcq',
                options: [
                    'أ) الإجابة الأولى',
                    'ب) الإجابة الثانية',
                    'ج) الإجابة الثالثة',
                    'د) الإجابة الرابعة'
                ],
                correct_answer: 'أ) الإجابة الأولى',
                explanation: 'هذه هي الإجابة الصحيحة لأن المستند يوضح هذا المفهوم بوضوح.',
                marks: 1
            } : {
                text: `What is the main concept discussed in the document regarding ${config.difficulty} level topics?`,
                type: 'mcq',
                options: [
                    'A) First possible answer',
                    'B) Second possible answer',
                    'C) Third possible answer',
                    'D) Fourth possible answer'
                ],
                correct_answer: 'A) First possible answer',
                explanation: 'This is the correct answer because the document clearly states this concept.',
                marks: 1
            });
        }
    }
    
    if (config.types.includes('true_false')) {
        const tfCount = Math.ceil(config.questionCount * 0.3);
        for (let i = 0; i < tfCount; i++) {
            questions.push(isArabic ? {
                text: `يناقش المستند المبادئ الأساسية لموضوع المادة.`,
                type: 'true_false',
                options: ['صح', 'خطأ'],
                correct_answer: 'صح',
                explanation: 'هذا مؤكد من محتوى المستند.',
                marks: 1
            } : {
                text: `The document discusses fundamental principles of the subject matter.`,
                type: 'true_false',
                options: ['True', 'False'],
                correct_answer: 'True',
                explanation: 'This is confirmed by the document content.',
                marks: 1
            });
        }
    }
    
    if (config.types.includes('essay')) {
        const essayCount = Math.ceil(config.questionCount * 0.1);
        for (let i = 0; i < essayCount; i++) {
            questions.push(isArabic ? {
                text: `اشرح المفاهيم الرئيسية المناقشة في المستند حول الموضوعات ذات المستوى ${config.difficulty === 'easy' ? 'سهل' : config.difficulty === 'medium' ? 'متوسط' : 'صعب'} وقدم أمثلة.`,
                type: 'essay',
                correct_answer: 'إجابة شاملة تناقش المفاهيم الرئيسية مع أمثلة من المستند.',
                explanation: 'يجب على الطلاب تغطية: 1) المفاهيم الرئيسية 2) أمثلة عملية 3) التحليل النقدي',
                marks: 5
            } : {
                text: `Explain the key concepts discussed in the document about ${config.difficulty} level topics and provide examples.`,
                type: 'essay',
                correct_answer: 'A comprehensive answer discussing the key concepts with examples from the document.',
                explanation: 'Students should cover: 1) Main concepts 2) Practical examples 3) Critical analysis',
                marks: 5
            });
        }
    }

    if (config.types.includes('short_answer')) {
        const saCount = Math.ceil(config.questionCount * 0.1);
        for (let i = 0; i < saCount; i++) {
            questions.push(isArabic ? {
                text: `اشرح بإيجاز مفهومًا رئيسيًا واحدًا من المستند.`,
                type: 'short_answer',
                correct_answer: 'إجابة موجزة تشرح المفهوم الرئيسي.',
                explanation: 'ركز على الفكرة الرئيسية مع تفاصيل داعمة.',
                marks: 2
            } : {
                text: `Briefly explain one key concept from the document.`,
                type: 'short_answer',
                correct_answer: 'A concise answer explaining the key concept.',
                explanation: 'Focus on the main idea with supporting details.',
                marks: 2
            });
        }
    }
    
    return questions.slice(0, config.questionCount);
}

/**
 * Mock question generation process
 */
async function mockGenerateQuestions(
    source: DocumentSource,
    config: AIGenerationConfig,
    onProgress?: (state: AIProcessingState) => void
): Promise<{ questions: GeneratedQuestion[]; provider: string }> {
    const isArabic = config.language === 'ar';
    
    try {
        onProgress?.({
            status: 'uploading',
            progress: 10,
            message: isArabic ? 'جاري الوصول للمستند...' : 'Accessing document...',
            provider: 'mock'
        });
        
        onProgress?.({
            status: 'extracting',
            progress: 30,
            message: isArabic 
                ? `جاري استخراج النص من ${source.materialUrls?.length || 1} ماتيريال...`
                : `Extracting text from ${source.materialUrls?.length || 1} material(s)...`,
            provider: 'mock'
        });
        
        const extractedText = await mockExtractTextFromPDF(source);
        
        onProgress?.({
            status: 'generating',
            progress: 60,
            message: isArabic 
                ? 'الذكاء الاصطناعي يقوم بتحليل المحتوى وإنشاء الأسئلة...'
                : 'AI is analyzing content and generating questions...',
            provider: 'mock'
        });
        
        const questions = await mockGenerateQuestionsWithAI(extractedText, config);
        
        onProgress?.({
            status: 'complete',
            progress: 100,
            message: isArabic 
                ? `تم إنشاء ${questions.length} سؤال بنجاح!`
                : `Generated ${questions.length} questions successfully!`,
            questions,
            provider: 'mock'
        });
        
        return { questions, provider: 'mock' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate questions';
        onProgress?.({
            status: 'error',
            progress: 0,
            message: errorMessage,
            error: errorMessage,
            provider: 'mock'
        });
        throw new Error(errorMessage);
    }
}
