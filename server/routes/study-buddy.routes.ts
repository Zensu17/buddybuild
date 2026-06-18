import { Router } from "express";
import { handleStudyBuddy } from "../controllers/ai.controller";
import { validateBody } from "../middleware/validation";
import { rateLimiter } from "../middleware/limiter";

const router = Router();

// Rate limit: max 10 study buddy prompts per minute per IP
const studyBuddyLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Terlalu banyak permintaan ke Asisten Belajar dari IP ini. Silakan tunggu 1 menit sebelum mengirim lagi."
});

const studyBuddySchema = {
  prompt: { type: "string" as const, minLength: 1, maxLength: 5000, required: true },
  context: { type: "string" as const, required: false }
};

router.post("/", studyBuddyLimiter, validateBody(studyBuddySchema), handleStudyBuddy);

export default router;
