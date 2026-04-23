/**
 * DICCIONARIO MAESTRO DE NORMALIZACIÓN - PulsoOdds
 * Este archivo es la "Aduana" de nombres. Cualquier nombre de equipo que llegue
 * de cualquier fuente (Flashscore, APIs de apuestas, Excel) pasa por aquí.
 */

const TEAM_NAME_MAP: Record<string, string> = {
  // --- LALIGA EA SPORTS ---
  "FC Barcelona": "Barcelona",
  "FC Barcelona (77889)": "Barcelona",
  "Real Madrid": "Real Madrid",
  "Real Madrid (120854)": "Real Madrid",
  "Villarreal CF": "Villarreal",
  "Villarreal CF (224740)": "Villarreal",
  "Atlético de Madrid": "Atlético de Madrid",
  "Real Betis Balompie (388582)": "Real Betis",
  "Real Betis Balompie": "Real Betis",
  "Real Betis": "Real Betis",
  "Real Betis Seville": "Real Betis",
  "RC Celta de Vigo (2821)": "Celta de Vigo",
  "Real Sociedad (1175987)": "Real Sociedad",
  "Getafe CF (154822)": "Getafe",
  "Athletic Bilbao (1086332)": "Athletic Club",
  "Athletic Bilbao": "Athletic Club",
  "CA Osasuna (2820)": "Osasuna",
  "Girona FC (24264)": "Girona",
  "CD Espanyol Barcelona (506008)": "Espanyol",
  "Valencia CF (77909)": "Valencia",
  "RCD Mallorca (2826)": "Mallorca",
  "Rayo Vallecano (825968)": "Rayo Vallecano",
  "Sevilla FC (2833)": "Sevilla",
  "Deportivo Alaves (475488)": "Alavés",
  "Elche CF (2846)": "Elche",
  "Atletico Levante UD (77407)": "Levante",
  "Real Oviedo (425591)": "Real Oviedo",

  // --- PREMIER LEAGUE ---
  "Arsenal FC (42)": "Arsenal",
  "Arsenal": "Arsenal",
  "Manchester City (17)": "Manchester City",
  "Manchester United (35)": "Manchester Utd",
  "Aston Villa (40)": "Aston Villa",
  "Liverpool (90134)": "Liverpool",
  "Brighton and Hove Albion (169150)": "Brighton",
  "Chelsea FC (36539)": "Chelsea",
  "Brentford (959123)": "Brentford",
  "AFC Bournemouth (60)": "Bournemouth",
  "Everton FC (48)": "Everton",
  "Sunderland AFC (41)": "Sunderland",
  "Fulham FC (36548)": "Fulham",
  "Crystal Palace (290396)": "Crystal Palace",
  "Newcastle United (39)": "Newcastle",
  "Leeds United (34)": "Leeds Utd",
  "Nottingham Forest (14)": "Nottingham Forest",
  "West Ham United (37)": "West Ham",
  "Tottenham Hotspur (33)": "Tottenham",
  "Burnley FC (36550)": "Burnley",
  "Wolverhampton Wanderers (3)": "Wolves",

  // --- BUNDESLIGA ---
  "Bayern Munich (2672)": "Bayern Múnich",
  "Borussia Dortmund (1281319)": "Borussia Dortmund",
  "RB Leipzig (599780)": "RB Leipzig",
  "VfB Stuttgart (1151795)": "Stuttgart",
  "TSG Hoffenheim (36652)": "Hoffenheim",
  "Bayer Leverkusen (36623)": "Bayer Leverkusen",
  "SC Freiburg (2538)": "Friburgo",
  "FC Augsburg (2600)": "Augsburgo",
  "FSV Mainz (2556)": "Mainz",
  "Union Berlin (2547)": "Union Berlin",
  "1. FC Cologne (2671)": "Colonia",
  "Borussia Monchengladbach (2527)": "Borussia M'gladbach",
  "Hamburger SV (43695)": "Hamburgo",
  "Werder Bremen (43694)": "Werder Bremen",
  "FC St. Pauli (52878)": "St. Pauli",
  "VfL Wolfsburg (43706)": "Wolfsburgo",
  "1. FC Heidenheim (213962)": "Heidenheim",

  // --- SERIE A ---
  "Inter Milano (1175363)": "Inter",
  "AC Milan (502832)": "AC Milan",
  "Juventus Turin (1175365)": "Juventus",
  "Como 1907 (224570)": "Como",
  "AS Roma (509432)": "Roma",
  "Atalanta BC (72070)": "Atalanta",
  "Lazio Rome (2699)": "Lazio",
  "Sassuolo Calcio (2793)": "Sassuolo",
  "Udinese Calcio (79057)": "Udinese",
  "Torino FC (466279)": "Torino",
  "Genoa CFC (2713)": "Genoa",
  "Parma Calcio (924573)": "Parma",
  "ACF Fiorentina (373090)": "Fiorentina",
  "Cagliari Calcio (2719)": "Cagliari",
  "US Cremonese (2761)": "Cremonese",
  "US Lecce (2689)": "Lecce",
  "Hellas Verona (2701)": "Verona",
  "Pisa SC (2737)": "Pisa",

  // --- LIGUE 1 ---
  "RC Lens (864167)": "Lens",
  "RC Lens": "Lens",
  "Racing Lens": "Lens",
  "Racing Club de Lens": "Lens",
  "Olympique Lyon (26245)": "Lyon",
  "Olympique Lyon": "Lyon",
  "Lille OSC (1643)": "Lille",
  "Lille OSC": "Lille",
  "Stade Rennais FC (1312354)": "Stade Rennais",
  "Olympique Marseille (1641)": "Marsella",
  "Olympique Marseille": "Marsella",
  "AS Monaco (463917)": "Mónaco",
  "Strasbourg Alsace (1659)": "Estrasburgo",
  "FC Lorient (864171)": "Lorient",
  "Paris FC (308650)": "Paris FC",
  "Toulouse FC (441708)": "Toulouse",
  "Stade Brest 29 (1715)": "Brest",
  "Angers SCO (453075)": "Angers",
  "Le Havre AC (1662)": "Le Havre",
  "OGC Nice (406491)": "Niza",
  "AJ Auxerre (1271688)": "Auxerre",
  "FC Nantes (1647)": "Nantes",
  "FC Metz (495636)": "Metz",
  "Paris Saint-Germain": "PSG",
  "Paris Saint Germain": "PSG",
  "Paris SG": "PSG",
  "Paris Saint Germain (1644)": "PSG",

  // --- EREDIVISIE ---
  "Feyenoord Rotterdam (817572)": "Feyenoord",
  "NEC Nijmegen (802518)": "Nijmegen",
  "FC Twente Enschede (55511)": "Twente",
  "Ajax Amsterdam (90118)": "Ajax",
  "AZ Alkmaar (363852)": "AZ Alkmaar",
  "FC Utrecht (2948)": "Utrecht",
  "SC Heerenveen (178258)": "Heerenveen",
  "FC Groningen (1300190)": "Groningen",
  "Sparta Rotterdam (2960)": "Sparta Rotterdam",
  "Fortuna Sittard (802542)": "Sittard",
  "PEC Zwolle (2971)": "Zwolle",
  "FC Volendam (2968)": "FC Volendam",
  "SC Telstar (2972)": "Telstar",
  "NAC Breda (1151685)": "Breda",
  "Heracles Almelo (2977)": "Heracles"
};

/**
 * Normaliza el nombre de un equipo para que siempre coincida con la "Fuente de Verdad" (Diccionario Maestro)
 */
export function normalizeTeamName(name: string): string {
  if (!name) return "";
  
  // 1. Limpieza inicial: quitar números entre paréntesis o al final (IDs de la API)
  let cleanName = name.replace(/\s*\(\d+\)$/g, "").trim();
  cleanName = cleanName.replace(/\s*\d+$/g, "").trim();
  
  // 2. Buscamos en el mapa ignorando mayúsculas/minúsculas
  const entries = Object.entries(TEAM_NAME_MAP);
  const match = entries.find(([key]) => key.toLowerCase() === cleanName.toLowerCase());
  
  if (match) {
    return match[1];
  }

  // 3. Si no hay mapeo, intentamos quitar prefijos comunes y volver a buscar
  const genericClean = cleanName.replace(/\b(FC|CF|SSC|AC|AS|UD|CD|RC|SC|AFC|Club|de|OSC|AJ|Olympique)\b/gi, "").trim();
  const genericMatch = entries.find(([key]) => {
    const cleanKey = key.replace(/\s*\(\d+\)$/g, "").replace(/\b(FC|CF|SSC|AC|AS|UD|CD|RC|SC|AFC|Club|de|OSC|AJ|Olympique)\b/gi, "").trim();
    return cleanKey.toLowerCase() === genericClean.toLowerCase();
  });
  
  if (genericMatch) {
    return genericMatch[1];
  }

  // 4. Como último recurso, devolvemos la limpieza genérica
  return genericClean || cleanName;
}

/**
 * Normaliza nombres de ligas si es necesario
 */
export function normalizeLeagueName(name: string): string {
  if (!name) return "";
  const n = name.trim();
  if (n.includes("LaLiga EA Sports")) return "LaLiga";
  if (n.includes("LaLiga Hypermotion")) return "Segunda División";
  return n;
}
