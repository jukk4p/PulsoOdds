import { NextResponse } from 'next/server';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Bypass Turbopack static analysis for node-only modules
const { spawn } = eval('require')('child_process');

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.split('Bearer ')[1];

      if (!token) {
        return NextResponse.json({ success: false, message: 'No autorizado: Token faltante' }, { status: 401 });
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user || user.email !== 'jukk4p@gmail.com') {
        return NextResponse.json({ success: false, message: 'No autorizado: Credenciales inválidas' }, { status: 401 });
      }
    }
    
    // Consume body if necessary, though no longer strictly needed for apiKey
    try {
      await request.json();
    } catch (e) {
      // Ignore empty body errors
    }
    
    const scriptName = 'scrape-upcoming-matches.js';
    const scriptPath = path.join(process.cwd(), 'scripts', scriptName);
    
    const child = spawn('node', [scriptPath]);

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data: Buffer | string) => {
      output += data.toString();
      console.log(`Scraper Output: ${data}`);
    });

    child.stderr.on('data', (data: Buffer | string) => {
      errorOutput += data.toString();
      console.error(`Scraper Error: ${data}`);
    });

    return new Promise<Response>((resolve) => {
      child.on('close', (code: number | null) => {
        console.log(`Scraper process exited with code ${code}`);
        if (code === 0) {
          resolve(NextResponse.json({ 
            success: true, 
            message: 'Matches scraped successfully',
            output 
          }));
        } else {
          resolve(NextResponse.json({ 
            success: false, 
            message: `Scraper failed with code ${code}`,
            error: errorOutput 
          }, { status: 500 }));
        }
      });
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
