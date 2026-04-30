import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const league = searchParams.get('league');
    const slugs = searchParams.get('slugs');

    let query = supabase
      .from('standings')
      .select('*');

    if (league && !slugs) {
      if (league.includes('%')) {
        query = query.like('league', league);
      } else {
        query = query.eq('league', league);
      }
    }

    if (slugs) {
      const slugList = slugs.split(',');
      query = query.in('team_slug', slugList);
    }

    query = query.order('league', { ascending: true }).order('pos', { ascending: true });

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
