/**
 * enrich-h2h.js
 * Cruza el H2H RAW con upcoming_matches para añadir fecha real y simplifica la estructura.
 *
 * INPUT:  scripts/data/european_h2h_raw.json           ← archivo original sin tocar
 * OUTPUT: scripts/data/european_h2h_insights_5_matches.json ← archivo enriquecido
 *
 * Uso: node scripts/enrich-h2h.js
 */

const fs = require('fs');
const path = require('path');

const H2H_PATH    = path.join(__dirname, 'data/european_h2h_raw.json');
const UP_PATH     = path.join(__dirname, '../public/upcoming_matches_detailed.json');
const OUTPUT_PATH = path.join(__dirname, 'data/european_h2h_insights_5_matches.json');

// ── Cargar datos ────────────────────────────────────────────────────────────
const h2hRaw  = JSON.parse(fs.readFileSync(H2H_PATH, 'utf8'));
const upRaw   = JSON.parse(fs.readFileSync(UP_PATH,  'utf8'));

// ── Construir índice id → {time, home, away} ────────────────────────────────
const matchIndex = {};
for (const [, matches] of Object.entries(upRaw)) {
  for (const m of matches) {
    if (m.id) matchIndex[m.id] = m;
  }
}

// ── Transformar H2H ─────────────────────────────────────────────────────────
const enriched = {};

for (const [liga, partidos] of Object.entries(h2hRaw)) {
  enriched[liga] = partidos.map(partido => {
    const upcoming = matchIndex[partido.match_id] || null;

    // Fecha real del partido próximo (e.g. "03.05. 18:30")
    const fecha_partido = upcoming ? upcoming.time : null;

    // Aplanar sections — quitar "Unknown", unir todos los arrays de h2h
    const h2hMatches = Object.values(partido.sections || {}).flat();

    // Simplificar cada partido del H2H histórico
    const h2h = h2hMatches.map(m => ({
      local:     m.equipos?.[0] || null,
      visitante: m.equipos?.[1] || null,
      marcador:  m.marcador || null,
    }));

    return {
      match_id:     partido.match_id,
      local:        partido.home,
      visitante:    partido.away,
      fecha_partido,          // "03.05. 18:30" o null
      h2h,                    // array plano sin sections ni resultado "?"
    };
  });
}

// ── Guardar ─────────────────────────────────────────────────────────────────
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(enriched, null, 2), 'utf8');

const total = Object.values(enriched).reduce((a, v) => a + v.length, 0);
const conFecha = Object.values(enriched).flat().filter(p => p.fecha_partido).length;

console.log(`✅ H2H enriquecido: ${total} partidos en ${Object.keys(enriched).length} ligas.`);
console.log(`📅 Con fecha real: ${conFecha} / ${total} partidos cruzados con upcoming.`);
console.log(`💾 Guardado en: ${OUTPUT_PATH}`);
