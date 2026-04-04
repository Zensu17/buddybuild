import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askStudyBuddy(prompt: string, context?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: context 
        ? `Context: ${context}\n\nQuestion: ${prompt}`
        : prompt,
      config: {
        systemInstruction: "You are a helpful university study assistant. Provide clear, concise, and academically sound explanations. Use markdown for formatting.",
      },
    });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to your study buddy. Please check your connection.";
  }
}
