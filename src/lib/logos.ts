import { MASTER_LEAGUES, MASTER_TEAMS } from './masterDictionaries';

/**
 * Master mapping of team names to Flashscore logo URLs.
 * Based on diccionario_maestro_equipos.md
 */
export const TEAM_LOGOS: Record<string, string> = MASTER_TEAMS;

/**
 * Returns the Flashscore logo URL for a given team name.
 * Normalizes input to match the dictionary keys.
 */
export function getTeamLogo(teamName: string): string | null {
  if (!teamName) return null;
  
  // Try exact match
  if (TEAM_LOGOS[teamName]) return TEAM_LOGOS[teamName];
  
  // Try normalized match (case insensitive, trim)
  const normalized = teamName.trim();
  const found = Object.keys(TEAM_LOGOS).find(
    key => key.toLowerCase() === normalized.toLowerCase()
  );
  
  return found ? TEAM_LOGOS[found] : null;
}

/**
 * Returns the logo URL for a given league/competition.
 */
export function getLeagueLogo(leagueName: string): string | null {
  if (!leagueName) return null;
  
  // 1. Basic normalization
  const original = leagueName.trim();
  const normalized = original.toLowerCase();

  // 1.5. Alias mapping for common mismatches
  const aliases: Record<string, string> = {
    "laliga2": "LaLiga Hypermotion",
    "la liga 2": "LaLiga Hypermotion",
    "laliga": "LaLiga EA Sports",
    "la liga": "LaLiga EA Sports",
    "champions": "UEFA Champions League",
    "europa league": "UEFA Europa League",
    "conference league": "UEFA Conference League"
  };

  const aliasKey = Object.keys(aliases).find(a => normalized.includes(a));
  const effectiveName = aliasKey ? aliases[aliasKey] : original;
  const effectiveNormalized = effectiveName.toLowerCase();

  // 2. Try exact or case-insensitive match first
  const exactMatch = Object.keys(MASTER_LEAGUES).find(
    key => key.toLowerCase() === effectiveNormalized
  );
  if (exactMatch) return MASTER_LEAGUES[exactMatch];

  // 3. Handle prefixes like "ESPAÑA - LALIGA" or "ENGLAND - PREMIER"
  // We take the last part after the hyphen or just the whole thing cleaned
  const parts = original.split('-').map(p => p.trim().toLowerCase());
  const lastPart = parts[parts.length - 1];

  // 4. Smart search across all keys
  const smartMatch = Object.keys(MASTER_LEAGUES).find(
    key => {
      const k = key.toLowerCase();
      // Match if:
      // - The key is in the original string (e.g. "Premier League" in "ENGLAND - PREMIER LEAGUE")
      // - The original string (or last part) is in the key (e.g. "LALIGA" in "LaLiga EA Sports")
      return normalized.includes(k) || k.includes(normalized) || k.includes(lastPart);
    }
  );
  
  return smartMatch ? MASTER_LEAGUES[smartMatch] : null;
}
