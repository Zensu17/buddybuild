import { Router } from "express";
import studyBuddyRoutes from "./study-buddy.routes";
import aiRoutes from "./ai.routes";
import tipsRoutes from "./tips.routes";
import gardenRoutes from "./garden.routes";

const router = Router();

// API Health Check under /buddybuild/health
router.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    status: "ok", 
    backend: "express-vite-fullstack-buddybuild",
    timestamp: new Date().toISOString()
  });
});

// Register Feature-Specific Routers
router.use("/study-buddy", studyBuddyRoutes);  // -> /buddybuild/study-buddy
router.use("/ai", aiRoutes);                   // -> /buddybuild/ai/generate-flashcards
router.use("/study-tips", tipsRoutes);          // -> /buddybuild/study-tips
router.use("/garden", gardenRoutes);            // -> /buddybuild/garden/plants-config

export default router;
