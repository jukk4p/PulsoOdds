import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Traduce términos de apuestas del inglés al español
 */
export function translateBettingTerm(term: string): string {
  if (!term) return term;

  const cleanTerm = term.trim().toUpperCase().replace(/\.+$/, '');

  // 1. Diccionario de frases exactas (Prioridad absoluta)
  const dictionary: Record<string, string> = {
    // Mercados Principales
    "ML": "Ganador del Partido",
    "MONEY LINE": "Ganador del Partido",
    "MATCH RESULT": "Ganador del Partido",
    "1X2": "Ganador del Partido",
    "DOUBLE CHANCE": "Doble Oportunidad",
    "DRAW NO BET": "Empate Apuesta No Válida",
    "DNB": "Empate Apuesta No Válida",
    "SPREAD": "Hándicap Asiático",
    "ASIAN HANDICAP": "Hándicap Asiático",
    "TOTALS": "Total de Goles (Over/Under)",
    "GOALS OVER/UNDER": "Goles Más/Menos",
    "ALTERNATIVE TOTAL GOALS": "Total de Goles (Alternativo)",
    "BOTH TEAMS TO SCORE": "Ambos Equipos Anotan",
    "BTTS": "Ambos Equipos Anotan",
    "BTTS - YES": "Ambos Equipos Anotan - SÍ",
    "BTTS - NO": "Ambos Equipos Anotan - NO",
    "1ST HALF - BOTH TEAMS TO SCORE": "Ambos Marcan (1ª Parte)",
    "HALF TIME RESULT": "Resultado al Descanso",
    "SPREAD HT": "Hándicap Asiático (1ª Parte)",
    "TOTALS HT": "Total de Goles (1ª Parte)",
    "EUROPEAN HANDICAP": "Hándicap Europeo",
    "EXACT TOTAL GOALS": "Total Exacto de Goles",
    "NUMBER OF GOALS IN MATCH": "Número de Goles",
    
    // Córners
    "CORNERS": "Saques de Esquina",
    "ASIAN CORNERS": "Córners Asiáticos",
    "TOTAL CORNERS": "Total de Córners",
    "CORNERS TOTALS": "Total de Córners (O/U)",
    "CORNERS TOTALS HT": "Córners (1ª Parte)",
    "CORNERS RACE": "Carrera a Córners",
    "CORNERS SPREAD": "Hándicap de Córners",
    "CORNER HANDICAP": "Hándicap de Córners",
    "TEAM CORNERS HOME": "Córners Local",
    "TEAM CORNERS AWAY": "Córners Visitante",
    
    // Tarjetas
    "NUMBER OF CARDS IN MATCH": "Total de Tarjetas",
    "ASIAN TOTAL CARDS": "Tarjetas Asiáticas",
    "CARD HANDICAP": "Hándicap de Tarjetas",
    "PLAYER TO BE BOOKED": "Jugador Amonestado",
    "PLAYER CARDS": "Tarjetas de Jugador",
    "TEAM CARDS HOME": "Tarjetas Local",
    "TEAM CARDS AWAY": "Tarjetas Visitante",
    
    // Jugadores / Props
    "ANYTIME GOALSCORER": "Jugador Anota (Cualquier momento)",
    "FIRST GOALSCORER": "Primer Goleador",
    "TEAM GOALSCORER": "Goleador del Equipo",
    "PLAYER SHOTS": "Remates de Jugador",
    "PLAYER SHOTS ON TARGET": "Remates a Puerta (Jugador)",
    "PLAYER PASSES": "Pases de Jugador",
    "PLAYER TACKLES": "Entradas de Jugador",
    "PLAYER FOULS COMMITTED": "Faltas Cometidas (Jugador)",
    "PLAYER TO BE FOULED": "Jugador Recibe Falta",
    "PLAYER TO SCORE OR ASSIST": "Gol o Asistencia (Jugador)",
    
    // Otros / Estadísticas
    "TEAM TOTAL GOALS HOME": "Goles Local (O/U)",
    "TEAM TOTAL GOALS AWAY": "Goles Visitante (O/U)",
    "MATCH SHOTS": "Remates Totales",
    "MATCH SHOTS ON TARGET": "Remates a Puerta Totales",
    "MATCH OFFSIDES": "Fueras de Juego",
    "GOALKEEPER SAVES": "Paradas del Portero",
    "GOAL METHOD": "Método del Gol",
    "FIRST 10 MINUTES (00:00 - 09:59)": "Primeros 10 Minutos",
    "OVER": "Más de",
    "UNDER": "Menos de",
    "DRAW": "Empate",
    "SÍ": "SÍ",
    "NO": "NO"
  };

  if (dictionary[cleanTerm]) return dictionary[cleanTerm];

  // 2. Normalización de frases largas / verbosas
  let translated = term;

  const complexPatterns: [RegExp, string][] = [
    [/AMBOS EQUIPOS (ANOTAN|ANOTARÁN|MARCAN|MARCARÁN).*/gi, "Ambos marcan"],
    [/EL PARTIDO TENDRÁ (MÁS|MENOS) DE ([\d.]+).*/gi, "$1 de $2 goles"],
    [/(MÁS|MENOS) DE ([\d.]+) GOLES.*/gi, "$1 de $2 goles"],
    [/(.*)\s+GANARÁ EN LA PRIMERA PARTE/gi, "$1 gana 1ª Mitad"],
    [/(.*)\s+(VENCERÁ|GANARÁ|GANA)\s+(EL PARTIDO|EL|PARTIDO)$/gi, "$1 gana"],
    [/.*HAN MOSTRADO PARIDAD EN ENCUENTROS ANTERIORES.*/gi, "Empate"],
  ];

  for (const [pattern, replacement] of complexPatterns) {
    if (pattern.test(translated)) {
      return translated.replace(pattern, replacement).trim();
    }
  }

  // 3. Traducción de términos comunes
  const commonTerms: Record<string, string> = {
    "Yes": "Sí",
    "No": "No",
    "Draw": "Empate",
    "Home": "Local",
    "Away": "Visitante"
  };

  Object.entries(commonTerms).forEach(([eng, esp]) => {
     const regex = new RegExp(`\\b${eng}\\b`, 'gi');
     translated = translated.replace(regex, esp);
  });

  return translated;
}

/**
 * Diccionario maestro para la traducción de Países y Ligas
 */
const leagueDictionary: Record<string, string> = {
  // Países
  'England': 'Inglaterra',
  'Spain': 'España',
  'Italy': 'Italia',
  'Germany': 'Alemania',
  'France': 'Francia',
  'Portugal': 'Portugal',
  'Netherlands': 'Países Bajos',
  'Belgium': 'Bélgica',
  'Brazil': 'Brasil',
  'Argentina': 'Argentina',
  'USA': 'Estados Unidos',
  'Turkey': 'Turquía',
  'Greece': 'Grecia',
  'Mexico': 'México',
  'Saudi Arabia': 'Arabia Saudí',
  'World': 'Internacional',
  // Competiciones
  'UEFA Champions League': 'Champions League',
  'UEFA Europa League': 'Europa League',
  'UEFA Europa Conference League': 'Conference League',
  'World Cup': 'Copa del Mundo',
  'Euro Championship': 'Eurocopa',
  'Copa America': 'Copa América',
  'Friendlies': 'Amistosos',
  'Club Friendlies': 'Amistosos de Clubes',
  'La Liga': 'LaLiga',
  'Premier League': 'Premier League',
  'Serie A': 'Serie A',
  'Bundesliga': 'Bundesliga',
  'Ligue 1': 'Ligue 1',
  'MLS': 'MLS',
};

/**
 * Mapa de logos de ligas para forzar el uso de logos locales si la API manda basura
 */
export const leagueLogoMap: Record<string, string> = {
  "ESPAÑA - LALIGA": "/logos/leagues/laliga.png",
  "ESPAÑA - LALIGA HYPERMOTION": "/logos/leagues/laliga_2.png",
  "INGLATERRA - PREMIER LEAGUE": "/logos/leagues/premier.png",
  "ITALIA - SERIE A": "/logos/leagues/serie_a.png",
  "ALEMANIA - BUNDESLIGA": "/logos/leagues/bundesliga.png",
  "FRANCIA - LIGUE 1": "/logos/leagues/ligue_1.png",
  "CHAMPIONS LEAGUE": "/logos/leagues/champions.png",
  "EUROPA LEAGUE": "/logos/leagues/europa_league.png",
  "CONFERENCE LEAGUE": "/logos/leagues/conference.png",
};

/**
 * Traduce y normaliza nombres de ligas y competiciones.
 * Maneja formatos simples ("England") y compuestos ("England - Premier League").
 */
export function translateLeagueName(leagueName: string | undefined): string {
  if (!leagueName) return "";
  
  // Si el nombre contiene el separador " - ", traducimos cada parte
  if (leagueName.includes(' - ')) {
    const [country, competition] = leagueName.split(' - ');
    const translatedCountry = leagueDictionary[country.trim()] || country.trim();
    const translatedComp = leagueDictionary[competition.trim()] || competition.trim();
    return `${translatedCountry} - ${translatedComp}`;
  }

  // Traducción directa
  return leagueDictionary[leagueName.trim()] || leagueName.trim();
}

export interface PickStats {
  totalStake: number;
  totalProfit: number;
  roi: number;
  winRate: number;
  currentStreak: number;
}

export function calculateStats(picks: any[]): PickStats {
  const resolvedPicks = picks.filter(p => p.status !== 'pending' && p.status !== 'void');
  const totalStake = resolvedPicks.reduce((acc, p) => acc + p.stake, 0);
  
  let totalProfit = 0;
  let wins = 0;
  
  resolvedPicks.forEach(p => {
    const decimalOdds = normalizeOdds(p.odds);
    if (p.status === 'won') {
      totalProfit += (p.stake * decimalOdds) - p.stake;
      wins++;
    } else if (p.status === 'lost') {
      totalProfit -= p.stake;
    }
  });

  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
  const winRate = resolvedPicks.length > 0 ? (wins / resolvedPicks.length) * 100 : 0;

  // Streak calculation (descending match_date order)
  let currentStreak = 0;
  const sortedPicks = [...picks].sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
  
  if (sortedPicks.length > 0) {
    const firstStatus = sortedPicks[0].status;
    if (firstStatus !== 'pending' && firstStatus !== 'void') {
      for (const p of sortedPicks) {
        if (p.status === firstStatus) {
          currentStreak++;
        } else if (p.status !== 'void') {
          break;
        }
      }
      if (firstStatus === 'lost') currentStreak = -currentStreak;
    }
  }

  return { totalStake, totalProfit, roi, winRate, currentStreak };
}

/**
 * Diccionario maestro para la traducción de Equipos (Normalización total)
 */
const teamDictionary: Record<string, string> = {
  // La Liga
  'FC Barcelona (77889)': 'FC Barcelona',
  'Real Madrid (120854)': 'Real Madrid',
  'Villarreal CF (224740)': 'Villarreal CF',
  'Atletico Madrid (72022)': 'Atlético de Madrid',
  'Real Betis Balompie (388582)': 'Real Betis',
  'RC Celta de Vigo (2821)': 'Celta de Vigo',
  'Real Sociedad (1175987)': 'Real Sociedad',
  'Getafe CF (154822)': 'Getafe CF',
  'CA Osasuna (2820)': 'CA Osasuna',
  'CD Espanyol Barcelona (506008)': 'RCD Espanyol',
  'Athletic Bilbao (1086332)': 'Athletic Club',
  'Girona FC (24264)': 'Girona FC',
  'Rayo Vallecano (825968)': 'Rayo Vallecano',
  'Valencia CF (77909)': 'Valencia CF',
  'RCD Mallorca (2826)': 'RCD Mallorca',
  'Sevilla FC (2833)': 'Sevilla FC',
  'Deportivo Alaves (475488)': 'Deportivo Alavés',
  'Elche CF (2846)': 'Elche CF',
  'Atletico Levante UD (77407)': 'Levante UD',
  'Real Oviedo (425591)': 'Real Oviedo',
  // Premier League
  'Arsenal FC (42)': 'Arsenal FC',
  'Manchester City (17)': 'Manchester City',
  'Manchester United (35)': 'Manchester United',
  'Aston Villa (40)': 'Aston Villa',
  'Liverpool (90134)': 'Liverpool FC',
  'Chelsea FC (36539)': 'Chelsea FC',
  'Brentford (959123)': 'Brentford FC',
  'AFC Bournemouth (60)': 'AFC Bournemouth',
  'Bright Brighton and Hove Albion (169150)': 'Brighton & Hove Albion',
  'Everton FC (48)': 'Everton FC',
  'Sunderland AFC (41)': 'Sunderland AFC',
  'Fulham FC (36548)': 'Fulham FC',
  'Crystal Palace (290396)': 'Crystal Palace',
  'Newcastle United (39)': 'Newcastle United',
  'Leeds United (217974)': 'Leeds United',
  'Nottingham Forest (14)': 'Nottingham Forest',
  'West Ham United (37)': 'West Ham United',
  'Tottenham Hotspur (33)': 'Tottenham Hotspur',
  'Burnley FC (36550)': 'Burnley FC',
  'Wolverhampton Wanderers (3)': 'Wolverhampton Wanderers',
  // Bundesliga
  'Bayern Munich (2672)': 'Bayern Múnich',
  'Borussia Dortmund (1281319)': 'Borussia Dortmund',
  'RB Leipzig (599780)': 'RB Leipzig',
  'VfB Stuttgart (1151795)': 'VfB Stuttgart',
  'TSG Hoffenheim (36652)': 'TSG Hoffenheim',
  'Bayer Leverkusen (36623)': 'Bayer Leverkusen',
  'Eintracht Frankfurt (43733)': 'Eintracht Fráncfort',
  'SC Freiburg (2538)': 'SC Friburgo',
  'FC Augsburg (2600)': 'FC Augsburgo',
  'FSV Mainz (2556)': 'FSV Maguncia 05',
  'Union Berlin (2547)': 'Union Berlín',
  '1. FC Cologne (2671)': '1. FC Colonia',
  'Hamburger SV (43695)': 'Hamburgo SV',
  'Werder Bremen (43694)': 'Werder Bremen',
  'Borussia Monchengladbach (2527)': 'Borussia Mönchengladbach',
  'FC St. Pauli (52878)': 'FC St. Pauli',
  'VfL Wolfsburg (43706)': 'VfL Wolfsburgo',
  '1. FC Heidenheim (213962)': '1. FC Heidenheim',
  // Serie A
  'Inter Milano (1175363)': 'Inter de Milán',
  'SSC Napoli (2714)': 'SSC Nápoles',
  'AC Milan (502832)': 'AC Milán',
  'Juventus Turin (1175365)': 'Juventus',
  'Como 1907 (224570)': 'Como 1907',
  'AS Roma (509432)': 'AS Roma',
  'Atalanta BC (72070)': 'Atalanta BC',
  'Bologna FC (1055371)': 'Bologna FC',
  'Lazio Rome (2699)': 'SS Lazio',
  'Sassuolo Calcio (2793)': 'Sassuolo',
  'Udinese Calcio (79057)': 'Udinese',
  'Torino FC (466279)': 'Torino FC',
  'Parma Calcio (924573)': 'Parma',
  'Genoa CFC (2713)': 'Genoa CFC',
  'ACF Fiorentina (373090)': 'ACF Fiorentina',
  'Cagliari Calcio (2719)': 'Cagliari',
  'US Cremonese (2761)': 'US Cremonese',
  'US Lecce (2689)': 'US Lecce',
  'Hellas Verona (2701)': 'Hellas Verona',
  'Pisa SC (2737)': 'Pisa SC',
  // Ligue 1
  'Paris Saint-Germain (55505)': 'Paris Saint-Germain',
  'RC Lens (864167)': 'RC Lens',
  'Lille OSC (1643)': 'Lille OSC',
  'Olympique Marseille (1641)': 'Olympique de Marsella',
  'Olympique Lyon (26245)': 'Olympique de Lyon',
  'Stade Rennais FC (1312354)': 'Stade Rennais',
  'AS Monaco (463917)': 'AS Mónaco',
  'Strasbourg Alsace (1659)': 'RC Estrasburgo',
  'FC Lorient (864171)': 'FC Lorient',
  'Toulouse FC (441708)': 'Toulouse FC',
  'Stade Brest 29 (1715)': 'Stade Brest',
  'Paris FC (308650)': 'Paris FC',
  'Angers SCO (453075)': 'Angers SCO',
  'Le Havre AC (1662)': 'Le Havre AC',
  'OGC Nice (406491)': 'OGC Niza',
  'AJ Auxerre (1271688)': 'AJ Auxerre',
  'FC Nantes (1647)': 'FC Nantes',
  'FC Metz (495636)': 'FC Metz',
  // Ligue 2 & Otros Francia
  'Paris': 'Paris FC',
  'Laval (1671)': 'Stade Lavallois',
  'Grenoble (1675)': 'Grenoble Foot 38',
  'Amiens (1677)': 'Amiens SC',
  'Guingamp (1645)': 'EA Guingamp',
  'Caen (1653)': 'SM Caen',
  'Troyes (1655)': 'ESTAC Troyes',
  'Bordeaux (1649)': 'Girondins de Burdeos',
  // Segunda División
  'UD Almeria (516740)': 'UD Almería',
  'Racing Santander (2835)': 'Racing de Santander',
  'SD Huesca (24265)': 'SD Huesca',
  'RC Deportivo De La Coruna (2832)': 'RC Deportivo',
  'UD Las Palmas (6577)': 'UD Las Palmas',
  'Sporting Gijon (2852)': 'Sporting de Gijón',
  'Real Valladolid (2831)': 'Real Valladolid CF',
  'Real Zaragoza (439736)': 'Real Zaragoza',
  'CD Tenerife (368994)': 'CD Tenerife',
  'Granada CF (114819)': 'Granada CF',
  'CD Lugo (24332)': 'CD Lugo',
  'Burgos CF (2854)': 'Burgos CF',
  'CD Mirandes (35092)': 'CD Mirandés',
  'CD Leganes (427515)': 'CD Leganés',
  'SD Ponferradina (6195)': 'SD Ponferradina',
  'FC Cartagena (24329)': 'FC Cartagena',
  'Club Deportivo Eldense (47321)': 'CE Eldense',
  'SD Amorebieta (54103)': 'SD Amorebieta',
  // Variaciones detectadas en API/Screenshot
  'Real Betis Seville': 'Real Betis',
  'Racing Club De Lens': 'RC Lens',
  'Racing Club de Lens': 'RC Lens',
  'Olympique Marseille': 'Olympique de Marsella',
  'Olympique Lyon': 'Olympique de Lyon',
  'Stade Rennais': 'Stade Rennais',
  'Andorra (4818)': 'FC Andorra'
};

/**
 * Limpia y normaliza el nombre de un equipo (p.ej. "FC Bayern Munich" -> "Bayern Múnich")
 */
export function formatTeamName(name: string): string {
  if (!name) return name;

  // 1. Traducción directa desde Diccionario Maestro (Prioridad)
  const trimmedName = name.trim();
  if (teamDictionary[trimmedName]) return teamDictionary[trimmedName];

  // 2. Limpieza genérica si no está en el diccionario
  let formatted = name;

  // Quitar prefijos y sufijos comunes de clubes que ensucian la UI
  const noise = [
    /\bFC\b/gi, /\bCF\b/gi, /\bSSC\b/gi, /\bAC\b/gi, /\bAS\b/gi, /\bUD\b/gi, 
    /\bCD\b/gi, /\bRC\b/gi, /\b1\.\s/g, /\bSC\b/gi, /\bAFC\b/gi, /\bCLUB\b/gi, /\bDE\b/gi,
    /\bSEVILLE\b/gi, /\bBALOMPIE\b/gi,
    /\s*\d+$/g // Quitar números al final (Brest 29 -> Brest)
  ];
  
  noise.forEach(pattern => {
    formatted = formatted.replace(pattern, '');
  });

  return formatted.trim();
}

/**
 * Formatea un encuentro completo (p.ej. "FC St. Pauli vs 1. FC Köln" -> "St. Pauli vs Colonia")
 */
export function formatMatchName(match: string): string {
  if (!match) return match;
  if (!match.toLowerCase().includes(' vs ')) return formatTeamName(match);

  const [home, away] = match.split(/\s+vs\s+/i);
  return `${formatTeamName(home)} vs ${formatTeamName(away)}`;
}

/**
 * Normaliza cualquier formato de cuota a Decimal (European)
 * Maneja: American (+150, -110), Fractional (1/2), o Decimal string ("1.5")
 */
export function normalizeOdds(odds: string | number | null | undefined): number {
  if (odds == null || odds === "") return 1.0;
  
  const oddsStr = String(odds).trim();
  
  // 1. Caso Fraccional (ej: "1/2")
  if (oddsStr.includes('/')) {
    const [num, den] = oddsStr.split('/').map(val => parseFloat(val.trim()));
    return num && den && !isNaN(num) && !isNaN(den) ? (num / den) + 1 : 1.0;
  }
  
  const oddsNum = parseFloat(oddsStr.replace(',', '.'));
  
  if (isNaN(oddsNum)) return 1.0;

  // 2. Caso Americano (ej: +150 o -110)
  // Las americanas suelen ser >= 100 o <= -100
  if (Math.abs(oddsNum) >= 100) {
    if (oddsNum > 0) {
      return (oddsNum / 100) + 1;
    } else {
      return (100 / Math.abs(oddsNum)) + 1;
    }
  }
  
  // 3. Ya es Decimal (o un valor pequeño < 100)
  return oddsNum;
}

export function normalizeBettingPick(text: string): string {
  if (!text) return text;
  
  // 1. Traducir/Normalizar frases completas primero (usando nuestro diccionario pro)
  let normalized = translateBettingTerm(text);
  
  // 2. Limpieza de hándicaps feos: "LOCAL (HDP -1.75)" o "LOCAL (-1.75)" -> "LOCAL -1.75"
  // Esta regex es más robusta: captura (HDP -2), (Hdp -2), (Hándicap -2) y (-2)
  normalized = normalized.replace(/\((?:HDP|H\u00C1NDICAP|HANDICAP|H\u00C1ND)?\s*([+-]?[\d.]+)\)/gi, '$1');
  
  // Limpieza de espacios dobles que puedan quedar
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // 3. Si sigue siendo muy largo, limpiar ruido residual (Solo frases muy específicas)
  const noise = [
    /\bEN EL PARTIDO\b/gi,
    /\bEL PARTIDO TENDRÁ\b/gi,
    /\bANOTARÁN EN EL PARTIDO\b/gi,
    /\bEL$/gi, // "EL" suelto al final
    /\.+$/g    // Puntos al final
  ];
  
  noise.forEach(pattern => {
    normalized = normalized.replace(pattern, '');
  });
  
  return normalized.trim();
}

/**
 * Reemplaza términos genéricos (LOCAL/VISITANTE) por el nombre real del equipo
 */
export function substituteTeamNames(pickText: string, matchName: string | undefined): string {
  if (!pickText || !matchName || !matchName.toLowerCase().includes(' vs ')) {
    return pickText;
  }
  
  const [home, away] = matchName.split(/\s+vs\s+/i);
  let result = pickText;
  
  // Reemplazar LOCAL/HOME (con regex para ser precisos)
  result = result.replace(/\b(LOCAL|HOME)\b/gi, formatTeamName(home));
  
  // Reemplazar VISITANTE/AWAY
  result = result.replace(/\b(VISITANTE|AWAY|VISITOR)\b/gi, formatTeamName(away));
  
  return result;
}
