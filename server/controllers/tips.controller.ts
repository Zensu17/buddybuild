import { Request, Response, NextFunction } from "express";

export interface StudyTip {
  id: string;
  text: string;
  category: "productivity" | "learning" | "wellness" | "memory";
}

const studyTips: StudyTip[] = [
  { 
    id: "1", 
    text: "Gunakan teknik Pomodoro: Belajar 25 menit, istirahat 5 menit untuk menjaga konsentrasi maksimal.", 
    category: "productivity" 
  },
  { 
    id: "2", 
    text: "Riset menunjukkan bahwa mengajar konsep ke orang lain (Teknik Feynman) mempercepat pemahaman hingga 90%.", 
    category: "learning" 
  },
  { 
    id: "3", 
    text: "Minum air putih yang cukup dan hirup udara segar setiap sesi istirahat belajar meningkatkan fokus otak.", 
    category: "wellness" 
  },
  { 
    id: "4", 
    text: "Membuat visualisasi kartu flashcard terbukti memperkuat memori jangka panjang (Active Recall).", 
    category: "memory" 
  }
];

/**
 * Controller to fetch productivity and educational tips.
 */
export function getStudyTips(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: studyTips
    });
  } catch (error) {
    next(error);
  }
}
