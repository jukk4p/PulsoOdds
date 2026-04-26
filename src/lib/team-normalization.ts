/**
 * DICCIONARIO MAESTRO DE NORMALIZACIÓN - PulsoOdds
 * Fuente de Verdad: diccionario_maestro_equipos.md
 */

const ALIAS: Record<string, string> = {
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

/**
 * Normaliza el nombre de un equipo para que siempre coincida con el Nombre Público
 */
export function normalizeTeamName(name: string): string {
  if (!name) return "UNKNOWN";
  const c = clean(name);
  for (const [key, val] of Object.entries(ALIAS)) {
    if (clean(key) === c) return val;
  }
  const genericClean = name
    .replace(/\b(FC|CF|SSC|AC|AS|UD|CD|RC|SC|AFC|Club|de|OSC|AJ|Olympique)\b/gi, "")
    .trim();
  return genericClean || name;
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
