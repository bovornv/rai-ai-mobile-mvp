export type GeoPoint = { lat: number; lon: number; label: string };

export async function geocodeNominatim(q: string): Promise<GeoPoint[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=th&countrycodes=th&limit=8&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'RaiAI/1.0' }});
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter((d: any) => d && typeof d === 'object' && (d.lat != null || d.lon != null))
      .map((d: any) => ({
        lat: parseFloat(d.lat) || 0,
        lon: parseFloat(d.lon) || 0,
        label: compactThaiAddress(d)
      }))
      .filter(p => !isNaN(p.lat) && !isNaN(p.lon) && isFinite(p.lat) && isFinite(p.lon));
  } catch {
    return [];
  }
}

function compactThaiAddress(d: any): string {
  if (!d || typeof d !== 'object') return 'Unknown location';
  
  // Nominatim JSONv2 format for Thailand typically uses:
  // village/town/city (subdistrict/town), municipality/city (district), state (province)
  const subdistrict = d.village || d.suburb || d.town;
  const district = d.municipality || d.city || d.county;
  const province = d.state;
  
  const parts = [subdistrict, district, province].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' ');
  }
  
  // Fallback to display_name if structured fields aren't available
  if (d.display_name && typeof d.display_name === 'string') {
    // Try to extract a shorter version from display_name
    const name = d.display_name.split(',')[0] || d.display_name;
    return name.trim() || 'Unknown location';
  }
  
  return 'Unknown location';
}


