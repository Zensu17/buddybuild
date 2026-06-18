import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  promptTokens?: number;
  candidatesTokens?: number;
  totalTokens?: number;
}

export interface GeminiResponse {
  reply: string;
  tokens?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardSetResponse {
  title: string;
  course: string;
  cards: Flashcard[];
}

/**
 * Handles communication with Gemini API for Study Buddy chat requests
 */
export async function askStudyBuddy(prompt: string, context?: string): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[GeminiService] GEMINI_API_KEY is not defined in the environment.");
    return { reply: "ERROR_API_KEY_MISSING" };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt,
      config: {
        systemInstruction: "Anda adalah BuddyBuild AI, asisten belajar universitas yang serba bisa, netral, dan objektif. Tugas Anda adalah membantu mahasiswa dari berbagai disiplin ilmu secara seimbang.\n\nPENTING:\n1. Selalu berikan penjelasan secara terstruktur dalam format Langkah-demi-Langkah (Step-by-Step) yang sangat jelas, terperinci, dan mudah dipahami oleh mahasiswa.\n2. Di bagian akhir dari setiap jawaban Anda, Anda WAJIB menambahkan bagian penutup khusus berjudul '💡 Tips Belajar BuddyBuild:' yang berisi tips belajar singkat, relevan, praktis, atau teknik mnemonic khusus berdasarkan topik yang ditanyakan untuk membantu mahasiswa menguasai konsep tersebut lebih cepat.\n\nSelalu tanggapi dengan ramah dan gunakan bahasa Indonesia yang baik jika pertanyaan diketik dalam bahasa Indonesia. Gunakan format markdown untuk estetika teks yang rapi.",
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    const text = response.text || "I received an empty response. Please try rephrasing your question.";
    return {
      reply: text,
      tokens: response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount || 0,
        candidatesTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0
      } : undefined
    };
  } catch (error: any) {
    console.error("[GeminiService] StudyBuddy AI generation failed:", error);
    const errorMessage = error?.message || "";
    if (errorMessage.includes("API key not valid") || errorMessage.includes("not found")) {
      return { reply: "ERROR_API_KEY_INVALID" };
    }
    if (errorMessage.includes("quota")) {
      return { reply: "ERROR_QUOTA_EXCEEDED" };
    }
    return { reply: `ERROR: ${errorMessage || "Connection failed"}` };
  }
}

/**
 * Generates a structured set of study flashcards using Gemini API
 */
export async function generateFlashcardSet(topic: string, course: string): Promise<FlashcardSetResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[GeminiService] GEMINI_API_KEY is not defined in the environment.");
    throw new Error("ERROR_API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Buatkan set flashcard interaktif belajar tentang topik: "${topic}" untuk mata kuliah: "${course}". Hasilkan tepat 6 kartu flashcard berkualitas tinggi yang mencakup konsep penting, definisi, atau pertanyaan kritis.`,
      config: {
        systemInstruction: `Anda adalah mesin pembuat flashcards otomatis. Anda wajib merespons HANYA dengan objek JSON valid tanpa markdown block (\`\`\`json). Format output harus tepat seperti ini:
        {
          "title": "Judul Set Flashcard yang menarik",
          "course": "Kode/Nama Mata Kuliah",
          "cards": [
            {
              "front": "Pertanyaan atau istilah kunci di bagian depan kartu",
              "back": "Penjelasan ringkas, definisi, atau jawaban di bagian belakang kartu"
            }
          ]
        }`,
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Sistem AI mengembalikan respons kosong.");
    }

    try {
      const parsed = JSON.parse(text);
      validateFlashcardData(parsed);
      return parsed;
    } catch (e) {
      console.warn("[GeminiService] JSON parsing failed, attempting cleanup of AI response text.");
      const cleaned = text.replace(/```json\s?|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      validateFlashcardData(parsed);
      return parsed;
    }
  } catch (error: any) {
    console.error("[GeminiService] Flashcard generation failed:", error);
    throw error;
  }
}

/**
 * Validates the schema of the generated flashcard set to ensure client compatibility
 */
function validateFlashcardData(data: any): void {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid response format: response must be an object");
  }
  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error("Invalid response format: title must be a non-empty string");
  }
  if (typeof data.course !== "string" || !data.course.trim()) {
    throw new Error("Invalid response format: course must be a non-empty string");
  }
  if (!Array.isArray(data.cards) || data.cards.length === 0) {
    throw new Error("Invalid response format: cards must be a non-empty array");
  }
  for (const card of data.cards) {
    if (typeof card.front !== "string" || !card.front.trim()) {
      throw new Error("Invalid response format: card front side must be a non-empty string");
    }
    if (typeof card.back !== "string" || !card.back.trim()) {
      throw new Error("Invalid response format: card back side must be a non-empty string");
    }
  }
}
