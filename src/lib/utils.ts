import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { normalizeTeamName, normalizeLeagueName } from "./team-normalization";

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
 */
export function translateLeagueName(leagueName: string | undefined): string {
  if (!leagueName) return "";
  
  const normalized = normalizeLeagueName(leagueName);

  if (normalized.includes(' - ')) {
    const [country, competition] = normalized.split(' - ');
    const translatedCountry = leagueDictionary[country.trim()] || country.trim();
    const translatedComp = leagueDictionary[competition.trim()] || competition.trim();
    return `${translatedCountry} - ${translatedComp}`;
  }

  return leagueDictionary[normalized.trim()] || normalized.trim();
}

/**
 * Limpia y normaliza el nombre de un equipo
 */
export function formatTeamName(name: string): string {
  return normalizeTeamName(name);
}

/**
 * Formatea un encuentro completo
 */
export function formatMatchName(match: string): string {
  if (!match) return match;
  if (!match.toLowerCase().includes(' vs ')) return formatTeamName(match);

  const [home, away] = match.split(/\s+vs\s+/i);
  return `${formatTeamName(home)} vs ${formatTeamName(away)}`;
}

/**
 * Normaliza cualquier formato de cuota a Decimal (European)
 */
export function normalizeOdds(odds: string | number | null | undefined): number {
  if (odds == null || odds === "") return 1.0;
  
  const oddsStr = String(odds).trim();
  
  if (oddsStr.includes('/')) {
    const [num, den] = oddsStr.split('/').map(val => parseFloat(val.trim()));
    return num && den && !isNaN(num) && !isNaN(den) ? (num / den) + 1 : 1.0;
  }
  
  const oddsNum = parseFloat(oddsStr.replace(',', '.'));
  if (isNaN(oddsNum)) return 1.0;

  if (Math.abs(oddsNum) >= 100) {
    if (oddsNum > 0) return (oddsNum / 100) + 1;
    else return (100 / Math.abs(oddsNum)) + 1;
  }
  
  return oddsNum;
}

export function normalizeBettingPick(text: string): string {
  if (!text) return text;
  
  let normalized = translateBettingTerm(text);
  normalized = normalized.replace(/\((?:HDP|H\u00C1NDICAP|HANDICAP|H\u00C1ND)?\s*([+-]?[\d.]+)\)/gi, '$1');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  const noise = [
    /\bEN EL PARTIDO\b/gi,
    /\bEL PARTIDO TENDRÁ\b/gi,
    /\bANOTARÁN EN EL PARTIDO\b/gi,
    /\bEL$/gi,
    /\.+$/g
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
  
  result = result.replace(/\b(LOCAL|HOME)\b/gi, formatTeamName(home));
  result = result.replace(/\b(VISITANTE|AWAY|VISITOR)\b/gi, formatTeamName(away));
  
  return result;
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

  let currentStreak = 0;
  const sortedPicks = [...picks].sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
  
  if (sortedPicks.length > 0) {
    const firstStatus = sortedPicks[0].status;
    if (firstStatus !== 'pending' && firstStatus !== 'void') {
      for (const p of sortedPicks) {
        if (p.status === firstStatus) currentStreak++;
        else if (p.status !== 'void') break;
      }
      if (firstStatus === 'lost') currentStreak = -currentStreak;
    }
  }

  return { totalStake, totalProfit, roi, winRate, currentStreak };
}
