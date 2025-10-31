export function formatThaiDate(d: Date, lang: 'th'|'en') {
  if (lang === 'th') {
    const be = d.getFullYear() + 543;
    return d.toLocaleDateString('th-TH', { day:'numeric', month:'long' }) + ` ${be}`;
  }
  return d.toLocaleDateString('en-US', { day:'numeric', month:'long', year:'numeric' });
}


