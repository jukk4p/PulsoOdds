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

  const dictionary: Record<string, string> = {
    // Mercados
    "BTTS": "Ambos equipos marcan",
    "Both Teams To Score": "Ambos equipos marcan",
    "1X2": "Resultado Final",
    "Full Time": "Tiempo Completo",
    "Over": "Más de",
    "Under": "Menos de",
    "Double Chance": "Doble Oportunidad",
    "Draw No Bet": "Empate No Válido",
    "Handicap": "Hándicap",
    "Correct Score": "Resultado Exacto",
    "Half Time": "Descanso",
    "Corners": "Córners",

    // Frases largas que ensucian la UI
    "AMBOS EQUIPOS MARCARÁN AL MENOS UN GOL": "Ambos equipos marcan",
    "AMBOS EQUIPOS MARCARAN": "Ambos equipos marcan",
    "AMBOS EQUIPOS ANOTAN AL MENOS UN GOL": "Ambos equipos marcan",
    "AMBOS EQUIPOS ANOTARÁN EN EL PARTIDO": "Ambos equipos marcan",
    "AMBOS EQUIPOS ANOTAN EN EL PARTIDO": "Ambos equipos marcan",
    "MÁS DE 2.5 GOLES EN EL PARTIDO": "Más de 2.5 goles",
    "MENOS DE 2.5 GOLES EN EL PARTIDO": "Menos de 2.5 goles",
    "VICTORIA LOCAL": "Gana Local",
    "VICTORIA VISITANTE": "Gana Visitante",
    "AMBOS EQUIPOS HAN MOSTRADO PARIDAD EN ENCUENTROS ANTERIORES.": "Empate",
    "INTER GANARÁ EN LA PRIMERA PARTE": "Inter gana 1ª Mitad",
    
    // Selecciones
    "Yes": "Sí",
    "No": "No",
    "Draw": "Empate",
    "Home": "Local",
    "Away": "Visitante",
    "Over 0.5": "Más de 0.5",
    "Over 1.5": "Más de 1.5",
    "Over 2.5": "Más de 2.5",
    "Over 3.5": "Más de 3.5",
    "Under 0.5": "Menos de 0.5",
    "Under 1.5": "Menos de 1.5",
    "Under 2.5": "Menos de 2.5",
    "Under 3.5": "Menos de 3.5",
  };

  // 1. Intento de traducción exacta
  if (dictionary[term]) return dictionary[term];

  // 2. Intento de traducción parcial (ej: "Over 2.5 goals" -> "Más de 2.5 goals")
  let translated = term;
  Object.entries(dictionary).forEach(([eng, esp]) => {
     // Usamos regex con word boundaries para evitar traducir partes de palabras
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
    if (p.status === 'won') {
      totalProfit += (p.stake * p.odds) - p.stake;
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
    /\bCD\b/gi, /\bRC\b/gi, /\b1\.\s/g, /\bSC\b/gi, /\bAFC\b/gi
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
