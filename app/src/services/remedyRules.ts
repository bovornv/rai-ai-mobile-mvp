import { Remedy } from '../types/ScanEntry';

export const REMEDY_RULES: Record<string, Remedy> = {
  // Rice conditions
  "rice_n_def": {
    fertilizer: {
      type: "Urea (46-0-0)",
      noteTH: "ใส่บางๆ ตามอัตราแนะนำ แบ่งใส่ 2 ครั้ง",
      noteEN: "Apply lightly per label, split into 2 doses"
    }
  },
  "rice_brown_spot": {
    plantMedicine: {
      category: "Strobilurin",
      ppe: ["mask", "gloves"],
      noteTH: "ฉีดช่วงเช้า ลมอ่อน หลีกเลี่ยงฝน 12 ชม.",
      noteEN: "Spray in calm morning; avoid rain within 12h"
    }
  },
  "rice_blast": {
    plantMedicine: {
      category: "Triazole fungicide",
      ppe: ["mask", "gloves", "eye"],
      noteTH: "ตัดใบเสีย ลดไนโตรเจนชั่วคราว",
      noteEN: "Remove damaged leaves; reduce nitrogen briefly"
    }
  },
  "rice_bacterial_blight": {
    plantMedicine: {
      category: "Copper fungicide",
      ppe: ["mask", "gloves"],
      noteTH: "ฉีดพ่นตามฉลาก หลีกเลี่ยงช่วงฝนตก",
      noteEN: "Spray per label; avoid rainy periods"
    }
  },
  "rice_k_def": {
    fertilizer: {
      type: "KCl (0-0-60)",
      noteTH: "ใส่รอบโคนต้น ระวังราก",
      noteEN: "Apply around base, avoid root damage"
    }
  },

  // Durian conditions
  "durian_n_def": {
    fertilizer: {
      type: "NPK 15-15-15",
      noteTH: "เติมเบาๆ รอบโคน ระวังราก",
      noteEN: "Light ring application; avoid root damage"
    }
  },
  "durian_anthracnose": {
    plantMedicine: {
      category: "Copper fungicide",
      ppe: ["mask", "gloves"],
      noteTH: "ตัดแต่งใบเสีย ฉีดพ่นตามฉลาก",
      noteEN: "Prune damaged leaves; spray per label"
    }
  },
  "durian_phytophthora": {
    plantMedicine: {
      category: "Triazole fungicide",
      ppe: ["mask", "gloves", "eye"],
      noteTH: "ฉีดพ่นตามฉลาก ระวังการสะสมในดิน",
      noteEN: "Spray per label; beware soil accumulation"
    }
  },
  "durian_k_def": {
    fertilizer: {
      type: "KCl (0-0-60)",
      noteTH: "ใส่รอบโคนต้น ระวังราก",
      noteEN: "Apply around base, avoid root damage"
    }
  },
  "durian_healthy": {
    fertilizer: {
      type: "None",
      noteTH: "ต้นแข็งแรงดี ไม่ต้องใส่ปุ๋ยเพิ่ม",
      noteEN: "Plant is healthy, no additional fertilizer needed"
    }
  },

  // Default fallback
  "unknown": {
    fertilizer: {
      type: "None",
      noteTH: "ไม่สามารถระบุได้ชัดเจน โปรดปรึกษาผู้เชี่ยวชาญ",
      noteEN: "Cannot identify clearly, please consult an expert"
    }
  }
};

export function getRemedyForCondition(conditionId: string): Remedy {
  return REMEDY_RULES[conditionId] || REMEDY_RULES["unknown"];
}
