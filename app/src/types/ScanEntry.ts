export type ConfidenceBand = "high" | "medium" | "low";

export type Remedy = {
  fertilizer?: { // nutrient cases
    type: "Urea (46-0-0)" | "NPK 15-15-15" | "KCl (0-0-60)" | "None";
    noteTH: string; 
    noteEN: string;
  };
  plantMedicine?: { // disease/pest cases - category only
    category: "Copper fungicide" | "Triazole fungicide" | "Strobilurin" | "Biocontrol (Bacillus)" | "None";
    ppe: Array<"mask"|"gloves"|"eye">;
    noteTH: string; 
    noteEN: string;
  };
};

export interface ScanEntry {
  id: string;           // "today"
  ts: number;           // epoch ms
  crop: "rice" | "durian";
  fieldId?: "my-field";
  imageUri: string;     // local file uri
  result: {
    condition: string;  // e.g., "ใบจุดสีน้ำตาล" (mock)
    conditionEN: string; // English condition name
    steps: string[];    // 3 steps in Thai
    stepsEN: string[];  // 3 steps in English
    ppe: string[];      // ["mask","gloves"]
    sprayReason?: string; // e.g., "ฝนตก 70%"
    remedy: Remedy;     // fertilizer or plant-medicine recommendation
  };
  status: "ok" | "queued" | "failed";
  confidence: ConfidenceBand;
}

export interface ScanState {
  today?: ScanEntry;    // store only one; overwrite on new scan
}

export interface ScanResult {
  condition: string;
  conditionEN: string;
  steps: string[];
  stepsEN: string[];
  ppe: string[];
  sprayReason?: string;
  confidence: ConfidenceBand;
  timestamp: string;
  fieldName?: string;
  remedy: Remedy;
}
