/**
 * Production AI Question Generator Service
 * Calls Supabase Edge Function with multi-provider failover (Gemini, OpenAI, Anthropic)
 * Includes PDF parsing for document text extraction
 */

import type { GeneratedQuestion, AIGenerationConfig, AIProcessingState } from '../types';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-question-generator`;
const PROCESS_DOCUMENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-document`;

interface AIResponse {
  success: boolean;
  provider: string;
  generationTime: number;
  questions: GeneratedQuestion[];
  count: number;
  error?: string;
  errorCode?: string;
  errorDetail?: string;
  usedRAG?: boolean;
  retrievedChunks?: number;
}

/**
 * Extract text from PDF or document
 * For browser compatibility, we use simple text extraction
 * PDFs with complex content will be processed as binary and may need server-side extraction
 */
async function extractTextFromDocument(file: File): Promise<string> {
  // First try to extract as text (works for text-based PDFs, TXT, etc.)
  try {
    const text = await file.text();
    if (text && text.trim().length > 50) {
      return text;
    }
  } catch {
    // Not a text-based file
  }
  
  // For PDFs that can't be extracted as text, throw error with helpful message
  throw new Error(
    'Could not extract text from this PDF. The file may be:\n' +
    '1. A scanned image-based PDF (needs OCR)\n' +
    '2. A complex PDF with embedded fonts\n' +
    '3. A corrupted or encrypted file\n\n' +
    'Please try:\n' +
    '- Converting PDF to text format\n' +
    '- Using a PDF with selectable text\n' +
    '- Copy-pasting content directly'
  );
}

/**
 * Index a document for RAG by calling the process-document edge function
 */
async function indexDocumentForRAG(
  documentId: number,
  documentText: string,
  courseId?: number
): Promise<{ chunksProcessed: number }> {
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseKey) throw new Error('Supabase key not configured');

  const response = await fetch(PROCESS_DOCUMENT_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseKey
    },
    body: JSON.stringify({ documentId, documentText, courseId })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Document indexing failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to index document');
  }

  return { chunksProcessed: data.chunksProcessed || 0 };
}

/**
 * Call Edge Function to generate questions with AI
 * Supports both RAG mode (documentId) and legacy mode (documentText)
 */
async function generateQuestionsWithAI(
  documentText: string,
  config: AIGenerationConfig,
  courseContext?: string,
  documentId?: number
): Promise<{ questions: GeneratedQuestion[]; provider: string; generationTime: number; usedRAG?: boolean; retrievedChunks?: number }> {
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseKey) {
    throw new Error('Supabase key not configured');
  }

  // Build request body — prefer documentId (RAG) over documentText (legacy)
  const requestBody: Record<string, unknown> = {
    config: {
      questionCount: config.questionCount,
      difficulty: config.difficulty,
      types: config.types,
      language: config.language
    },
    courseContext
  };

  if (documentId) {
    // RAG mode: send documentId only, no full text
    requestBody.documentId = documentId;
  } else {
    // Legacy mode: send full document text
    requestBody.documentText = documentText;
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseKey
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    let errorData: AIResponse;
    try {
      errorData = await response.json();
    } catch {
      const errorText = await response.text();
      throw new Error(`AI generation failed: ${response.status} - ${errorText}`);
    }
    // If document not indexed, try indexing it first then retry
    if (errorData.errorCode === 'DOCUMENT_NOT_INDEXED' && documentId && documentText) {
      throw new Error('DOCUMENT_NOT_INDEXED');
    }
    const errorMsg = errorData.errorDetail || errorData.error || `AI generation failed: ${response.status}`;
    throw new Error(errorMsg);
  }

  const data: AIResponse = await response.json();

  if (!data.success || !data.questions) {
    // Handle DOCUMENT_NOT_INDEXED with auto-retry hint
    if (data.errorCode === 'DOCUMENT_NOT_INDEXED') {
      throw new Error('DOCUMENT_NOT_INDEXED');
    }
    throw new Error(data.error || 'Failed to generate questions');
  }

  return {
    questions: data.questions,
    provider: data.provider,
    generationTime: data.generationTime,
    usedRAG: data.usedRAG,
    retrievedChunks: data.retrievedChunks
  };
}

/**
 * Fetch and extract text from multiple material URLs
 */
async function extractTextFromMultipleMaterials(urls: string[], titles: string[]): Promise<string> {
  const texts: string[] = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await fetch(urls[i]);
      if (!response.ok) {
        console.warn(`Failed to fetch material ${i + 1}: ${response.status}`);
        continue;
      }
      
      const blob = await response.blob();
      let text = '';
      
      if (blob.type === 'application/pdf') {
        text = await extractTextFromDocument(new File([blob], titles[i] || `Material ${i + 1}`, { type: 'application/pdf' }));
      } else {
        text = await blob.text();
      }
      
      if (text && text.trim().length > 50) {
        texts.push(`\n\n--- MATERIAL ${i + 1}: ${titles[i] || `Material ${i + 1}`} ---\n\n${text}`);
      }
    } catch (error) {
      console.warn(`Error processing material ${i + 1}:`, error);
    }
  }
  
  if (texts.length === 0) {
    throw new Error('Failed to extract text from any of the selected materials');
  }
  
  return texts.join('\n');
}

/**
 * Main service object for Production AI Question Generation
 */
export const realAiService = {
  /**
   * Process documents and generate questions using real AI
   * @param source Document source (file or material)
   * @param config Generation configuration
   * @param courseContext Optional course context for better question generation
   * @param onProgress Progress callback
   */
  async generateQuestions(
    source: { type: 'file'; file: File } | { type: 'material'; url?: string; urls?: string[]; title: string; titles?: string[]; materialIds?: number[] },
    config: AIGenerationConfig,
    courseContext?: string,
    onProgress?: (state: AIProcessingState & { provider?: string }) => void
  ): Promise<{ questions: GeneratedQuestion[]; provider: string }> {
    let provider = 'unknown';
    
    try {
      // Step 1: Access document
      onProgress?.({
        status: 'uploading',
        progress: 10,
        message: 'Accessing document...',
        provider: 'preparing'
      });

      let documentText: string;
      let documentId: number | undefined;

      if (source.type === 'file') {
        // Step 2: Extract text from PDF
        onProgress?.({
          status: 'extracting',
          progress: 25,
          message: 'Extracting text from PDF...',
          provider: 'preparing'
        });

        documentText = await extractTextFromDocument(source.file);
      } else if (source.urls && source.urls.length > 0) {
        // Multiple materials — use RAG with first materialId if available
        onProgress?.({
          status: 'extracting',
          progress: 25,
          message: `Fetching ${source.urls.length} course materials...`,
          provider: 'preparing'
        });

        // If we have materialIds, use RAG mode with the first one
        if (source.materialIds && source.materialIds.length > 0) {
          documentId = source.materialIds[0];
          // Still extract text as fallback for indexing if needed
          documentText = await extractTextFromMultipleMaterials(source.urls, source.titles || source.urls.map((_, i) => `Material ${i + 1}`));
        } else {
          documentText = await extractTextFromMultipleMaterials(source.urls, source.titles || source.urls.map((_, i) => `Material ${i + 1}`));
        }
      } else if (source.url) {
        // Single material (fallback)
        onProgress?.({
          status: 'extracting',
          progress: 25,
          message: 'Fetching course material...',
          provider: 'preparing'
        });

        const response = await fetch(source.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch material: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        if (blob.type === 'application/pdf') {
          documentText = await extractTextFromDocument(new File([blob], source.title, { type: 'application/pdf' }));
        } else {
          documentText = await blob.text();
        }
      } else {
        throw new Error('No document source provided');
      }

      if (!documentText || documentText.trim().length < 50) {
        throw new Error('Document appears to be empty or contains no extractable text. Please check the file.');
      }

      // Step 3: Try generating questions with AI (RAG mode if documentId available)
      let result: { questions: GeneratedQuestion[]; provider: string; generationTime: number; usedRAG?: boolean; retrievedChunks?: number };
      
      try {
        onProgress?.({
          status: 'generating',
          progress: 50,
          message: documentId 
            ? (config.language === 'ar' 
              ? 'البحث في المحتوى المفهرس وإنشاء الأسئلة...'
              : 'Searching indexed content and generating questions...')
            : (config.language === 'ar' 
              ? 'الذكاء الاصطناعي يقوم بتحليل المحتوى وإنشاء الأسئلة...'
              : 'AI is analyzing content and generating questions...'),
          provider: 'connecting'
        });

        result = await generateQuestionsWithAI(documentText, config, courseContext, documentId);
      } catch (genError) {
        const errorMsg = genError instanceof Error ? genError.message : String(genError);
        
        // Auto-indexing fallback: If document is not indexed, index it and retry
        if (errorMsg === 'DOCUMENT_NOT_INDEXED' && documentId && documentText) {
          onProgress?.({
            status: 'extracting',
            progress: 35,
            message: config.language === 'ar'
              ? 'جاري تحليل المستند للمرة الأولى... يرجى الانتظار'
              : 'Analyzing document for the first time... please wait.',
            provider: 'indexing'
          });

          try {
            const indexResult = await indexDocumentForRAG(documentId, documentText, config.courseId);
            console.log(`Indexed ${indexResult.chunksProcessed} chunks for document ${documentId}`);

            onProgress?.({
              status: 'extracting',
              progress: 45,
              message: config.language === 'ar'
                ? `تم فهرسة المستند (${indexResult.chunksProcessed} أجزاء). جاري إنشاء الأسئلة...`
                : `Document indexed (${indexResult.chunksProcessed} chunks). Generating questions...`,
              provider: 'indexing'
            });

            // Retry generation with RAG mode now that document is indexed
            onProgress?.({
              status: 'generating',
              progress: 55,
              message: config.language === 'ar'
                ? 'إنشاء الأسئلة من المحتوى المفهرس...'
                : 'Generating questions from indexed content...',
              provider: 'connecting'
            });

            result = await generateQuestionsWithAI(documentText, config, courseContext, documentId);
          } catch (indexOrRetryError) {
            console.warn('Auto-indexing or retry failed, falling back to legacy mode:', indexOrRetryError);
            // Fall back to legacy full-text mode (no documentId)
            onProgress?.({
              status: 'generating',
              progress: 55,
              message: config.language === 'ar'
                ? 'الذكاء الاصطناعي يقوم بتحليل المحتوى وإنشاء الأسئلة...'
                : 'AI is analyzing content and generating questions...',
              provider: 'connecting'
            });
            result = await generateQuestionsWithAI(documentText, config, courseContext);
          }
        } else {
          // Not a DOCUMENT_NOT_INDEXED error — re-throw
          throw genError;
        }
      }
      
      provider = result.provider;

      // Step 4: Complete
      const ragInfo = result.usedRAG 
        ? (config.language === 'ar' 
          ? ` (${result.retrievedChunks} أجزاء مسترجعة)` 
          : ` (${result.retrievedChunks} chunks retrieved)`)
        : '';
      
      onProgress?.({
        status: 'complete',
        progress: 100,
        message: config.language === 'ar'
          ? `تم إنشاء ${result.questions.length} سؤال باستخدام ${provider}!${ragInfo}`
          : `Generated ${result.questions.length} questions using ${provider}!${ragInfo}`,
        questions: result.questions,
        provider
      });

      return {
        questions: result.questions,
        provider
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate questions';
      
      onProgress?.({
        status: 'error',
        progress: 0,
        message: errorMessage,
        error: errorMessage,
        provider
      });
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Quick test to check which AI provider is available
   */
  async testConnection(): Promise<{ provider: string; available: boolean }> {
    try {
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          config: { questionCount: 1, difficulty: 'easy', types: ['mcq'] },
          documentText: 'Test: What is 2+2? Answer: 4'
        })
      });

      if (!response.ok) {
        return { provider: 'none', available: false };
      }

      const data = await response.json();
      return { 
        provider: data.provider || 'unknown', 
        available: data.success 
      };
    } catch {
      return { provider: 'none', available: false };
    }
  }
};
