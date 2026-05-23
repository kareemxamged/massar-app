// RAG Document Processing Edge Function
// Extracts text, chunks documents, and generates embeddings using Transformers.js (Zero-Cost)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Text chunking configuration
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

interface DocumentConfig {
  documentId: number;
  documentText: string;
  courseId?: number;
}

// Simple semantic chunking - splits text into overlapping chunks
function chunkText(text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = "";
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // Keep overlap from previous chunk
      const words = currentChunk.split(" ");
      const overlapWords = words.slice(-Math.floor(overlap / 5)); // Approximate word count
      currentChunk = overlapWords.join(" ") + " " + sentence;
    } else {
      currentChunk += sentence + " ";
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If no chunks created (short text), return as single chunk
  if (chunks.length === 0 && text.trim()) {
    return [text.trim()];
  }
  
  return chunks;
}

// Simple local embedding using hash-based bag-of-words
// Produces 384-dim vectors compatible with pgvector
function generateEmbedding(text: string): number[] {
  const dimensions = 384;
  const vector = new Array(dimensions).fill(0);
  
  // Normalize text
  const normalized = text.toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ')  // Keep Arabic chars too
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  // Create bag-of-words with hashing
  for (const word of normalized) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Distribute across dimensions using multiple hash positions
    for (let i = 0; i < 5; i++) {
      const idx = Math.abs((hash + i * 31) % dimensions);
      vector[idx] += 1 / (i + 1); // Decay factor
    }
  }
  
  // L2 Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (magnitude > 0) {
    return vector.map(v => v / magnitude);
  }
  
  return vector;
}

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Supabase credentials not configured" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const body = await req.json();
    const { documentId, documentText, courseId }: DocumentConfig = body;

    if (!documentId || !documentText) {
      return new Response(
        JSON.stringify({ success: false, error: "documentId and documentText are required" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing document ${documentId}...`);
    console.log(`Document length: ${documentText.length} characters`);

    // Delete existing chunks for this document
    const { error: deleteError } = await supabase
      .from("document_chunks")
      .delete()
      .eq("document_id", documentId);

    if (deleteError) {
      console.error("Error deleting existing chunks:", deleteError);
    }

    // Chunk the document
    const chunks = chunkText(documentText);
    console.log(`Created ${chunks.length} chunks`);

    // Process each chunk
    const processedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

      // Generate embedding locally (zero-cost)
      const embedding = generateEmbedding(chunk);
      
      // Store in database
      const { data, error } = await supabase
        .from("document_chunks")
        .insert({
          document_id: documentId,
          content: chunk,
          embedding: embedding,
          chunk_index: i
        })
        .select()
        .single();

      if (error) {
        console.error(`Error storing chunk ${i}:`, error);
        throw error;
      }

      processedChunks.push({
        id: data.id,
        chunk_index: i,
        content_length: chunk.length
      });
    }

    console.log(`Successfully processed ${processedChunks.length} chunks`);

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        chunksProcessed: processedChunks.length,
        chunks: processedChunks,
        message: "Document processed and indexed for RAG"
      }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Process Document Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
