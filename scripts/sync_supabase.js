const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración extraída de .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHEET_ID = "1oN_W3RTwVaxZm5zyKv8HQwgUsjAEZlpJSCFDe21GJWI";
const CONSOLIDATED_GID = "1177125270"; // GID de la pestaña n8n_Consolidado

// Diccionario de normalización (espejo de src/lib/team-normalization.ts)
const TEAM_NAME_MAP = {
  "FC Barcelona": "Barcelona",
  "Barcelona FC": "Barcelona",
  "Real Madrid CF": "Real Madrid",
  "Atletico Madrid": "Atlético de Madrid",
  "Atlético Madrid": "Atlético de Madrid",
  "Villarreal CF": "Villarreal",
  "Betis": "Real Betis",
  "Celta": "Celta de Vigo",
  "Athletic Bilbao": "Athletic Club",
  "Athletic": "Athletic Club",
  "Osasuna CA": "Osasuna",
  "Getafe CF": "Getafe",
  "RCD Espanyol": "Espanyol",
  "Valencia CF": "Valencia",
  "RCD Mallorca": "Mallorca",
  "Alaves": "Alavés",
  "Sevilla FC": "Sevilla",
  "Girona FC": "Girona",
  "Rayo": "Rayo Vallecano",
  "Manchester United": "Manchester Utd",
  "Man United": "Manchester Utd",
  "Man Utd": "Manchester Utd",
  "Manchester City FC": "Manchester City",
  "Man City": "Manchester City",
  "Tottenham Hotspur": "Tottenham",
  "Spurs": "Tottenham",
  "Wolverhampton Wanderers": "Wolverhampton",
  "Wolves": "Wolverhampton",
  "Leicester City": "Leicester",
  "Newcastle United": "Newcastle",
  "West Ham United": "West Ham",
  "Bayern Munich": "Bayern",
  "Bayern München": "Bayern",
  "Borussia Dortmund": "Dortmund",
  "BVB": "Dortmund",
  "Borussia Mönchengladbach": "B. Mönchengladbach",
  "Mönchengladbach": "B. Mönchengladbach",
  "Bayer 04 Leverkusen": "Bayer Leverkusen",
  "Leverkusen": "Bayer Leverkusen",
  "Eintracht": "Eintracht Frankfurt",
  "Red Bull Leipzig": "RB Leipzig",
  "Leipzig": "RB Leipzig",
  "Internazionale": "Inter",
  "Inter Milan": "Inter",
  "Milan": "AC Milan",
  "Napoli": "Nápoles",
  "Juventus FC": "Juventus",
  "AS Roma": "Roma",
  "SS Lazio": "Lazio",
  "Fiorentina ACF": "Fiorentina",
  "Paris Saint Germain": "PSG",
  "Paris SG": "PSG",
  "Olympique Marseille": "Marsella",
  "Marseille": "Marsella",
  "Olympique Lyonnais": "Lyon",
  "Monaco": "Mónaco",
  "Saint Etienne": "St Etienne",
  "Ajax Amsterdam": "Ajax",
  "PSV Eindhoven": "PSV",
  "Feyenoord Rotterdam": "Feyenoord",
  "AZ Alkmaar": "AZ"
};

function normalizeTeamName(name) {
  if (!name) return "";
  let cleanName = name.replace(/\s*\(\d+\)$/g, "").trim();
  cleanName = cleanName.replace(/\s*\d+$/g, "").trim();
  if (TEAM_NAME_MAP[cleanName]) return TEAM_NAME_MAP[cleanName];
  const genericClean = cleanName.replace(/\b(FC|CF|SSC|AC|AS|UD|CD|RC|SC|AFC|Club|de)\b/gi, "").trim();
  if (TEAM_NAME_MAP[genericClean]) return TEAM_NAME_MAP[genericClean];
  return genericClean || cleanName;
}

async function sync() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log("📥 Descargando CSV desde Google Sheets (Consolidado)...");
  try {
    // 1. LIMPIEZA PREVIA: Borrar datos viejos para evitar duplicados como "Nashville" vs "Nashville SC"
    console.log("🧹 Limpiando tabla de posiciones para evitar duplicados...");
    const { error: deleteError } = await supabase
      .from('standings')
      .delete()
      .neq('league', '0'); // Truco para borrar todo

    if (deleteError) {
      console.warn("⚠️ Advertencia al limpiar tabla:", deleteError.message);
    }

    const response = await axios.get(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${CONSOLIDATED_GID}`);
    const csvData = response.data;
    
    // Parser de CSV ultra-robusto (Estado Sólido)
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < csvData.length; i++) {
      const char = csvData[i];
      const nextChar = csvData[i + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        currentCell += '"'; i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentCell.trim());
        if (currentRow.length > 1) rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
    }

    const header = rows[0].map(h => h.toLowerCase());
    console.log("📑 Cabeceras detectadas:", header.join(" | "));

    const colIdx = {
      league: header.indexOf("liga"),
      pos: header.indexOf("pos"),
      team: header.indexOf("equipo"),
      publicName: header.indexOf("nombre publico") !== -1 ? header.indexOf("nombre publico") : header.indexOf("publicname"),
      pj: header.indexOf("pj"),
      g: header.indexOf("pg") !== -1 ? header.indexOf("pg") : (header.indexOf("g") !== -1 ? header.indexOf("g") : header.indexOf("pg")),
      e: header.indexOf("pe") !== -1 ? header.indexOf("pe") : (header.indexOf("e") !== -1 ? header.indexOf("e") : header.indexOf("pe")),
      p: header.indexOf("pp") !== -1 ? header.indexOf("pp") : (header.indexOf("p") !== -1 ? header.indexOf("p") : header.indexOf("pp")),
      goals: header.indexOf("goles"),
      pts: header.indexOf("pts"),
      form: header.indexOf("forma"),
      logo: header.indexOf("logo equipo")
    };

    const teams = rows.slice(1).filter(row => row[colIdx.pos] && !isNaN(parseInt(row[colIdx.pos])));
    console.log(`📊 Encontrados ${teams.length} equipos para procesar.`);

    let processedLeagues = new Set();

    for (const row of teams) {
      let leagueName = row[colIdx.league] || "";
      const lowerLeague = leagueName.toLowerCase();
      
      // DETECCIÓN EXACTA PARA EVITAR MEZCLA DE LIGAS (ESPAÑA)
      if (lowerLeague === "spain - laliga" || lowerLeague.includes("ea sports")) {
        leagueName = "Spain - LaLiga";
      } else if (lowerLeague === "spain - laliga2" || lowerLeague.includes("hypermotion")) {
        leagueName = "Spain - LaLiga2";
      } else if (lowerLeague.includes("brasil") || lowerLeague.includes("brazil")) {
        leagueName = "Brazil - Serie A";
      } else if (lowerLeague.includes("mls") || lowerLeague.includes("usa - mls")) {
        leagueName = "USA - MLS";
      }
      
      processedLeagues.add(leagueName);

      const pos = parseInt(row[colIdx.pos]);
      const rawTeam = row[colIdx.team];
      const publicName = row[colIdx.publicName];
      
      // USAR NOMBRE PUBLICO SIEMPRE QUE EXISTA (PARA EVITAR "CF", "EARTHQUAKES", ETC.)
      const teamName = (publicName && publicName !== "" && publicName !== "null") ? publicName : rawTeam;
      
      const pj = parseInt(row[colIdx.pj]) || 0;
      const g = parseInt(row[colIdx.g]) || 0;
      const e = parseInt(row[colIdx.e]) || 0;
      const p = parseInt(row[colIdx.p]) || 0;
      const goals = row[colIdx.goals] || "0:0";
      const pts = parseInt(row[colIdx.pts]) || 0;
      const form = row[colIdx.form] || "";
      const dg = (g * 2) - (p * 2);

      let zone = null;
      const euroLeagues = ["Spain - LaLiga", "England - Premier League", "Germany - Bundesliga", "Italy - Serie A", "France - Ligue 1"];
      if (pos <= 4 && euroLeagues.includes(leagueName)) zone = "champions";
      else if (pos <= 6 && euroLeagues.includes(leagueName)) zone = "europa";
      else if (pos >= 18 && euroLeagues.includes(leagueName)) zone = "relegation";

      let logoUrl = row[colIdx.logo] || "";
      logoUrl = logoUrl.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      if (!logoUrl.startsWith('http')) logoUrl = `https://media.api-sports.io/football/teams/generic.png`;

      const { error } = await supabase
        .from('standings')
        .upsert({
          league: leagueName,
          pos,
          team: teamName,
          logo: logoUrl,
          pj, g, e, p, dg, pts, zone,
          goals,
          form
        }, { 
          onConflict: 'league,team' 
        });

      if (error) console.error(`❌ Error upserting ${teamName}:`, error.message);
    }

    console.log("✅ Ligas procesadas:", Array.from(processedLeagues).join(", "));
    console.log("🚀 ¡Sincronización completada con éxito!");

  } catch (error) {
    console.error("💥 Error fatal en la sincronización:", error.message);
  }
}

sync();
