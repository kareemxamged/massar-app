// Supabase Edge Function - RAG-Powered Question Generation
// Uses vector similarity search to retrieve relevant context chunks

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface GenerationConfig {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  types: string[];
  documentText: string;
  documentId?: number;  // For RAG mode - use vector search instead of full text
  courseContext?: string;
  language: 'ar' | 'en';
}

// Simple local embedding (same algorithm as process-document)
function generateEmbedding(text: string): number[] {
  const dimensions = 384;
  const vector = new Array(dimensions).fill(0);
  
  const normalized = text.toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  for (const word of normalized) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    
    for (let i = 0; i < 5; i++) {
      const idx = Math.abs((hash + i * 31) % dimensions);
      vector[idx] += 1 / (i + 1);
    }
  }
  
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (magnitude > 0) {
    return vector.map(v => v / magnitude);
  }
  
  return vector;
}

// OpenRouter Configuration - Primary AI Provider with Fallback Models
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'google/gemini-2.0-flash-lite-preview-02-05:free',
  'mistralai/mistral-nemo:free'
];

// Gemini Models - Fallback Tier 3
const GEMINI_MODELS = [
  { name: 'gemini-2.0-flash', display: 'Gemini 2.0 Flash' },
  { name: 'gemini-2.0-flash-lite', display: 'Gemini 2.0 Flash Lite' }
];

// PROFESSIONAL ACADEMIC EXAMINER PROMPTS
const SYSTEM_PROMPT_EN = `You are an elite Academic Examiner and Curriculum Specialist. Your goal is to generate high-quality examination questions based strictly on the pedagogical content of the provided documents.

Operational Guidelines:

1. Deep Content Analysis:
   - You must perform a deep semantic analysis of the text.
   - Focus on theories, facts, definitions, and logical relationships within the curriculum.
   - Ignore all technical PDF metadata, object references (e.g., "obj 0", "stream"), and structural markers.

2. Strict Output Constraints (No Document References):
   - NEVER use phrases like "According to the document," "In the provided text," "As shown in image X," or "Refer to object 6."
   - NEVER mention images, figures, or diagrams found in the PDF, as the student will not see them.
   - The question must stand alone as if it were part of a formal national exam.

3. Difficulty Scaling:
   - You must adhere strictly to the difficulty level specified in the request (Easy, Medium, Hard).
   - Easy: Focus on direct recall and basic definitions.
   - Medium: Focus on application and understanding of concepts.
   - Hard: Focus on synthesis, critical thinking, and complex problem-solving based on the material.

4. Language & Formatting:
   - Generate questions in the same language as the input material (Arabic/English).
   - Ensure "Multiple Choice" options are plausible and academically sound (no obvious or silly distractors).
   - For "True/False", ensure the statement is clear and tests a factual point from the curriculum.

5. Anti-Hallucination Rule:
   - If a specific piece of information is not present in the text, do not invent it.
   - If the PDF is unreadable or contains only technical metadata, return an error: "INSUFFICIENT_PEDAGOGICAL_CONTENT".

6. CRITICAL JSON OUTPUT RULE:
   - You must respond with ONLY valid JSON. Do not include introductory text, explanations, markdown code blocks, or any text outside the JSON array.
   - Start immediately with '[' and end with ']'. No text before or after.`;

const SYSTEM_PROMPT_AR = `أنت أخصائي امتحانات أكاديمي وخبير في المناهج الدراسية. هدفك هو إنشاء أسئلة امتحان عالية الجودة بناءً بشكل صارم على المحتوى التربوي للمستندات المقدمة.

إرشادات التشغيل:

1. التحليل العميق للمحتوى:
   - يجب إجراء تحليل دلالي عميق للنص.
   - ركز على النظريات والحقائق والتعريفات والعلاقات المنطقية داخل المنهج.
   - تجاهل جميع البيانات الوصفية التقنية لـ PDF، والإشارات إلى الكائنات (مثل "obj 0"، "stream")، والعلامات الهيكلية.

2. قيود صارمة على المخرجات (بدون إشارات للمستند):
   - ممنوع استخدام عبارات مثل "حسب المستند"، "في النص المقدم"، "كما هو موضح في الصورة"، أو "انظر إلى الكائن 6".
   - ممنوع ذكر الصور أو الأشكال أو الرسوم البيانية الموجودة في PDF، لأن الطالب لن يراها.
   - يجب أن يكون السؤال مستقلاً بذاته كما لو كان جزءاً من امتحان وطني رسمي.

3. تدرج الصعوبة:
   - يجب الالتزام الصارم بمستوى الصعوبة المحدد في الطلب (سهل، متوسط، صعب).
   - سهل: ركز على الاسترجاع المباشر والتعريفات الأساسية.
   - متوسط: ركز على التطبيق والفهم للمفاهيم.
   - صعب: ركز على التركيب والتفكير النقدي وحل المشكلات المعقدة بناءً على المادة.

4. اللغة والتنسيق:
   - أنشئ أسئلة بنفس لغة المادة المدخلة (العربية/الإنجليزية).
   - تأكد من أن خيارات "الاختيار من متعدد" معقولة وصحيحة أكاديمياً (لا خيارات خاطئة سخيفة أو واضحة).
   - لـ "صح/خطأ"، تأكد من أن العبارة واضحة وترتكز على نقطة واقعية من المنهج.

5. قاعدة منع الهلوسة:
   - إذا لم تكن معلومة محددة موجودة في النص، لا تخترعها.
   - إذا كان PDF غير مقروء أو يحتوي فقط على بيانات وصفية تقنية، أعد خطأ: "INSUFFICIENT_PEDAGOGICAL_CONTENT".

6. قاعدة إخراج JSON (مهمة جداً):
   - يجب أن ترد فقط بـ JSON صالح. لا تكتب مقدمات أو شرحًا أو كتل markdown.
   - ابدأ مباشرة بـ '[' وانهي بـ ']'. لا نص قبل أو بعد.`;

function buildPrompt(config: GenerationConfig): string {
  const isArabic = config.language === 'ar';
  const systemPrompt = isArabic ? SYSTEM_PROMPT_AR : SYSTEM_PROMPT_EN;
  
  const typeDescriptions: Record<string, string> = {
    mcq: isArabic ? 'أسئلة اختيار من متعدد (4 خيارات)' : 'Multiple Choice Questions (4 options)',
    true_false: isArabic ? 'أسئلة صح/خطأ' : 'True/False Questions',
    essay: isArabic ? 'أسئلة مقالية/موضوعية' : 'Essay/Written Response Questions',
    short_answer: isArabic ? 'أسئلة إجابة قصيرة' : 'Short Answer Questions'
  };

  // Chunk the document text if too long (keep first 15000 chars for best results)
  const maxChars = 15000;
  const documentChunk = config.documentText.substring(0, maxChars);
  const wasTruncated = config.documentText.length > maxChars;

  return `${systemPrompt}

========================================
EXTRACTION CONTEXT
========================================
${wasTruncated ? `NOTE: Document was truncated to ${maxChars} characters for optimal processing.\n` : ''}${config.courseContext ? `Course Context: ${config.courseContext}\n` : ''}
========================================
CURRICULUM CONTENT FOR ANALYSIS
========================================
"""
${documentChunk}
"""
========================================

CURRENT TASK
========================================
Generate ${config.questionCount} questions of type: ${config.types.map(t => typeDescriptions[t]).join(', ')}
Difficulty Level: ${config.difficulty.toUpperCase()}
Target Language: ${isArabic ? 'Arabic (العربية)' : 'English'}

========================================
RESPONSE FORMAT (VALID JSON ONLY)
========================================
[
  {
    "text": "The examination question based strictly on curriculum content",
    "type": "mcq|true_false|essay|short_answer",
    "options": ${isArabic ? '["أ) ...", "ب) ...", "ج) ...", "د) ..."]' : '["A) ...", "B) ...", "C) ...", "D) ..."]'},
    "correct_answer": "The exact correct answer",
    "explanation": "Brief academic explanation of why this is correct",
    "marks": 1
  }
]

REMEMBER:
- NO references to "the document" or "the text"
- Standalone questions as in a national exam
- Strict adherence to ${config.difficulty} difficulty level
- If content is insufficient, return: "INSUFFICIENT_PEDAGOGICAL_CONTENT"
- CRITICAL: Return ONLY raw JSON array. No markdown, no explanations, no text outside JSON.

BEGIN GENERATION NOW.`;
}

function parseQuestions(raw: string, language: 'ar' | 'en') {
  try {
    // First, try to extract JSON from markdown code blocks
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let jsonStr: string;
    
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      // Try to find JSON array directly
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      jsonStr = jsonMatch ? jsonMatch[0] : raw;
    }
    
    // Try to find the outermost array if there are nested structures
    const outerArrayMatch = jsonStr.match(/\[[\s\S]*\]$/);
    if (outerArrayMatch) {
      jsonStr = outerArrayMatch[0];
    }
    
    console.log('Attempting to parse JSON:', jsonStr.substring(0, 200) + '...');
    
    const questions = JSON.parse(jsonStr);
    
    if (!Array.isArray(questions)) {
      throw new Error('Parsed result is not an array');
    }
    
    console.log(`Successfully parsed ${questions.length} questions`);
    
    // Validate and filter out generic questions
    const genericPatterns = language === 'ar' 
      ? [/المفهوم الرئيسي/, /المستند/, /النص/, /بشكل عام/, /يناقش.*المستند/, /حسب.*المستند/]
      : [/main concept/i, /document discusses/i, /the text/i, /according to the document/i, /what is discussed/i, /the document/i];
    
    return questions.map((q: any, i: number) => {
      const text = q.text || (language === 'ar' ? `سؤال ${i + 1}` : `Question ${i + 1}`);
      
      // Check if question is too generic
      const isGeneric = genericPatterns.some(pattern => pattern.test(text));
      if (isGeneric) {
        console.warn(`Warning: Generic question detected: ${text.substring(0, 50)}...`);
      }
      
      return {
        text,
        type: (q.type || 'mcq').toLowerCase(),
        options: q.options || (q.type === 'mcq' ? 
          (language === 'ar' ? ['أ)', 'ب)', 'ج)', 'د)'] : ['A)', 'B)', 'C)', 'D)']) : 
          undefined),
        correct_answer: q.correct_answer || q.correctAnswer || '',
        explanation: q.explanation || '',
        marks: parseInt(q.marks) || 1
      };
    });
  } catch (error) {
    console.error('Parse error. Raw response:', raw.substring(0, 500));
    console.error('Error details:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown parsing error';
    throw new Error(`Failed to parse generated questions: ${errorMsg}`);
  }
}

async function callGemini(prompt: string, model: string): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY environment variable is not set!');
    throw new Error('GEMINI_API_KEY not configured in environment variables');
  }
  
  // Log first 10 chars of key for debugging (don't log full key for security)
  console.log(`Using API key starting with: ${apiKey.substring(0, 10)}...`);
  console.log(`Calling model: ${model}`);
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  console.log(`Request URL: ${url.substring(0, 80)}...`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ 
        role: 'user',
        parts: [{ text: prompt }] 
      }],
      generationConfig: { 
        temperature: 0.3,
        maxOutputTokens: 8000,
        topP: 0.8
      }
    })
  });
  
  console.log(`Response status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error for ${model}: ${response.status} - ${errorText}`);
    throw new Error(`${model}: HTTP ${response.status} - ${errorText.substring(0, 100)}`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    console.error(`API returned error for ${model}:`, data.error);
    throw new Error(`${model}: ${data.error.message || 'Unknown API error'}`);
  }
  
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log(`Successfully got response from ${model}, length: ${text.length}`);
  return text;
}

async function callDeepSeek(prompt: string): Promise<string> {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set');
  
  console.log(`Using DeepSeek API...`);
  
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 8000
    })
  });
  
  console.log(`DeepSeek response status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`DeepSeek API Error: ${response.status} - ${errorText}`);
    throw new Error(`DeepSeek: HTTP ${response.status} - ${errorText.substring(0, 100)}`);
  }
  
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  console.log(`DeepSeek response length: ${text.length}`);
  return text;
}

// OpenRouter API Call with Model Fallback
async function callOpenRouter(prompt: string): Promise<{text: string, modelName: string}> {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!apiKey) {
    console.error('ERROR: OPENROUTER_API_KEY environment variable is not set!');
    throw new Error('OPENROUTER_API_KEY not configured in environment variables');
  }
  
  console.log(`Using OpenRouter API key starting with: ${apiKey.substring(0, 10)}...`);
  
  // Try each model in the fallback array
  for (const model of OPENROUTER_FREE_MODELS) {
    console.log(`Trying OpenRouter model: ${model}`);
    
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://exam-management-system.com',
          'X-Title': 'AI Question Generator'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: 'You are an expert academic examiner. Always respond with valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 8000
        })
      });
      
      console.log(`OpenRouter response status for ${model}: ${response.status}`);
      
      // Handle rate limiting or upstream errors - retry with next model
      if (response.status === 429 || response.status === 502 || response.status === 503) {
        const errorBody = await response.text();
        console.error(`❌ OpenRouter Model ${model} failed. Status: ${response.status}, Body: ${errorBody}`);
        console.warn(`⚠️ OpenRouter ${model} rate limited or unavailable (${response.status}): ${errorBody.substring(0, 200)}`);
        console.log(`→ Falling back to next model...`);
        continue; // Try next model in array
      }
      
      // Handle payload too large (413) or context length exceeded (400) - throw immediately
      if (response.status === 413) {
        const errorBody = await response.text();
        console.error(`❌ OpenRouter Model ${model} failed. Status: ${response.status}, Body: ${errorBody}`);
        throw new Error("PDF content is too large for the free AI models. Please upload a smaller document.");
      }
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`❌ OpenRouter Model ${model} failed. Status: ${response.status}, Body: ${errorBody}`);
        
        // Check for context length exceeded in error body
        if (errorBody.toLowerCase().includes('context length') || 
            errorBody.toLowerCase().includes('token limit') ||
            errorBody.toLowerCase().includes('too large')) {
          throw new Error("PDF content is too large for the free AI models. Please upload a smaller document.");
        }
        
        console.error(`OpenRouter API Error for ${model}: ${response.status} - ${errorBody.substring(0, 300)}`);
        // For non-rate-limit errors, still try next model as fallback
        continue;
      }
      
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      
      if (text && text.length > 50) {
        console.log(`✓ OpenRouter ${model} succeeded - response length: ${text.length}`);
        return { text, modelName: model };
      } else {
        console.warn(`⚠️ OpenRouter ${model} returned empty/short response`);
        console.error(`❌ OpenRouter Model ${model} failed. Status: EMPTY_RESPONSE, Body: Response was empty or too short (${text.length} chars)`);
        continue;
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ OpenRouter Model ${model} failed. Status: EXCEPTION, Body: ${errorMsg}`);
      
      // If it's the payload too large error, re-throw immediately
      if (errorMsg.includes('PDF content is too large')) {
        throw error;
      }
      
      continue; // Try next model
    }
  }
  
  // All OpenRouter models failed
  throw new Error(`All OpenRouter models failed: ${OPENROUTER_FREE_MODELS.join(', ')}`);
}

async function tryAllModels(prompt: string): Promise<{text: string, model: string}> {
  const errors: string[] = [];
  
  // Tier 1: Try OpenRouter with model fallback
  try {
    console.log('Trying OpenRouter with model fallback...');
    const result = await callOpenRouter(prompt);
    if (result.text && result.text.length > 100) {
      const displayName = result.modelName.includes('llama') ? 'Llama 3.3 70B' :
                         result.modelName.includes('qwen') ? 'Qwen 2.5 72B' :
                         result.modelName.includes('gemini') ? 'Gemini 2.0 Flash Lite' :
                         result.modelName.includes('mistral') ? 'Mistral Nemo' : 'OpenRouter Model';
      console.log(`✓ OpenRouter succeeded with: ${displayName}`);
      return { text: result.text, model: `${displayName} (OpenRouter)` };
    }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    console.log(`✗ All OpenRouter models failed: ${errorMsg}`);
    errors.push(`OpenRouter: ${errorMsg}`);
  }
  
  // Tier 2: Try DeepSeek
  try {
    console.log('Trying DeepSeek...');
    const text = await callDeepSeek(prompt);
    if (text && text.length > 100) {
      console.log('✓ DeepSeek succeeded');
      return { text, model: 'DeepSeek Chat' };
    }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    console.log(`✗ DeepSeek failed: ${errorMsg}`);
    errors.push(`DeepSeek: ${errorMsg}`);
  }
  
  // Tier 3: Fallback to Gemini models
  for (const m of GEMINI_MODELS) {
    try {
      console.log(`Trying ${m.display}...`);
      const text = await callGemini(prompt, m.name);
      if (text && text.length > 100) {
        console.log(`✓ ${m.display} succeeded`);
        return { text, model: m.display };
      } else {
        errors.push(`${m.display}: Empty or short response`);
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      console.log(`✗ ${m.display} failed: ${errorMsg}`);
      errors.push(`${m.display}: ${errorMsg}`);
    }
  }
  
  const errorSummary = errors.join(' | ');
  console.error('All models failed:', errorSummary);
  
  // Parse specific error codes for better user messaging
  const hasInsufficientBalance = errors.some(e => e.includes('402') || e.includes('Insufficient Balance'));
  const hasQuotaExceeded = errors.some(e => e.includes('429') || e.includes('quota') || e.includes('Quota exceeded'));
  const hasNotFound = errors.some(e => e.includes('404') || e.includes('not found'));
  
  let specificError = '';
  if (hasInsufficientBalance) {
    specificError = 'API Error: Insufficient Balance in Provider Account (e.g., DeepSeek). Please check your billing status.';
  } else if (hasQuotaExceeded) {
    specificError = 'API Error: Rate limit or Quota exceeded (e.g., Gemini). Please wait 24 hours or upgrade your plan.';
  } else if (hasNotFound) {
    specificError = 'API Error: AI models not available. Please verify model names or API configuration.';
  } else {
    specificError = `AI service unavailable. Tried OpenRouter (Llama 3.3) + DeepSeek + ${GEMINI_MODELS.length} Gemini models.`;
  }
  
  throw new Error(`${specificError} Details: ${errorSummary.substring(0, 300)}`);
}

Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    // Check API keys availability first
    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    
    console.log('API Keys check:');
    console.log(`- OPENROUTER_API_KEY: ${openrouterKey ? 'SET (starts with ' + openrouterKey.substring(0, 10) + '...)' : 'NOT SET'}`);
    console.log(`- DEEPSEEK_API_KEY: ${deepseekKey ? 'SET (starts with ' + deepseekKey.substring(0, 8) + '...)' : 'NOT SET'}`);
    console.log(`- GEMINI_API_KEY: ${geminiKey ? 'SET (starts with ' + geminiKey.substring(0, 8) + '...)' : 'NOT SET'}`);
    
    if (!openrouterKey && !deepseekKey && !geminiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No AI API keys configured. Please add OPENROUTER_API_KEY (primary), DEEPSEEK_API_KEY, or GEMINI_API_KEY to Edge Function secrets.' 
        }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
    
    const body = await req.json();
    const { config, documentText, documentId } = body;

    let contextText = documentText;
    let usedRAG = false;
    let retrievedChunks = 0;

    // RAG Mode: Use vector similarity search if documentId is provided
    if (documentId && !documentText) {
      console.log(`RAG Mode: Retrieving relevant chunks for document ${documentId}`);
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Check if document has been indexed (has chunks)
        const { count: chunkCount, error: countError } = await supabase
          .from("document_chunks")
          .select("*", { count: "exact", head: true })
          .eq("document_id", documentId);
        
        if (countError) {
          console.error("RAG chunk count error:", countError);
        }
        
        if (chunkCount === 0) {
          console.log(`RAG: Document ${documentId} not indexed. Returning specific error code.`);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Document not yet indexed for AI search. Please index it first.',
              errorCode: 'DOCUMENT_NOT_INDEXED',
              documentId
            }),
            { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
          );
        }
        
        // Generate embedding for the query using course context + question types for better relevance
        const queryText = `${config?.courseContext || ''} ${config?.difficulty || 'medium'} difficulty ${config?.types?.join(' ') || 'mcq'} exam questions`.trim();
        const queryEmbedding = generateEmbedding(queryText || "generate exam questions");
        
        // Call match_document_chunks RPC
        const { data: chunks, error } = await supabase.rpc("match_document_chunks", {
          query_embedding: queryEmbedding,
          match_threshold: 0.3,
          match_count: 7,
          p_document_id: documentId
        });
        
        if (error) {
          console.error("RAG retrieval error:", error);
        } else if (chunks && chunks.length > 0) {
          contextText = chunks.map((c: Record<string, unknown>) => c.content as string).join("\n\n---\n\n");
          usedRAG = true;
          retrievedChunks = chunks.length;
          console.log(`RAG: Retrieved ${chunks.length} relevant chunks (total chars: ${contextText.length})`);
        } else {
          console.log("RAG: No chunks matched threshold, falling back to all chunks for document");
          // Fallback: get all chunks for this document (lower threshold)
          const { data: allChunks, error: allError } = await supabase
            .from("document_chunks")
            .select("content")
            .eq("document_id", documentId)
            .order("chunk_index", { ascending: true })
            .limit(7);
          
          if (!allError && allChunks && allChunks.length > 0) {
            contextText = allChunks.map((c: Record<string, unknown>) => c.content as string).join("\n\n---\n\n");
            usedRAG = true;
            retrievedChunks = allChunks.length;
            console.log(`RAG fallback: Using ${allChunks.length} chunks without threshold`);
          }
        }
      }
    }

    // Fallback: Check if we have enough context
    if (!contextText || contextText.trim().length < 100) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: usedRAG 
            ? 'Document indexed but no relevant content found. The document may be too short or contain only metadata.'
            : 'Document text is too short or empty. Please provide a valid document with substantial content.',
          errorCode: usedRAG ? 'RAG_NO_CONTENT' : 'TEXT_TOO_SHORT'
        }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
    
    const cfg: GenerationConfig = {
      questionCount: config?.questionCount || 5,
      difficulty: config?.difficulty || 'medium',
      types: config?.types || ['mcq'],
      documentText: contextText,
      documentId: documentId,
      language: config?.language || 'en',
      courseContext: body.courseContext
    };
    
    console.log(`Generating ${cfg.questionCount} questions in ${cfg.language} from ${usedRAG ? retrievedChunks + ' RAG chunks' : contextText.length + ' chars'}`);
    
    const prompt = buildPrompt(cfg);
    const start = Date.now();
    
    // Try AI models (DeepSeek first, then Gemini)
    let result: { text: string; provider: string };
    try {
      const aiResult = await tryAllModels(prompt);
      result = { text: aiResult.text, provider: aiResult.model };
    } catch (aiError) {
      const aiErrorMsg = aiError instanceof Error ? aiError.message : String(aiError);
      console.error('All AI models failed:', aiErrorMsg);
      
      // Determine specific error code for frontend
      let errorCode = 'AI_UNAVAILABLE';
      if (aiErrorMsg.includes('Insufficient Balance')) errorCode = 'INSUFFICIENT_BALANCE';
      else if (aiErrorMsg.includes('Quota exceeded') || aiErrorMsg.includes('429')) errorCode = 'QUOTA_EXCEEDED';
      else if (aiErrorMsg.includes('too large') || aiErrorMsg.includes('413')) errorCode = 'PAYLOAD_TOO_LARGE';
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'AI service temporarily unavailable. Please try again in a moment.',
          errorCode,
          errorDetail: aiErrorMsg.substring(0, 200)
        }),
        { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
    
    const questions = parseQuestions(result.text, cfg.language);
    
    // Validate we got questions
    if (questions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No questions could be generated from the document content.' 
        }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`✓ Generated ${questions.length} questions using ${result.provider} in ${Date.now() - start}ms`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        provider: result.provider, 
        generationTime: Date.now() - start, 
        questions,
        count: questions.length,
        documentLength: contextText.length,
        usedRAG,
        retrievedChunks: usedRAG ? retrievedChunks : undefined
      }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    );
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Edge Function Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});
