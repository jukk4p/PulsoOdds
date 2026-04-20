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
    "BTTS": "Ambos marcan",
    "BTTS - YES": "Ambos marcan - SÍ",
    "BTTS - NO": "Ambos marcan - NO",
    "BOTH TEAMS TO SCORE": "Ambos marcan",
    "BOTH TEAMS TO SCORE - YES": "Ambos marcan - SÍ",
    "BOTH TEAMS TO SCORE - NO": "Ambos marcan - NO",
    "1X2": "Resultado Final",
    "FULL TIME": "Tiempo Completo",
    "OVER": "Más de",
    "UNDER": "Menos de",
    "DOUBLE CHANCE": "Doble Oportunidad",
    "DRAW NO BET": "Empate no válido",
    "DNB": "Empate no válido",
    "HALF TIME": "Descanso",
    "DRAW": "Empate",
    "SPREAD": "Hándicap Asiático",
    "HANDICAP": "Hándicap",
    "ML": "Resultado Final (1X2)",
    "MONEY LINE": "Resultado Final (1X2)",
    "MATCH RESULT": "Resultado Final (1X2)",
    "RESULTADO DEL PARTIDO": "Resultado Final (1X2)",
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
  
  // 2. Si sigue siendo muy largo, limpiar ruido residual
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
