import { Router } from "express";
import { getPlantsConfig } from "../controllers/garden.controller";

const router = Router();

router.get("/plants-config", getPlantsConfig);

export default router;
