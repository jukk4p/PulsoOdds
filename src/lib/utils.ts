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
    "ML": "Resultado Final (1X2)",
    "MONEY LINE": "Resultado Final (1X2)",
    "MATCH RESULT": "Resultado Final (1X2)",
    "1X2": "Resultado Final",
    "DOUBLE CHANCE": "Doble Oportunidad",
    "DRAW NO BET": "Empate no válido",
    "DNB": "Empate no válido",
    "SPREAD": "Hándicap Asiático",
    "ASIAN HANDICAP": "Hándicap Asiático",
    "TOTALS": "Total de Goles (O/U)",
    "GOALS OVER/UNDER": "Goles Más/Menos",
    "ALTERNATIVE TOTAL GOALS": "Total de Goles (Alt.)",
    "BOTH TEAMS TO SCORE": "Ambos Equipos Anotan",
    "BTTS": "Ambos marcan",
    "BTTS - YES": "Ambos marcan - SÍ",
    "BTTS - NO": "Ambos marcan - NO",
    "1ST HALF - BOTH TEAMS TO SCORE": "Ambos marcan (1ª Parte)",
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
    "ANYTIME GOALSCORER": "Jugador Anota",
    "FIRST GOALSCORER": "Primer Goleador",
    "TEAM GOALSCORER": "Goleador del Equipo",
    "PLAYER SHOTS": "Remates de Jugador",
    "PLAYER SHOTS ON TARGET": "Remates a Puerta",
    "PLAYER PASSES": "Pases de Jugador",
    "PLAYER TACKLES": "Entradas de Jugador",
    "PLAYER FOULS COMMITTED": "Faltas Cometidas",
    "PLAYER TO BE FOULED": "Jugador Recibe Falta",
    "PLAYER TO SCORE OR ASSIST": "Gol o Asistencia",
    
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
 * Limpia y normaliza el nombre de un equipo (p.ej. "FC Bayern Munich" -> "Bayern Múnich")
 */
export function formatTeamName(name: string): string {
  if (!name) return name;

  let formatted = name;

  // 1. Diccionario de nombres específicos (Traducciones y simplificaciones pro)
  const translations: Record<string, string> = {
    "Munich": "Múnich",
    "Milan": "Milán",
    "Cologne": "Colonia",
    "Köln": "Colonia",
    "Sporting CP": "Sporting Portugal",
    "Inter Milan": "Inter",
    "Inter Milano": "Inter",
    "Athletic Club": "Athletic Bilbao",
  };

  // 2. Quitar prefijos y sufijos comunes de clubes que ensucian la UI
  const noise = [
    /\bFC\b/gi, /\bCF\b/gi, /\bSSC\b/gi, /\bAC\b/gi, /\bAS\b/gi, /\bUD\b/gi, 
    /\bCD\b/gi, /\bRC\b/gi, /\b1\.\s/g, /\bSC\b/gi, /\bAFC\b/gi, /\bCLUB\b/gi, /\bDE\b/gi,
    /\d+$/g // Quitar números al final (ej: Brest 29 -> Brest)
  ];
  
  noise.forEach(pattern => {
    formatted = formatted.replace(pattern, '');
  });

  // 3. Aplicar traducciones
  Object.entries(translations).forEach(([eng, esp]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    formatted = formatted.replace(regex, esp);
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
  
  // 3. Si sigue siendo muy largo, limpiar ruido residual
  const noise = [
    /\bEN EL PARTIDO\b/gi,
    /\bEL PARTIDO TENDRÁ\b/gi,
    /\bANOTARÁN EN EL PARTIDO\b/gi,
    /\bGOLES\b/gi,
    /\bPARTIDO\b/gi,
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
