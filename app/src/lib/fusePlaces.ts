import Fuse from 'fuse.js';

type Place = { name_th: string; name_en?: string; amphoe: string; changwat: string; lat: number; lon: number };
type Geo = { lat: number; lon: number; label: string };

// Fallback small set
let fallbackPlaces: Place[] | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  fallbackPlaces = require('../../assets/data/thai-places.json');
} catch {}

const provinceCache: Record<string, Place[] | undefined> = {};

function makeFuse(items: Place[]) {
  return new Fuse(items, { includeScore: true, threshold: 0.4, keys: ['name_th','amphoe','changwat','name_en'] });
}

export function fuzzySearchLocal(q: string, limit = 8): Geo[] {
  const text = (q || '').trim();
  if (!text) return [];
  if (!fallbackPlaces) return [];
  const res = makeFuse(fallbackPlaces).search(text)
    .slice(0, limit)
    .filter(r => r.item != null)
    .map(r => toGeo(r.item))
    .filter((g): g is Geo => g != null);
  return res;
}

function toGeo(p: Place): Geo | null {
  if (!p || typeof p.lat !== 'number' || typeof p.lon !== 'number') return null;
  return { 
    lat: p.lat, 
    lon: p.lon, 
    label: `${p.name_th || ''} ${p.amphoe || ''} ${p.changwat || ''}`.trim() || 'Unknown'
  };
}

// Map common province tokens to chunk filenames (Thai names used as filename)
const provinceHints: Record<string, string> = {
  'นครราชสีมา': 'นครราชสีมา', 'โคราช': 'นครราชสีมา', 'korat': 'นครราชสีมา',
  'เชียงใหม่': 'เชียงใหม่', 'chiangmai': 'เชียงใหม่',
  'กรุงเทพ': 'กรุงเทพมหานคร', 'กทม': 'กรุงเทพมหานคร', 'bangkok': 'กรุงเทพมหานคร',
  'สงขลา': 'สงขลา', 'songkhla': 'สงขลา',
};

function guessProvinces(q: string): string[] {
  const tokens = q.toLowerCase().split(/[ ,]+/).filter(Boolean);
  const hits = new Set<string>();
  for (const t of tokens) {
    const key = Object.keys(provinceHints).find(k => t.includes(k));
    if (key) hits.add(provinceHints[key]);
  }
  // If no hint, try a few big provinces to maximize hit rate
  if (hits.size === 0) return ['กรุงเทพมหานคร','เชียงใหม่','นครราชสีมา','สงขลา'];
  return Array.from(hits);
}

// Static registry (auto-generated). Update by running the generator script
import { provinceRegistry as provinceRegistryGen } from './provinceRegistry.gen';
const provinceRegistry: Record<string, () => Place[] | null> = provinceRegistryGen as any;

async function loadProvinceChunk(name: string): Promise<Place[] | null> {
  if (provinceCache[name]) return provinceCache[name] || null;
  const loader = provinceRegistry[name];
  if (!loader) { provinceCache[name] = []; return null; }
  const data = loader();
  if (data && data.length) { provinceCache[name] = data; return data; }
  provinceCache[name] = []; return null;
}

export async function fuzzySearchLocalSmart(q: string, limit = 8): Promise<Geo[]> {
  const text = (q || '').trim();
  if (!text) return [];
  const provinces = guessProvinces(text);
  let results: Geo[] = [];
  for (const pv of provinces) {
    const arr = await loadProvinceChunk(pv);
    if (arr && arr.length) {
      const fuse = makeFuse(arr);
      const found = fuse.search(text)
        .slice(0, limit)
        .filter(r => r.item != null)
        .map(r => toGeo(r.item));
      for (const g of found) {
        if (g && !results.find(x => x.label === g.label)) results.push(g);
        if (results.length >= limit) break;
      }
      if (results.length >= limit) break;
    }
  }
  if (results.length < limit && fallbackPlaces && fallbackPlaces.length) {
    const fallback = makeFuse(fallbackPlaces).search(text)
      .slice(0, limit)
      .filter(r => r.item != null)
      .map(r => toGeo(r.item));
    for (const g of fallback) {
      if (g && !results.find(x => x.label === g.label)) results.push(g);
      if (results.length >= limit) break;
    }
  }
  return results.slice(0, limit);
}


