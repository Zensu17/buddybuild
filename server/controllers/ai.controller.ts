import { Request, Response, NextFunction } from "express";
import { askStudyBuddy, generateFlashcardSet } from "../services/gemini.service";

/**
 * Endpoint controller for AI Study Buddy responses
 */
export async function handleStudyBuddy(req: Request, res: Response, next: NextFunction) {
  const { prompt, context } = req.body;
  
  try {
    console.log(`[AIController] Generating response for Study Buddy. Prompt length: ${prompt?.length || 0}`);
    const result = await askStudyBuddy(prompt, context);
    
    // Check if the reply is a known configuration error or quota error
    if (result.reply === "ERROR_API_KEY_MISSING") {
      res.status(500).json({
        success: false,
        error: "Configuration error: GEMINI_API_KEY environment variable is not defined on the server.",
        code: "API_KEY_MISSING"
      });
      return;
    }
    
    if (result.reply === "ERROR_API_KEY_INVALID") {
      res.status(401).json({
        success: false,
        error: "Authentication error: The configured GEMINI_API_KEY is invalid.",
        code: "API_KEY_INVALID"
      });
      return;
    }

    if (result.reply === "ERROR_QUOTA_EXCEEDED") {
      res.status(429).json({
        success: false,
        error: "Rate limit error: Gemini API quota exceeded. Please try again later.",
        code: "QUOTA_EXCEEDED"
      });
      return;
    }

    if (result.reply.startsWith("ERROR:")) {
      res.status(502).json({
        success: false,
        error: `AI Service error: ${result.reply.replace("ERROR:", "").trim()}`,
        code: "AI_SERVICE_ERROR"
      });
      return;
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error("[AIController] Study Buddy error:", error);
    next(error);
  }
}

/**
 * Endpoint controller for AI Flashcard generation
 */
export async function handleGenerateFlashcards(req: Request, res: Response, next: NextFunction) {
  const { topic, course } = req.body;

  try {
    console.log(`[AIController] Generating flashcards. Topic: "${topic}", Course: "${course}"`);
    const result = await generateFlashcardSet(topic, course);
    
    res.json({
      success: true,
      count: result.cards?.length || 0,
      data: result
    });
  } catch (error: any) {
    console.error("[AIController] Flashcard generator error:", error);

    // Provide helpful user-facing errors depending on the failure type
    if (error?.message === "ERROR_API_KEY_MISSING") {
      res.status(500).json({
        success: false,
        error: "Configuration error: GEMINI_API_KEY environment variable is not defined on the server.",
        code: "API_KEY_MISSING"
      });
      return;
    }
    
    if (error?.message?.includes("API key not valid") || error?.message?.includes("not found")) {
      res.status(401).json({
        success: false,
        error: "Authentication error: The configured GEMINI_API_KEY is invalid.",
        code: "API_KEY_INVALID"
      });
      return;
    }

    if (error?.message?.includes("quota")) {
      res.status(429).json({
        success: false,
        error: "Rate limit error: Gemini API quota exceeded. Please try again later.",
        code: "QUOTA_EXCEEDED"
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate flashcards via AI."
    });
  }
}
