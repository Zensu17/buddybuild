import { Request, Response, NextFunction } from "express";

export interface PlantConfig {
  name: string;
  waterCost: number;
  growthStages: number;
  rewardXp: number;
}

export interface GardenConfig {
  [key: string]: PlantConfig;
}

const gardenConfig: GardenConfig = {
  sunflower: { name: "Bunga Matahari", waterCost: 20, growthStages: 5, rewardXp: 100 },
  sakura: { name: "Sakura Bonsai", waterCost: 35, growthStages: 5, rewardXp: 200 },
  lavender: { name: "Lavender", waterCost: 15, growthStages: 4, rewardXp: 80 },
  magic_fern: { name: "Magic Fern", waterCost: 40, growthStages: 5, rewardXp: 250 }
};

/**
 * Controller to fetch garden plants configuration parameters.
 */
export function getPlantsConfig(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: gardenConfig
    });
  } catch (error) {
    next(error);
  }
}
