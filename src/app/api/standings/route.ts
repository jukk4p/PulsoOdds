import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const requestedLeague = searchParams.get('league');
    
    // Mapeo inverso de nombres de UI a nombres de DB para mayor precisión
    // Estos nombres deben coincidir con los que 'sync_supabase.js' inserta en la columna 'league'
    const REVERSE_MAPPING: Record<string, string> = {
      "LaLiga EA Sports": "Spain - LaLiga",
      "LaLiga Hypermotion": "Spain - LaLiga2",
      "Premier League": "England - Premier League",
      "Bundesliga": "Germany - Bundesliga",
      "Serie A": "Italy - Serie A",
      "Ligue 1": "France - Ligue 1",
      "Eredivisie": "Netherlands - Eredivisie",
      "Liga Portugal": "Portugal - Primeira Liga",
      "Championship": "England - Championship",
      "2. Bundesliga": "Germany - 2. Bundesliga",
      "Serie B": "Italy - Serie B",
      "Ligue 2": "France - Ligue 2",
      "Serie A / Brasil": "Brazil - Brasileiro Serie A",
      "MLS": "USA - MLS",
      "Eurocopa": "Europe - Euro",
      "Mundial": "World - World Cup"
    };

    const dbLeagueName = requestedLeague ? (REVERSE_MAPPING[requestedLeague] || requestedLeague) : null;
    let requestedType = searchParams.get('type') || 'General';
    
    // Normalizar a Capitalizado (ej: 'local' -> 'Local') para que coincida con la DB
    requestedType = requestedType.charAt(0).toUpperCase() + requestedType.slice(1).toLowerCase();

    console.log(`📡 Fetching standings from Supabase for: ${dbLeagueName} [Type: ${requestedType}]`);

    let query = supabase
      .from('standings')
      .select('*')
      .eq('type', requestedType);

    if (dbLeagueName) {
      if (dbLeagueName.includes('Europe - Euro') || dbLeagueName.includes('World - World Cup')) {
        // Para Eurocopa y Mundial usamos ilike con wildcard para traer todos los grupos
        query = query.ilike('league', `${dbLeagueName}%`);
      } else {
        query = query.eq('league', dbLeagueName);
      }
    }

    const { data, error } = await query.order('pos', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Adaptar el formato de Supabase al formato que espera el frontend
    const resultData = (data || []).map(row => ({
      league: row.league,
      pos: row.pos,
      team: row.public_name || row.team,
      public_name: row.public_name || row.team,
      pj: row.pj,
      pg: row.pg,
      pe: row.pe,
      pp: row.pp,
      goals: row.goals,
      pts: row.pts,
      form: row.form,
      logo_league: row.logo_league,
      logo_team: row.logo_team,
      zone: row.zone
    }));

    return NextResponse.json(resultData, {
      headers: { 
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' 
      }
    });

  } catch (err) {
    console.error('Error in /api/standings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
