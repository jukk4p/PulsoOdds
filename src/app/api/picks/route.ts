import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { translateBettingTerm, normalizeBettingPick, translateLeagueName, formatMatchName, deepNormalize, createSlug } from '@/lib/utils';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  const serverApiKey = process.env.ADMIN_API_KEY;

  if (!apiKey || apiKey !== serverApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Mapeo flexible de campos (n8n vs DB)
    const sport = body.sport || 'football';
    const competition = body.competition;
    const match = body.match;
    const match_date = body.match_date || body.date;
    const market = body.market || body.mercado;
    const pick = body.pick || body.seleccion;
    const odds = body.cuota || body.odds;
    const stake = body.stake;

    // Validate minimum required fields
    if (!match || !market || !pick || !odds || !stake) {
      return NextResponse.json({ error: 'Missing required betting fields (match, market, pick, odds, stake)' }, { status: 400 });
    }

    // --- NORMALIZACIÓN Y PREVENCIÓN DE DUPLICADOS REFORZADA ---
    const normalizedMatch = formatMatchName(match);
    const normalizedMarket = translateBettingTerm(market);
    const normalizedPick = translateBettingTerm(normalizeBettingPick(pick));

    // Buscamos picks existentes para este partido (pendientes)
    const { data: existingPicks } = await supabaseAdmin
      .from('picks')
      .select('id, match, market, pick')
      .eq('match', normalizedMatch)
      .eq('status', 'pending');

    if (existingPicks && existingPicks.length > 0) {
      const newMatchNorm = deepNormalize(normalizedMatch);
      const newMarketNorm = deepNormalize(normalizedMarket);
      const newPickNorm = deepNormalize(normalizedPick);

      const isDuplicate = existingPicks.some(p => 
        deepNormalize(p.match) === newMatchNorm &&
        deepNormalize(p.market) === newMarketNorm &&
        deepNormalize(p.pick) === newPickNorm
      );

      if (isDuplicate) {
        return NextResponse.json({ 
          success: true, 
          pick_id: null,
          message: `Detección de duplicado: El pick para [${normalizedMatch}] con mercado [${normalizedMarket}] ya existe.`, 
        });
      }
    }
    // ------------------------------------------

    // 🏁 DB PAYLOAD CORREGIDO
    const dbPayload = {
      sport: sport,
      competition: translateLeagueName(competition || 'Varios'),
      match: normalizedMatch,
      market: normalizedMarket,
      pick: normalizedPick,
      odds: parseFloat(odds),
      stake: parseInt(stake),
      match_date: match_date,
      kickoff: body.kickoff || '',
      razonamiento: body.razonamiento || '', 
      alertas: body.alertas || '',
      factores: body.factores || '',
      ev: parseFloat(body.ev) || 0,
      confianza: parseInt(body.confianza) || 70,
      prob_estimada: parseFloat(body.prob_estimada) || null,
      prob_implicita: parseFloat(body.prob_implicita) || null,
      bookmaker: body.bookmaker || '',
      home_stats: body.home_stats || {},
      away_stats: body.away_stats || {},
      home_logo: body.home_logo || '',
      away_logo: body.away_logo || '',
      league_logo: body.league_logo || '',
      home_slug: createSlug(normalizedMatch.split(/\s+vs\s+/i)[0]),
      away_slug: createSlug(normalizedMatch.split(/\s+vs\s+/i)[1]),
      source: 'n8n-bot',
      status: 'pending',
      published_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('picks')
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      pick_id: data.id,
      message: null 
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET for basic aggregation (admin metrics)
export async function GET(req: NextRequest) {
  const { data, error } = await supabaseAdmin
    .from('picks')
    .select('*');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
