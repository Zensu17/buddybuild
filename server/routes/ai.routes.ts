import { Router } from "express";
import { handleGenerateFlashcards } from "../controllers/ai.controller";
import { validateBody } from "../middleware/validation";
import { rateLimiter } from "../middleware/limiter";

const router = Router();

// Rate limit: max 10 AI generation requests per minute per IP
const aiLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Terlalu banyak permintaan alat AI dari IP ini. Silakan tunggu 1 menit sebelum mengirim lagi."
});

const generateFlashcardsSchema = {
  topic: { type: "string" as const, minLength: 1, maxLength: 200, required: true },
  course: { type: "string" as const, minLength: 1, maxLength: 200, required: true }
};

router.post("/generate-flashcards", aiLimiter, validateBody(generateFlashcardsSchema), handleGenerateFlashcards);

export default router;
