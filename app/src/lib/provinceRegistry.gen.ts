// AUTO-GENERATED FILE. Do not edit manually.
// Run scripts/generate-province-registry.js after adding JSON files under assets/data/thai-places/

export type ProvinceRegistry = Record<string, () => any[] | null>;

export const provinceRegistry: ProvinceRegistry = {
  'นครราชสีมา': () => { try { return require('../../assets/data/thai-places/นครราชสีมา.json'); } catch { return null; } },
  'เชียงใหม่': () => { try { return require('../../assets/data/thai-places/เชียงใหม่.json'); } catch { return null; } },
};
