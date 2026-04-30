/**
 * DICCIONARIO MAESTRO DE NORMALIZACIÓN - PulsoOdds
 * Fuente de Verdad: diccionario_maestro_equipos.md
 */

const ALIAS: Record<string, string> = {
  "fc barcelona": "Barcelona",
  "fc barcelona (77889)": "Barcelona",
  "real madrid": "Real Madrid",
  "real madrid (120854)": "Real Madrid",
  "villarreal cf": "Villarreal",
  "villarreal cf (224740)": "Villarreal",
  "atletico de madrid": "Atlético de Madrid",
  "real betis": "Real Betis",
  "real betis seville": "Real Betis",
  "celta de vigo": "Celta de Vigo",
  "rc celta de vigo (2821)": "Celta de Vigo",
  "real sociedad": "Real Sociedad",
  "real sociedad san sebastian": "Real Sociedad",
  "getafe cf": "Getafe",
  "getafe cf (154822)": "Getafe",
  "athletic bilbao": "Athletic Club",
  "athletic bilbao (1086332)": "Athletic Club",
  "ca osasuna": "Osasuna",
  "ca osasuna (2820)": "Osasuna",
  "girona fc": "Girona",
  "girona fc (24264)": "Girona",
  "espanyol": "Espanyol",
  "espanyol barcelona": "Espanyol",
  "valencia cf": "Valencia",
  "valencia cf (77909)": "Valencia",
  "rcd mallorca": "Mallorca",
  "rcd mallorca (2826)": "Mallorca",
  "rayo vallecano": "Rayo Vallecano",
  "rayo vallecano (825968)": "Rayo Vallecano",
  "sevilla fc": "Sevilla",
  "sevilla fc (2833)": "Sevilla",
  "alaves": "Alavés",
  "deportivo alaves (475488)": "Alavés",
  "elche cf": "Elche",
  "elche cf (2846)": "Elche",
  "levante ud": "Levante",
  "atletico levante ud (77407)": "Levante",
  "real oviedo": "Real Oviedo",
  "real oviedo (425591)": "Real Oviedo",
  "arsenal fc": "Arsenal",
  "arsenal fc (42)": "Arsenal",
  "manchester city": "Manchester City",
  "manchester city (17)": "Manchester City",
  "manchester utd": "Manchester Utd",
  "manchester united (35)": "Manchester Utd",
  "aston villa": "Aston Villa",
  "aston villa (40)": "Aston Villa",
  "liverpool fc": "Liverpool",
  "brighton": "Brighton",
  "brighton & hove albion": "Brighton",
  "chelsea fc": "Chelsea",
  "chelsea fc (36539)": "Chelsea",
  "brentford fc": "Brentford",
  "afc bournemouth": "Bournemouth",
  "afc bournemouth (60)": "Bournemouth",
  "everton fc": "Everton",
  "everton fc (48)": "Everton",
  "sunderland afc": "Sunderland",
  "sunderland afc (41)": "Sunderland",
  "fulham fc": "Fulham",
  "fulham fc (36548)": "Fulham",
  "crystal palace": "Crystal Palace",
  "crystal palace (290396)": "Crystal Palace",
  "newcastle united": "Newcastle",
  "newcastle united (39)": "Newcastle",
  "leeds utd": "Leeds Utd",
  "leeds united (34)": "Leeds Utd",
  "nottingham forest": "Nottingham Forest",
  "nottingham forest (14)": "Nottingham Forest",
  "west ham united": "West Ham",
  "west ham united (37)": "West Ham",
  "tottenham hotspur": "Tottenham",
  "tottenham hotspur (33)": "Tottenham",
  "burnley fc": "Burnley",
  "burnley fc (36550)": "Burnley",
  "wolves": "Wolves",
  "wolverhampton wanderers (3)": "Wolves",
  "bayern munich": "Bayern Múnich",
  "bayern munich (2672)": "Bayern Múnich",
  "borussia dortmund": "Borussia Dortmund",
  "borussia dortmund (1281319)": "Borussia Dortmund",
  "rb leipzig": "RB Leipzig",
  "rb leipzig (599780)": "RB Leipzig",
  "vfb stuttgart": "Stuttgart",
  "vfb stuttgart (1151795)": "Stuttgart",
  "tsg hoffenheim": "Hoffenheim",
  "tsg hoffenheim (36652)": "Hoffenheim",
  "bayer leverkusen": "Bayer Leverkusen",
  "bayer leverkusen (36623)": "Bayer Leverkusen",
  "sc freiburg": "Friburgo",
  "sc freiburg (2538)": "Friburgo",
  "eintracht frankfurt": "Eintracht Fráncfort",
  "fc augsburg": "Augsburgo",
  "fc augsburg (2600)": "Augsburgo",
  "mainz": "Mainz",
  "fsv mainz (2556)": "Mainz",
  "union berlin": "Union Berlin",
  "union berlin (2547)": "Union Berlin",
  "1. fc cologne": "Colonia",
  "1. fc cologne (2671)": "Colonia",
  "borussia m'gladbach": "Borussia M'gladbach",
  "borussia monchengladbach (2527)": "Borussia M'gladbach",
  "hamburger sv": "Hamburgo",
  "hamburger sv (43695)": "Hamburgo",
  "werder bremen": "Werder Bremen",
  "werder bremen (43694)": "Werder Bremen",
  "fc st. pauli": "St. Pauli",
  "fc st. pauli (52878)": "St. Pauli",
  "vfl wolfsburg": "Wolfsburgo",
  "vfl wolfsburg (43706)": "Wolfsburgo",
  "1. fc heidenheim": "Heidenheim",
  "1. fc heidenheim (213962)": "Heidenheim",
  "inter milano": "Inter",
  "inter milano (1175363)": "Inter",
  "ac milan": "AC Milan",
  "ac milan (502832)": "AC Milan",
  "ssc napoli": "Nápoles",
  "juventus turin": "Juventus",
  "juventus turin (1175365)": "Juventus",
  "como 1907": "Como",
  "como 1907 (224570)": "Como",
  "as roma": "Roma",
  "as roma (509432)": "Roma",
  "atalanta bc": "Atalanta",
  "atalanta bc (72070)": "Atalanta",
  "bolonia": "Bolonia",
  "bologna fc": "Bolonia",
  "lazio rome": "Lazio",
  "lazio rome (2699)": "Lazio",
  "sassuolo calcio": "Sassuolo",
  "sassuolo calcio (2793)": "Sassuolo",
  "udinese calcio": "Udinese",
  "udinese calcio (79057)": "Udinese",
  "torino fc": "Torino",
  "torino fc (466279)": "Torino",
  "genoa cfc": "Genoa",
  "genoa cfc (2713)": "Genoa",
  "parma calcio": "Parma",
  "parma calcio (924573)": "Parma",
  "acf fiorentina": "Fiorentina",
  "acf fiorentina (373090)": "Fiorentina",
  "cagliari calcio": "Cagliari",
  "cagliari calcio (2719)": "Cagliari",
  "us cremonese": "Cremonese",
  "us cremonese (2761)": "Cremonese",
  "us lecce": "Lecce",
  "us lecce (2689)": "Lecce",
  "hellas verona": "Verona",
  "hellas verona (2701)": "Verona",
  "pisa sc": "Pisa",
  "pisa sc (2737)": "Pisa",
  "psg": "PSG",
  "paris saint-germain": "PSG",
  "racing club de lens": "Lens",
  "olympique lyon": "Lyon",
  "olympique lyon (26245)": "Lyon",
  "lille osc": "Lille",
  "lille osc (1643)": "Lille",
  "stade rennais fc (1312354)": "Stade Rennais",
  "olympique marseille": "Marsella",
  "olympique marseille (1641)": "Marsella",
  "as monaco (463917)": "Mónaco",
  "strasbourg alsace": "Estrasburgo",
  "strasbourg alsace (1659)": "Estrasburgo",
  "fc lorient": "Lorient",
  "fc lorient (864171)": "Lorient",
  "paris fc": "Paris FC",
  "paris fc (308650)": "Paris FC",
  "toulouse fc": "Toulouse",
  "toulouse fc (441708)": "Toulouse",
  "stade brest 29": "Brest",
  "stade brest 29 (1715)": "Brest",
  "angers sco": "Angers",
  "angers sco (453075)": "Angers",
  "le havre ac": "Le Havre",
  "le havre ac (1662)": "Le Havre",
  "ogc nice": "Niza",
  "ogc nice (406491)": "Niza",
  "aj auxerre": "Auxerre",
  "aj auxerre (1271688)": "Auxerre",
  "fc nantes": "Nantes",
  "fc nantes (1647)": "Nantes",
  "fc metz": "Metz",
  "fc metz (495636)": "Metz",
  "psv": "PSV",
  "psv eindhoven": "PSV",
  "feyenoord": "Feyenoord",
  "feyenoord rotterdam (817572)": "Feyenoord",
  "nijmegen": "Nijmegen",
  "nec nijmegen (802518)": "Nijmegen",
  "twente": "Twente",
  "fc twente enschede (55511)": "Twente",
  "ajax": "Ajax",
  "ajax amsterdam (90118)": "Ajax",
  "az alkmaar": "AZ Alkmaar",
  "az alkmaar (363852)": "AZ Alkmaar",
  "utrecht": "Utrecht",
  "fc utrecht (2948)": "Utrecht",
  "heerenveen": "Heerenveen",
  "sc heerenveen (178258)": "Heerenveen",
  "groningen": "Groningen",
  "fc groningen (1300190)": "Groningen",
  "sparta rotterdam": "Sparta Rotterdam",
  "sparta rotterdam (2960)": "Sparta Rotterdam",
  "g.a. eagles": "G.A. Eagles",
  "go ahead eagles": "G.A. Eagles",
  "sittard": "Sittard",
  "fortuna sittard (802542)": "Sittard",
  "zwolle": "Zwolle",
  "pec zwolle (2971)": "Zwolle",
  "fc volendam": "FC Volendam",
  "fc volendam (2968)": "FC Volendam",
  "excelsior": "Excelsior",
  "excelsior rotterdam": "Excelsior",
  "telstar": "Telstar",
  "sc telstar (2972)": "Telstar",
  "breda": "Breda",
  "nac breda (1151685)": "Breda",
  "heracles": "Heracles",
  "heracles almelo (2977)": "Heracles",
  "racing santander": "R. Racing Club",
  "rc deportivo de la coruna (445833)": "Deportivo de La Coruña",
  "ud almeria (516740)": "Almería",
  "cd castellon (5067)": "Castellón",
  "malaga cf (2830)": "Málaga",
  "burgos cf": "Burgos CF",
  "burgos cf (2854)": "Burgos CF",
  "ud las palmas": "Las Palmas",
  "sd eibar (2839)": "Eibar",
  "andorra cf": "Andorra",
  "sporting gijon": "Real Sporting",
  "cordoba cf (445831)": "Córdoba",
  "ad ceuta": "AD Ceuta",
  "ad ceuta (2869)": "AD Ceuta",
  "albacete bp": "Albacete",
  "granada cf": "Granada",
  "granada cf (114819)": "Granada",
  "cd leganes (427515)": "Leganés",
  "real sociedad san sebastian b": "Real Sociedad B",
  "real valladolid": "Real Valladolid",
  "real valladolid (2831)": "Real Valladolid",
  "cadiz cf (4488)": "Cádiz",
  "real zaragoza": "Real Zaragoza",
  "real zaragoza (439736)": "Real Zaragoza",
  "sd huesca": "Huesca",
  "sd huesca (24265)": "Huesca",
  "cd mirandes": "Mirandés",
  "cultural leonesa": "Cultural Leonesa",
  "cultural leonesa (2868)": "Cultural Leonesa",
  "coventry city": "Coventry",
  "coventry city (11)": "Coventry",
  "millwall fc": "Millwall",
  "ipswich town (397536)": "Ipswich",
  "southampton fc (502706)": "Southampton",
  "middlesbrough fc (37483)": "Middlesbrough",
  "wrexham afc (64)": "Wrexham",
  "hull city (96)": "Hull",
  "derby county (27)": "Derby",
  "norwich city (263)": "Norwich",
  "swansea city (74)": "Swansea",
  "bristol city (58)": "Bristol City",
  "queens park rangers": "QPR",
  "sheffield united": "Sheffield Utd",
  "birmingham city (9)": "Birmingham",
  "watford fc (24)": "Watford",
  "preston north end (21)": "Preston",
  "stoke city (29)": "Stoke",
  "west bromwich albion (43510)": "West Brom",
  "portsmouth fc (2)": "Portsmouth",
  "charlton athletic (47)": "Charlton",
  "blackburn rovers (46)": "Blackburn",
  "oxford utd lfc (372796)": "Oxford Utd",
  "leicester city (110507)": "Leicester",
  "sheffield wednesday (12)": "Sheffield Wed",
  "schalke 04 (2530)": "Schalke",
  "sc paderborn 07 (352788)": "Paderborn",
  "sv elversberg (447271)": "Elversberg",
  "hannover 96 (43700)": "Hannover",
  "sv darmstadt 98 (213966)": "Darmstadt",
  "hertha bsc (2528)": "Hertha BSC",
  "1. fc kaiserslautern (43723)": "Kaiserslautern",
  "karlsruher sc (2553)": "Karlsruher",
  "1 fc nuremberg (2523)": "Núremberg",
  "vfl bochum (43715)": "Bochum",
  "dynamo dresden (108717)": "Dynamo Dresden",
  "holstein kiel (43702)": "Kiel",
  "1 fc magdeburg (43698)": "Magdeburgo",
  "greuther furth (43725)": "Greuther Fürth",
  "arminia bielefeld (43718)": "Arminia Bielefeld",
  "eintracht braunschweig (2557)": "Braunschweig",
  "fortuna dusseldorf (43710)": "Fortuna Düsseldorf",
  "preussen munster (52881)": "Preussen Münster",
  "venezia (1278119)": "Venezia",
  "frosinone calcio (2801)": "Frosinone",
  "ac monza (1175343)": "Monza",
  "palermo fc (64119)": "Palermo",
  "us catanzaro (2796)": "Catanzaro",
  "juve stabia (5324)": "Juve Stabia",
  "cesena fc (2742)": "Cesena",
  "carrarese calcio (2745)": "Carrarese",
  "us avellino (2730)": "Avellino",
  "fc sudtirol bolzano (2760)": "Sudtirol",
  "mantova 1911 (2770)": "Mantova",
  "calcio padova (2741)": "Padova",
  "sampdoria genoa (2711)": "Sampdoria",
  "empoli fc (79045)": "Empoli",
  "virtus entella (90166)": "Entella",
  "ssc bari (2712)": "Bari",
  "spezia calcio (2735)": "Spezia",
  "estac troyes (1652)": "Troyes",
  "as saint-etienne (1678)": "Saint-Étienne",
  "le mans fc (1672)": "Le Mans",
  "stade reims (1682)": "Reims",
  "red star fc (52874)": "Red Star",
  "rodez aveyron football (6925)": "Rodez",
  "montpellier hsc (1642)": "Montpellier",
  "fc annecy (234888)": "Annecy",
  "pau fc (1685)": "Pau FC",
  "usl dunkerque (6918)": "Dunkerque",
  "ea guingamp (78501)": "EA Guingamp",
  "us boulogne (1711)": "Boulogne",
  "nancy-lorraine (1675)": "Nancy",
  "se palmeiras sp (1963)": "Palmeiras",
  "cr flamengo rj (5981)": "Flamengo",
  "fluminense fc rj (1961)": "Fluminense",
  "sao paulo fc sp (1981)": "Sao Paulo",
  "ec bahia ba (1955)": "Bahia",
  "ca paranaense pr (1967)": "Athletico-PR",
  "coritiba fc pr (1982)": "Coritiba",
  "red bull bragantino sp (1999)": "Bragantino",
  "botafogo fr rj (1958)": "Botafogo",
  "cr vasco da gama rj (1974)": "Vasco",
  "ec vitoria ba (1962)": "Vitória",
  "atletico mineiro mg (1977)": "Atlético-MG",
  "gremio fb porto alegrense rs (5926)": "Grêmio",
  "sc internacional rs (1966)": "Internacional",
  "santos fc sp (1968)": "Santos",
  "cruzeiro ec mg (1954)": "Cruzeiro",
  "sc corinthians sp (1957)": "Corinthians",
  "mirassol fc sp (21982)": "Mirassol",
  "clube do remo pa (2012)": "Remo",
  "chapecoense sc (21845)": "Chapecoense",
  "ec juventude rs (1980)": "Juventude",
  "san jose earthquakes (21825)": "San Jose Earthquakes",
  "vancouver whitecaps fc (22010)": "Vancouver Whitecaps",
  "los angeles fc (402227)": "Los Angeles FC",
  "minnesota united fc (41618)": "Minnesota United",
  "seattle sounders (22009)": "Seattle Sounders",
  "real salt lake (5133)": "Real Salt Lake",
  "colorado rapids (2510)": "Colorado Rapids",
  "fc dallas (2512)": "FC Dallas",
  "houston dynamo (2508)": "Houston Dynamo",
  "san diego fc (1217911)": "San Diego FC",
  "los angeles galaxy (2513)": "Los Angeles Galaxy",
  "portland timbers (22007)": "Portland Timbers",
  "austin fc (772256)": "Austin FC",
  "saint louis city sc (874725)": "St. Louis City",
  "sporting kansas city (2509)": "Sporting Kansas City",
  "nashville sc (668063)": "Nashville SC",
  "inter miami cf (659691)": "Inter Miami",
  "new england revolution (2511)": "New England Revolution",
  "chicago fire (2505)": "Chicago Fire",
  "charlotte fc (863473)": "Charlotte",
  "toronto fc (7080)": "Toronto FC",
  "new york city fc (167510)": "New York City",
  "new york red bulls (2506)": "New York Red Bulls",
  "columbus crew (2504)": "Columbus Crew",
  "dc united (2502)": "DC United",
  "fc cincinnati (245305)": "Cincinnati",
  "orlando city sc (52237)": "Orlando City",
  "cf montreal (22006)": "CF Montreal",
  "philadelphia union (39833)": "Philadelphia Union",
  "atlanta united fc (305920)": "Atlanta Utd"
};

/**
 * Función de limpieza ultra-robusta
 */
export const clean = (s: string | null | undefined): string => {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*\(\d+\)$/g, "")
    .replace(/[^a-z0-9]/g, '');
};

// Crear un mapa de búsqueda con claves ya limpias para O(1)
const LOOKUP: Record<string, string> = {};
Object.entries(ALIAS).forEach(([key, val]) => {
  LOOKUP[clean(key)] = val;
});

/**
 * Normaliza el nombre de un equipo para que siempre coincida con el Nombre Público
 */
export function normalizeTeamName(name: string): string {
  if (!name) return "UNKNOWN";
  const c = clean(name);
  
  // Intento 1: Búsqueda directa en el mapa normalizado
  if (LOOKUP[c]) return LOOKUP[c];

  // Intento 2: Limpieza genérica si no hay match
  const genericClean = name
    .replace(/\b(FC|CF|SSC|AC|AS|UD|CD|RC|SC|AFC|Club|de|OSC|AJ|Olympique)\b/gi, "")
    .trim();
    
  return genericClean || name;
}

/**
 * Normaliza cualquier texto que contenga nombres de equipos, reemplazando los alias conocidos
 * por sus Nombres Públicos. Útil para picks tipo "Real Madrid +0.5".
 */
export function normalizeTextWithTeams(text: string): string {
  if (!text) return text;

  let result = text;
  
  // Obtenemos todos los alias ordenados por longitud descendente para evitar reemplazos parciales
  // (ej: "Manchester United" antes que "Manchester")
  const sortedAliases = Object.keys(ALIAS).sort((a, b) => b.length - a.length);

  for (const alias of sortedAliases) {
    // Escapamos el alias para usarlo en un RegExp
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Usamos límites de palabra (\b) si es posible, pero cuidado con alias que terminan en puntos o números
    // Por simplicidad y robustez en este contexto, usamos el alias tal cual con 'gi'
    const regex = new RegExp(escapedAlias, 'gi');
    
    if (regex.test(result)) {
      result = result.replace(regex, ALIAS[alias]);
    }
  }

  return result;
}

/**
 * Normaliza nombres de ligas para que coincidan con los IDs técnicos de la Base de Datos
 */
export function normalizeLeagueName(name: string): string {
  if (!name) return "VARIOS";
  const n = name.toLowerCase();
  
  if ((n.includes("laliga") || n.includes("espana")) && !n.includes("2") && !n.includes("hypermotion")) return "Spain - LaLiga";
  if (n.includes("hypermotion") || n.includes("laliga2")) return "Spain - LaLiga2";
  if (n.includes("premier") || n.includes("inglaterra")) return "England - Premier League";
  if (n.includes("bundesliga") || n.includes("alemania")) return "Germany - Bundesliga";
  if (n.includes("serie a") && !n.includes("brazil")) return "Italy - Serie A";
  if (n.includes("ligue 1") || n.includes("francia")) return "France - Ligue 1";
  if (n.includes("eredivisie") || n.includes("holanda")) return "Netherlands - Eredivisie";
  if (n.includes("championship")) return "England - Championship";
  if (n.includes("usa") || n.includes("mls")) return "USA - MLS";
  
  return name.trim();
}
