import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const requestedLeague = searchParams.get('league');
    const slugs = searchParams.get('slugs');
    const type = searchParams.get('type') || 'general'; // general, local, visitante

    // Rutas de archivos
    const jsonPath = path.join(process.cwd(), 'scripts', 'data', 'european_football_data.json');
    const logosPath = path.join(process.cwd(), 'scripts', 'data', 'logos_dictionary.json');

    if (!fs.existsSync(jsonPath)) {
      console.error('JSON file not found at:', jsonPath);
      return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
    }

    // Cargar diccionarios
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    const allData = JSON.parse(fileContent);

    let logosDict = { teams: {}, leagues: {} };
    if (fs.existsSync(logosPath)) {
      logosDict = JSON.parse(fs.readFileSync(logosPath, 'utf8'));
    }

    let resultData: any[] = [];

    // Mapeo inverso de nombres de DB a nombres del JSON para mayor precisión
    const REVERSE_MAPPING: Record<string, string> = {
      "Spain - LaLiga": "LaLiga EA Sports",
      "Spain - LaLiga2": "LaLiga Hypermotion",
      "England - Premier League": "Premier League",
      "Germany - Bundesliga": "Bundesliga",
      "Italy - Serie A": "Serie A",
      "France - Ligue 1": "Ligue 1",
      "Netherlands - Eredivisie": "Eredivisie",
      "Portugal - Primeira Liga": "Liga Portugal",
      "England - Championship": "Championship",
      "Germany - 2. Bundesliga": "2. Bundesliga",
      "Italy - Serie B": "Serie B",
      "France - Ligue 2": "Ligue 2",
      "Brazil - Brasileiro Serie A": "Serie A Betano / Brasil",
      "USA - MLS": "MLS",
      "Europe - Euro": "Eurocopa",
      "Europe - Euro - %": "Eurocopa",
      "World - World Cup": "Mundial",
      "World - World Cup - %": "Mundial"
    };

    let targetLigaName = requestedLeague ? (REVERSE_MAPPING[requestedLeague] || requestedLeague) : null;
    
    // Si viene con el wildcard %, lo limpiamos para la búsqueda por texto
    if (targetLigaName) {
      targetLigaName = targetLigaName.replace(/%/g, '').trim();
    }

    allData.forEach((leagueItem: any) => {
      const currentLigaName = leagueItem.liga;
      
      if (targetLigaName && !currentLigaName.toLowerCase().includes(targetLigaName.toLowerCase())) {
        return;
      }

      // Seleccionar la tabla según el tipo
      const clasificacion = leagueItem.data?.clasificacion?.[type] || leagueItem.data?.clasificacion?.general || [];
      
      clasificacion.forEach((row: any) => {
        // Procesar la racha desde el campo "extra"
        // El campo extra suele ser un array como ['?', 'G', 'G', 'G', 'G', 'G']
        // Queremos los últimos 5 resultados, ignorando el '?' si es el primero
        const rawForm = row.extra || [];
        const cleanForm = rawForm.filter((f: string) => f !== '?').slice(-5).join('');

        // Buscar logos en el diccionario maestro
        // Intentamos match por nombre público (que es el que solemos tener en equipo)
        const teamName = row.equipo;
        const logoTeam = (logosDict as any).teams[teamName] || row.logo || null;
        const logoLeague = (logosDict as any).leagues[currentLigaName] || null;

        const teamData = {
          league: currentLigaName,
          pos: parseInt(row.pos.toString().replace('.', '')),
          team: teamName,
          public_name: teamName,
          pj: parseInt(row.pj || 0),
          pg: parseInt(row.g || 0),
          pe: parseInt(row.e || 0),
          pp: parseInt(row.p || 0),
          goals: row.goles, 
          pts: parseInt(row.pts || 0),
          form: cleanForm || "", 
          logo_league: logoLeague,
          logo_team: logoTeam,
          zone: null
        };

        if (slugs) {
          const slugList = slugs.split(',').map(s => s.toLowerCase());
          const teamSlug = row.equipo.toLowerCase().replace(/ /g, '-');
          if (!slugList.includes(teamSlug)) return;
        }

        resultData.push(teamData);
      });
    });

    resultData.sort((a, b) => {
      if (a.league !== b.league) return a.league.localeCompare(b.league);
      return a.pos - b.pos;
    });

    return NextResponse.json(resultData, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' }
    });
  } catch (err) {
    console.error('Error in /api/standings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
