Place chunks by province
=========================

Add one JSON file per province here, named exactly as the Thai province, e.g.:

- นครราชสีมา.json
- เชียงใหม่.json
- กรุงเทพมหานคร.json
- สงขลา.json

Each file must be an array of objects with this shape:

{
  "name_th": "ตำบลเทพาลัย",
  "name_en": "Thephalai",
  "amphoe": "อ.คง",
  "changwat": "จ.นครราชสีมา",
  "lat": 15.3467,
  "lon": 102.3494
}

The app will lazy-load only the likely provinces based on the user's query, and
fallback to the small `assets/data/thai-places.json` seed when needed.


