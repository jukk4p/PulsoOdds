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
    "BTTS": "Ambos marcan",
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
