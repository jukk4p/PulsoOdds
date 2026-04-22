/**
 * DICCIONARIO MAESTRO DE NORMALIZACIÓN - PulsoOdds
 * Este archivo es la "Aduana" de nombres. Cualquier nombre de equipo que llegue
 * de cualquier fuente (Flashscore, APIs de apuestas, Excel) pasa por aquí.
 */

const TEAM_NAME_MAP: Record<string, string> = {
  // ESPAÑA
  "FC Barcelona": "Barcelona",
  "Barcelona FC": "Barcelona",
  "Real Madrid CF": "Real Madrid",
  "Atletico Madrid": "Atlético de Madrid",
  "Atlético Madrid": "Atlético de Madrid",
  "Villarreal CF": "Villarreal",
  "Betis": "Real Betis",
  "Celta": "Celta de Vigo",
  "Athletic Bilbao": "Athletic Club",
  "Athletic": "Athletic Club",
  "Osasuna CA": "Osasuna",
  "Getafe CF": "Getafe",
  "RCD Espanyol": "Espanyol",
  "Valencia CF": "Valencia",
  "RCD Mallorca": "Mallorca",
  "Alaves": "Alavés",
  "Sevilla FC": "Sevilla",
  "Girona FC": "Girona",
  "Rayo": "Rayo Vallecano",
  
  // INGLATERRA
  "Manchester United": "Manchester Utd",
  "Man United": "Manchester Utd",
  "Man Utd": "Manchester Utd",
  "Manchester City FC": "Manchester City",
  "Man City": "Manchester City",
  "Tottenham Hotspur": "Tottenham",
  "Spurs": "Tottenham",
  "Wolverhampton Wanderers": "Wolverhampton",
  "Wolves": "Wolverhampton",
  "Leicester City": "Leicester",
  "Newcastle United": "Newcastle",
  "West Ham United": "West Ham",
  
  // ALEMANIA
  "Bayern Munich": "Bayern",
  "Bayern München": "Bayern",
  "Borussia Dortmund": "Dortmund",
  "BVB": "Dortmund",
  "Borussia Mönchengladbach": "B. Mönchengladbach",
  "Mönchengladbach": "B. Mönchengladbach",
  "Bayer 04 Leverkusen": "Bayer Leverkusen",
  "Leverkusen": "Bayer Leverkusen",
  "Eintracht": "Eintracht Frankfurt",
  "Red Bull Leipzig": "RB Leipzig",
  "Leipzig": "RB Leipzig",
  
  // ITALIA
  "Internazionale": "Inter",
  "Inter Milan": "Inter",
  "Milan": "AC Milan",
  "Napoli": "Nápoles",
  "Juventus FC": "Juventus",
  "AS Roma": "Roma",
  "SS Lazio": "Lazio",
  "Fiorentina ACF": "Fiorentina",
  
  // FRANCIA
  "Paris Saint Germain": "PSG",
  "Paris SG": "PSG",
  "Olympique Marseille": "Marsella",
  "Marseille": "Marsella",
  "Olympique Lyonnais": "Lyon",
  "Monaco": "Mónaco",
  "Saint Etienne": "St Etienne"
};

/**
 * Normaliza el nombre de un equipo para que siempre coincida con la "Fuente de Verdad" (Flashscore)
 */
export function normalizeTeamName(name: string): string {
  if (!name) return "";
  
  // 1. Limpieza inicial: quitar números entre paréntesis o al final
  let cleanName = name.replace(/\s*\(\d+\)$/g, "").trim();
  cleanName = cleanName.replace(/\s*\d+$/g, "").trim();
  
  // 2. Buscamos en el mapa ignorando mayúsculas/minúsculas
  const entries = Object.entries(TEAM_NAME_MAP);
  const match = entries.find(([key]) => key.toLowerCase() === cleanName.toLowerCase());
  
  if (match) {
    return match[1];
  }

  // 3. Si no hay mapeo, intentamos quitar prefijos comunes y volver a buscar
  const genericClean = cleanName.replace(/\b(FC|CF|SSC|AC|AS|UD|CD|RC|SC|AFC|Club|de)\b/gi, "").trim();
  const genericMatch = entries.find(([key]) => key.toLowerCase() === genericClean.toLowerCase());
  
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
  if (n.includes("LaLiga EA Sports")) return "La Liga";
  if (n.includes("LaLiga Hypermotion")) return "Segunda División";
  return n;
}
