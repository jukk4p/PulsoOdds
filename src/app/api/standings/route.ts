import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get('league');

  try {
    let query = supabase
      .from('standings')
      .select('*')
      .order('pos', { ascending: true });

    if (league) {
      query = query.eq('liga', league);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching standings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || [], {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' }
    });
  } catch (err) {
    console.error('Error in /api/standings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
