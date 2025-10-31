/*
  Generate static province registry for Metro bundler.
  Scans app/assets/data/thai-places/*.json and emits src/lib/provinceRegistry.gen.ts

  Usage:
    cd app
    node scripts/generate-province-registry.js
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'assets', 'data', 'thai-places');
const OUT_FILE = path.join(ROOT, 'src', 'lib', 'provinceRegistry.gen.ts');

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error('Data directory not found:', DATA_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const entries = files.map(f => {
    const name = f.replace(/\.json$/, '');
    const rel = `../../assets/data/thai-places/${f}`;
    return `  '${name}': () => { try { return require('${rel}'); } catch { return null; } },`;
  }).join('\n');

  const content = `// AUTO-GENERATED FILE. Do not edit manually.\n// Run scripts/generate-province-registry.js after adding JSON files under assets/data/thai-places/\n\nexport type ProvinceRegistry = Record<string, () => any[] | null>;\n\nexport const provinceRegistry: ProvinceRegistry = {\n${entries}\n};\n`;

  fs.writeFileSync(OUT_FILE, content, 'utf8');
  console.log('✅ Wrote', OUT_FILE);
}

main();


