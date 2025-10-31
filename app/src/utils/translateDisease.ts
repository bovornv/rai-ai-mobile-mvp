import { DISEASE_DICT } from "../constants/disease-dictionary";

// Fuzzy match: if API returns "Rice Brown Spot Disease", it'll match "brown spot"
export function translateDiseaseName(enNameRaw: string) {
  if (!enNameRaw) return null;
  const key = enNameRaw.toLowerCase().trim();
  const found = Object.entries(DISEASE_DICT).find(([k]) => key.includes(k));
  return found ? found[1] : null;
}
