import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export async function askStudyBuddy(prompt: string, context?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in the environment.");
    return "ERROR_API_KEY_MISSING";
  }

  // Initialize inside the function to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: context 
        ? `Context: ${context}\n\nQuestion: ${prompt}`
        : prompt,
      config: {
        systemInstruction: "You are BuddyBuild AI, a helpful university study assistant. Provide clear, concise, and academically sound explanations. Use markdown for formatting. For mathematical formulas, ALWAYS use LaTeX notation (e.g., $x^2$ for inline or $$x^2$$ for block). You can also suggest creating flashcards for key concepts to help with memorization.",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    const text = response.text;
    if (!text) {
      return "I received an empty response. Please try rephrasing your question.";
    }

    return text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const errorMessage = error?.message || "";
    if (errorMessage.includes("API key not valid") || errorMessage.includes("not found")) {
      return "ERROR_API_KEY_INVALID";
    }
    if (errorMessage.includes("quota")) {
      return "ERROR_QUOTA_EXCEEDED";
    }
    
    return `ERROR: ${errorMessage || "Connection failed"}`;
  }
}
