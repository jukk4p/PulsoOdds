import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { translateBettingTerm } from '@/lib/utils';

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
    
    // Validate required fields
    const requiredFields = ['sport', 'competition', 'match', 'market', 'pick', 'odds', 'stake', 'match_date'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
      }
    }

    // --- PREVENCIÓN DE DUPLICADOS ---
    const { data: existingPick } = await supabaseAdmin
      .from('picks')
      .select('id')
      .eq('match', body.match)
      .eq('pick', body.pick)
      .eq('match_date', body.match_date)
      .maybeSingle();

    if (existingPick) {
      return NextResponse.json({ 
        success: true, 
        message: 'Pick ya publicado anteriormente', 
        pick_id: existingPick.id 
      });
    }
    // --------------------------------

    // 🏁 DB PAYLOAD CORREGIDO: Nombres exactos para la Web
    const dbPayload = {
      sport: body.sport || 'football',
      competition: body.competition,
      match: body.match,
      market: translateBettingTerm(body.market),
      pick: translateBettingTerm(body.pick),
      odds: parseFloat(body.odds),
      stake: parseInt(body.stake),
      match_date: body.match_date,
      kickoff: body.kickoff || '',
      razonamiento: body.razonamiento || '', 
      alertas: body.alertas || '',
      factores: body.factores || '',
      ev: parseFloat(body.ev) || 0,
      confianza: parseInt(body.confianza) || 70,
      is_verified: body.is_verified || false,
      home_stats: body.home_stats || {},
      away_stats: body.away_stats || {},
      home_logo: body.home_logo || '',
      away_logo: body.away_logo || '',
      league_logo: body.league_logo || '',
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

    return NextResponse.json({ success: true, pick_id: data.id });
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
