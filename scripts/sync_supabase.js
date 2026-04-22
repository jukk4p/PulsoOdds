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

function normalizeLeagueName(name) {
  if (!name) return "";
  const n = name.trim();
  if (n.includes("LaLiga EA Sports")) return "La Liga";
  if (n.includes("LaLiga Hypermotion")) return "Segunda División";
  return n;
}

async function sync() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log("📥 Descargando CSV desde Google Sheets (Consolidado)...");
  try {
    const response = await axios.get(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${CONSOLIDATED_GID}`);
    const csvData = response.data;
    
    const rows = csvData.split('\n').map(row => {
      // Manejo de CSV (split por comas, limpiar comillas)
      return row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
    });

    const header = rows[0].map(h => h.toLowerCase());
    const colIdx = {
      league: header.indexOf("liga"),
      pos: header.indexOf("pos"),
      team: header.indexOf("equipo"),
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

    for (const row of teams) {
      const leagueName = normalizeLeagueName(row[colIdx.league]);
      const pos = parseInt(row[colIdx.pos]);
      const teamName = normalizeTeamName(row[colIdx.team]);
      const pj = parseInt(row[colIdx.pj]) || 0;
      const g = parseInt(row[colIdx.g]) || 0;
      const e = parseInt(row[colIdx.e]) || 0;
      const p = parseInt(row[colIdx.p]) || 0;
      const goals = row[colIdx.goals] || "0:0";
      const pts = parseInt(row[colIdx.pts]) || 0;
      const form = row[colIdx.form] || "";
      const dg = (g * 2) - (p * 2);

      let zone = null;
      if (pos <= 4) zone = "champions";
      else if (pos <= 6) zone = "europa";
      else if (pos >= 18 && (leagueName === "La Liga" || leagueName === "Premier League")) zone = "relegation";

      const logoUrl = row[colIdx.logo] || `https://media.api-sports.io/football/teams/generic.png`;

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

      if (error) {
        console.error(`❌ Error upserting ${teamName}:`, error.message);
      }
    }

    console.log("🚀 ¡Base de Datos actualizada correctamente con los datos de n8n_Consolidado!");

  } catch (error) {
    console.error("💥 Error fatal en la sincronización:", error.message);
  }
}

sync();
