import { Router } from "express";
import { getStudyTips } from "../controllers/tips.controller";

const router = Router();

router.get("/", getStudyTips);

export default router;
