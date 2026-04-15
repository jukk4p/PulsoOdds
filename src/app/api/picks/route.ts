import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const { data, error } = await supabaseAdmin
      .from('picks')
      .insert([
        {
          ...body,
          source: 'n8n-bot',
          status: 'pending',
          published_at: new Date().toISOString(),
        }
      ])
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
