const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración extraída de .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHEET_ID = "1oN_W3RTwVaxZm5zyKv8HQwgUsjAEZlpJSCFDe21GJWI";
const CONSOLIDATED_GID = "1177125270"; // GID de la pestaña n8n_Consolidado

// ── Diccionario de Alias Maestro ─────────────────────────────────────────────
const ALIAS = {
  // --- LALIGA EA SPORTS ---
  'fc barcelona': 'Barcelona',
  'fc barcelona (77889)': 'Barcelona',
  'real madrid (120854)': 'Real Madrid',
  'villarreal cf (224740)': 'Villarreal',
  'atletico de madrid': 'Atlético de Madrid',
  'real betis seville': 'Real Betis',
  'rc celta de vigo (2821)': 'Celta de Vigo',
  'real sociedad san sebastian': 'Real Sociedad',
  'getafe cf (154822)': 'Getafe',
  'athletic bilbao (1086332)': 'Athletic Club',
  'ca osasuna (2820)': 'Osasuna',
  'girona fc (24264)': 'Girona',
  'espanyol barcelona': 'Espanyol',
  'valencia cf (77909)': 'Valencia',
  'rcd mallorca (2826)': 'Mallorca',
  'rayo vallecano (825968)': 'Rayo Vallecano',
  'sevilla fc (2833)': 'Sevilla',
  'deportivo alaves (475488)': 'Alavés',
  'elche cf (2846)': 'Elche',
  'atletico levante ud (77407)': 'Levante',
  'real oviedo (425591)': 'Real Oviedo',

  // --- PREMIER LEAGUE ---
  'arsenal fc (42)': 'Arsenal',
  'manchester city (17)': 'Manchester City',
  'manchester united (35)': 'Manchester Utd',
  'aston villa (40)': 'Aston Villa',
  'liverpool fc': 'Liverpool',
  'brighton & hove albion': 'Brighton',
  'chelsea fc (36539)': 'Chelsea',
  'brentford fc': 'Brentford',
  'afc bournemouth (60)': 'Bournemouth',
  'everton fc (48)': 'Everton',
  'sunderland afc (41)': 'Sunderland',
  'fulham fc (36548)': 'Fulham',
  'crystal palace (290396)': 'Crystal Palace',
  'newcastle united (39)': 'Newcastle',
  'leeds united (34)': 'Leeds Utd',
  'nottingham forest (14)': 'Nottingham Forest',
  'west ham united (37)': 'West Ham',
  'tottenham hotspur (33)': 'Tottenham',
  'burnley fc (36550)': 'Burnley',
  'wolverhampton wanderers (3)': 'Wolves',

  // --- BUNDESLIGA ---
  'bayern munich (2672)': 'Bayern Múnich',
  'borussia dortmund (1281319)': 'Borussia Dortmund',
  'rb leipzig (599780)': 'RB Leipzig',
  'vfb stuttgart (1151795)': 'Stuttgart',
  'tsg hoffenheim (36652)': 'Hoffenheim',
  'bayer leverkusen (36623)': 'Bayer Leverkusen',
  'sc freiburg (2538)': 'Friburgo',
  'eintracht frankfurt': 'Eintracht Fráncfort',
  'fc augsburg (2600)': 'Augsburgo',
  'fsv mainz (2556)': 'Mainz',
  'union berlin (2547)': 'Union Berlin',
  '1. fc cologne (2671)': 'Colonia',
  'borussia monchengladbach (2527)': 'Borussia M\'gladbach',
  'hamburger sv (43695)': 'Hamburgo',
  'werder bremen (43694)': 'Werder Bremen',
  'fc st. pauli (52878)': 'St. Pauli',
  'vfl wolfsburg (43706)': 'Wolfsburgo',
  '1. fc heidenheim (213962)': 'Heidenheim',

  // --- SERIE A ---
  'inter milano (1175363)': 'Inter',
  'ac milan (502832)': 'AC Milan',
  'ssc napoli': 'Nápoles',
  'juventus turin (1175365)': 'Juventus',
  'como 1907 (224570)': 'Como',
  'as roma (509432)': 'Roma',
  'atalanta bc (72070)': 'Atalanta',
  'bologna fc': 'Bolonia',
  'lazio rome (2699)': 'Lazio',
  'sassuolo calcio (2793)': 'Sassuolo',
  'udinese calcio (79057)': 'Udinese',
  'torino fc (466279)': 'Torino',
  'genoa cfc (2713)': 'Genoa',
  'parma calio (924573)': 'Parma',
  'acf fiorentina (373090)': 'Fiorentina',
  'cagliari calcio (2719)': 'Cagliari',
  'us cremonese (2761)': 'Cremonese',
  'us lecce (2689)': 'Lecce',
  'hellas verona (2701)': 'Verona',
  'pisa sc (2737)': 'Pisa',

  // --- LIGUE 1 ---
  'paris saint-germain': 'PSG',
  'racing club de lens': 'Lens',
  'olympique lyon (26245)': 'Lyon',
  'lille osc (1643)': 'Lille',
  'stade rennais fc (1312354)': 'Stade Rennais',
  'olympique marseille (1641)': 'Marsella',
  'as monaco (463917)': 'Mónaco',
  'strasbourg alsace (1659)': 'Estrasburgo',
  'fc lorient (864171)': 'Lorient',
  'paris fc (308650)': 'Paris FC',
  'toulouse fc (441708)': 'Toulouse',
  'stade brest 29 (1715)': 'Brest',
  'angers sco (453075)': 'Angers',
  'le havre ac (1662)': 'Le Havre',
  'ogc nice (406491)': 'Niza',
  'aj auxerre (1271688)': 'Auxerre',
  'fc nantes (1647)': 'Nantes',
  'fc metz (495636)': 'Metz',

  // --- EREDIVISIE ---
  'psv eindhoven': 'PSV',
  'feyenoord rotterdam (817572)': 'Feyenoord',
  'nec nijmegen (802518)': 'Nijmegen',
  'fc twente enschede (55511)': 'Twente',
  'ajax amsterdam (90118)': 'Ajax',
  'az alkmaar (363852)': 'AZ Alkmaar',
  'fc utrecht (2948)': 'Utrecht',
  'sc heerenveen (178258)': 'Heerenveen',
  'fc groningen (1300190)': 'Groningen',
  'sparta rotterdam (2960)': 'Sparta Rotterdam',
  'go ahead eagles': 'G.A. Eagles',
  'fortuna sittard (802542)': 'Sittard',
  'pec zwolle (2971)': 'Zwolle',
  'fc volendam (2968)': 'FC Volendam',
  'excelsior rotterdam': 'Excelsior',
  'sc telstar (2972)': 'Telstar',
  'nac breda (1151685)': 'Breda',
  'heracles almelo (2977)': 'Heracles',

  // --- LALIGA HYPERMOTION ---
  'racing santander': 'R. Racing Club',
  'rc deportivo de la coruna (445833)': 'Deportivo de La Coruña',
  'ud almeria (516740)': 'Almería',
  'cd castellon (5067)': 'Castellón',
  'malaga cf (2830)': 'Málaga',
  'burgos cf (2854)': 'Burgos CF',
  'ud las palmas': 'Las Palmas',
  'sd eibar (2839)': 'Eibar',
  'andorra cf': 'Andorra',
  'sporting gijon': 'Real Sporting',
  'cordoba cf (445831)': 'Córdoba',
  'ad ceuta (2869)': 'AD Ceuta',
  'albacete bp': 'Albacete',
  'granada cf (114819)': 'Granada',
  'cd leganes (427515)': 'Leganés',
  'real sociedad san sebastian b': 'Real Sociedad B',
  'real valladolid (2831)': 'Real Valladolid',
  'cadiz cf (4488)': 'Cádiz',
  'real zaragoza (439736)': 'Real Zaragoza',
  'sd huesca (24265)': 'Huesca',
  'cd mirandes': 'Mirandés',
  'cultural leonesa (2868)': 'Cultural Leonesa',

  // --- CHAMPIONSHIP ---
  'coventry city (11)': 'Coventry',
  'millwall fc': 'Millwall',
  'ipswich town (397536)': 'Ipswich',
  'southampton fc (502706)': 'Southampton',
  'middlesbrough fc (37483)': 'Middlesbrough',
  'wrexham afc (64)': 'Wrexham',
  'hull city (96)': 'Hull',
  'derby county (27)': 'Derby',
  'norwich city (263)': 'Norwich',
  'swansea city (74)': 'Swansea',
  'bristol city (58)': 'Bristol City',
  'queens park rangers': 'QPR',
  'sheffield united': 'Sheffield Utd',
  'birmingham city (9)': 'Birmingham',
  'watford fc (24)': 'Watford',
  'preston north end (21)': 'Preston',
  'stoke city (29)': 'Stoke',
  'west bromwich albion (43510)': 'West Brom',
  'portsmouth fc (2)': 'Portsmouth',
  'charlton athletic (47)': 'Charlton',
  'blackburn rovers (46)': 'Blackburn',
};

// ── Lógica de Limpieza Sincronizada ──────────────────────────────────────────
const clean = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s*\(\d+\)$/g, "").replace(/[^a-z0-9]/g, '');

const normalizeName = (name) => {
  const c = clean(name);
  for (const [key, val] of Object.entries(ALIAS)) {
    if (clean(key) === c) return val;
  }
  return (name || '').toString().trim();
};

function normalizeLeague(name) {
  if (!name) return "VARIOS";
  const n = name.toLowerCase();
  if (n.includes("laliga") && !n.includes("2") && !n.includes("hypermotion")) return "Spain - LaLiga";
  if (n.includes("hypermotion") || n.includes("laliga2")) return "Spain - LaLiga2";
  if (n.includes("premier")) return "England - Premier League";
  if (n.includes("2. bundesliga")) return "Germany - 2. Bundesliga";
  if (n.includes("bundesliga")) return "Germany - Bundesliga";
  if (n.includes("serie a") && !n.includes("brasil")) return "Italy - Serie A";
  if (n.includes("ligue 1")) return "France - Ligue 1";
  if (n.includes("eredivisie")) return "Netherlands - Eredivisie";
  if (n.includes("championship")) return "England - Championship";
  if (n.includes("primeira liga") || n.includes("portugal")) return "Portugal - Primeira Liga";
  return name.trim();
}

async function sync() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log("📥 Descargando CSV desde Google Sheets (Consolidado)...");
  try {
    const response = await axios.get(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${CONSOLIDATED_GID}`);
    const csvData = response.data;
    
    // Parser de CSV robusto
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
    console.log("📝 Cabeceras detectadas en el Sheet:", header.join(", "));
    const findCol = (names) => {
      for (const name of names) {
        const idx = header.indexOf(name.toLowerCase());
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const colIdx = {
      league: findCol(["liga", "league"]),
      tipo: findCol(["tipo", "type", "scope"]),
      pos: findCol(["pos", "position"]),
      team: findCol(["equipo", "team"]),
      publicName: findCol(["nombre publico", "public name"]),
      pj: findCol(["pj", "played"]),
      g: findCol(["pg", "g", "won"]),
      e: findCol(["pe", "e", "draw"]),
      p: findCol(["pp", "p", "lost"]),
      goals: findCol(["goles", "goals"]),
      pts: findCol(["pts", "points"]),
      form: findCol(["forma", "form"]),
      logoTeam: findCol(["logo equipo", "team logo"]),
      logoLeague: findCol(["logo liga", "league logo"])
    };

    const teams = rows.slice(1).filter(row => row[colIdx.pos] && !isNaN(parseInt(row[colIdx.pos])));
    console.log(`📊 Procesando ${teams.length} equipos...`);

    // ── 1. LIMPIEZA PREVIA (Opcional pero recomendado para evitar basura) ────────
    // Solo borramos si el volumen de datos es correcto para evitar borrados accidentales
    if (teams.length > 10) {
      console.log("🧹 Limpiando tabla standings para evitar duplicados residuales...");
      await supabase.from('standings').delete().neq('pos', -1);
    }

    for (const row of teams) {
      const rawLeague = row[colIdx.league] || "";
      const league = normalizeLeague(rawLeague);

      const rawTeam = row[colIdx.team] || "";
      const rawPublic = row[colIdx.publicName] || "";
      
      // La clave de la normalización: Usar Nombre Público si existe, sino el Equipo API
      // Pero siempre pasarlo por el normalizador para quitar basura
      const teamName = normalizeName(rawPublic || rawTeam);
      const apiName = (row[colIdx.team] || "").replace(/\s*\(\d+\)$/g, "").trim();

      const pos = parseInt(row[colIdx.pos]);
      const pj = parseInt(row[colIdx.pj]) || 0;
      const pg = parseInt(row[colIdx.g]) || 0;
      const pe = parseInt(row[colIdx.e]) || 0;
      const pp = parseInt(row[colIdx.p]) || 0;
      const goals = row[colIdx.goals] || "0:0";
      const pts = parseInt(row[colIdx.pts]) || 0;
      const form = (row[colIdx.form] || "").toUpperCase();
      
      let zone = null;
      if (league === "Spain - LaLiga") {
        if (pos <= 4) zone = "champions";
        else if (pos <= 6) zone = "europa";
        else if (pos === 7) zone = "conference";
        else if (pos >= 18) zone = "relegation";
      } else if (league === "Portugal - Primeira Liga") {
        if (pos <= 2) zone = "champions";
        else if (pos === 3) zone = "champions"; // Qualifiers
        else if (pos === 4) zone = "europa";
        else if (pos === 5) zone = "conference";
        else if (pos >= 16) zone = "relegation";
      }

      const type = (row[colIdx.tipo] || "General").trim();

      const { error } = await supabase
        .from('standings')
        .upsert({
          league,
          type,
          pos,
          team: apiName,         // Nombre API limpio (sin ID)
          public_name: teamName, // Nombre de tu diccionario
          pj, 
          pg, 
          pe, 
          pp, 
          pts, 
          goals,
          form,
          zone,
          logo_team: row[colIdx.logoTeam] || "",
          logo_league: row[colIdx.logoLeague] || ""
        }, { 
          onConflict: 'league,team,type' 
        });

      if (error) console.error(`❌ Error con ${teamName}:`, error.message);
    }

    console.log("🚀 ¡Sincronización completada! Standings limpios en Supabase.");

  } catch (error) {
    console.error("💥 Error fatal:", error.message);
  }
}

sync();
