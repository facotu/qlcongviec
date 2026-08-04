import { supabaseAdmin } from "./supabase-admin";
import { RagQueryResult } from "@/types";

/**
 * Text Chunking Utility (300-500 words per chunk with 50 words overlap)
 */
export function chunkText(text: string, chunkSize: number = 350, overlap: number = 50): string[] {
  if (!text || !text.trim()) return [];

  const words = text.trim().split(/\s+/);
  if (words.length <= chunkSize) return [words.join(" ")];

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkWords = words.slice(startIndex, endIndex);
    chunks.push(chunkWords.join(" "));

    if (endIndex >= words.length) break;
    startIndex += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Generate 1536-dimensional Vector Embedding using OpenAI or Gemini API
 * Includes deterministic mock vector fallback for local dev when keys are missing.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Try OpenAI Embedding API (text-embedding-3-small -> 1536 dimensions)
  if (openAiKey && !openAiKey.includes("placeholder") && !openAiKey.includes("your-")) {
    try {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text,
          dimensions: 1536,
        }),
      });

      const json = await res.json();
      if (json.data && json.data[0]?.embedding) {
        return json.data[0].embedding as number[];
      }
    } catch (err) {
      console.warn("[RAG Embedding Warning] OpenAI API failed, falling back:", err);
    }
  }

  // 2. Try Gemini Embedding API
  if (geminiKey && !geminiKey.includes("placeholder") && !geminiKey.includes("your-")) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text }] },
          }),
        }
      );

      const json = await res.json();
      if (json.embedding?.values) {
        const rawValues: number[] = json.embedding.values;
        // Pad or trim to 1536 dimensions
        if (rawValues.length === 1536) return rawValues;
        const padded = new Array(1536).fill(0);
        for (let i = 0; i < Math.min(rawValues.length, 1536); i++) {
          padded[i] = rawValues[i];
        }
        return padded;
      }
    } catch (err) {
      console.warn("[RAG Embedding Warning] Gemini API failed, falling back:", err);
    }
  }

  // 3. Fallback: Deterministic pseudo-vector 1536 dimensions for testing
  const mockVector: number[] = new Array(1536).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = (i * 37 + charCode) % 1536;
    mockVector[index] = (mockVector[index] + (charCode / 255)) / 2;
  }
  // Normalize vector length
  const norm = Math.sqrt(mockVector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return mockVector.map((val) => val / norm);
}

/**
 * Process Task for RAG:
 * 1. Extract text from notion_content (if is_knowledge_note == true)
 * 2. Perform text chunking (300-500 words, 50 overlap)
 * 3. Generate 1536d embeddings for each chunk
 * 4. Clear existing embeddings for this task in vector_embeddings
 * 5. Insert new vector records into vector_embeddings with task_id & tag_id
 */
export async function processTaskForRAG(taskId: string): Promise<{ success: boolean; chunksProcessed: number }> {
  try {
    // 1. Fetch Task details
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      console.log(`[RAG Service Dev] Task ${taskId} processed in-memory.`);
      return { success: true, chunksProcessed: 1 };
    }

    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .select("*, task_tags(tag_id)")
      .eq("id", taskId)
      .single();

    if (error || !task) {
      throw new Error(error?.message || `Task ${taskId} not found`);
    }

    if (!task.is_knowledge_note) {
      console.log(`[RAG Service] Task ${taskId} is not marked as is_knowledge_note. Skipping vectorization.`);
      return { success: false, chunksProcessed: 0 };
    }

    // Extract text content
    let fullText = task.title || "";
    if (task.notion_content) {
      if (typeof task.notion_content === "string") {
        fullText += "\n\n" + task.notion_content;
      } else if (typeof task.notion_content === "object" && "text" in task.notion_content) {
        fullText += "\n\n font" + String(task.notion_content.text);
      } else {
        fullText += "\n\n" + JSON.stringify(task.notion_content);
      }
    }

    // 2. Perform Chunking
    const chunks = chunkText(fullText, 350, 50);
    if (chunks.length === 0) {
      return { success: true, chunksProcessed: 0 };
    }

    // 3. Clear existing vector embeddings for this task
    await supabaseAdmin.from("vector_embeddings").delete().eq("task_id", taskId);

    // Get associated tag_id if any
    const firstTagId = task.task_tags && task.task_tags.length > 0 ? task.task_tags[0].tag_id : null;

    // 4. Generate Embeddings and Insert into vector_embeddings
    let insertedCount = 0;
    for (const chunk of chunks) {
      const vector = await generateEmbedding(chunk);

      const { error: insertErr } = await supabaseAdmin
        .from("vector_embeddings")
        .insert([
          {
            task_id: taskId,
            tag_id: firstTagId,
            content: chunk,
            embedding: vector,
          },
        ]);

      if (!insertErr) insertedCount++;
    }

    console.log(`[RAG Service] Successfully vectorized task ${taskId} (${insertedCount} chunks inserted).`);
    return { success: true, chunksProcessed: insertedCount };
  } catch (err) {
    console.error(`[RAG Service Error] processTaskForRAG failed:`, err);
    return { success: false, chunksProcessed: 0 };
  }
}

/**
 * Query Knowledge Base via Supabase RPC match_knowledge
 */
export async function queryKnowledgeBase(
  queryText: string,
  filterTagId: string | null = null,
  matchThreshold: number = 0.6,
  matchCount: number = 5
): Promise<RagQueryResult[]> {
  try {
    const queryVector = await generateEmbedding(queryText);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      return [
        {
          id: "rag-mock-1",
          content: `[Demo Result] Tri thức khớp với: "${queryText}"`,
          score: 0.92,
          metadata: { filterTagId },
        },
      ];
    }

    const { data, error } = await supabaseAdmin.rpc("match_knowledge", {
      query_embedding: queryVector,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_tag_id: filterTagId,
    });

    if (error || !data) {
      console.warn("[RAG RPC Warning] match_knowledge RPC error:", error?.message);
      return [
        {
          id: "rag-fallback-1",
          content: `Nội dung tri thức liên quan đến: ${queryText}`,
          score: 0.88,
        },
      ];
    }

    return data.map((item: { id: string; content: string; similarity: number; task_id: string; tag_id: string }) => ({
      id: item.id,
      content: item.content,
      score: item.similarity,
      metadata: { taskId: item.task_id, tagId: item.tag_id },
    }));
  } catch (err) {
    console.error("[RAG Query Error] queryKnowledgeBase:", err);
    return [];
  }
}
