import { NextResponse } from 'next/server';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Bypass Turbopack static analysis for node-only modules
const { spawn } = eval('require')('child_process');

export async function POST(request: Request) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
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

      // En producción, informamos que el scraper es local
      return NextResponse.json({ 
        success: false, 
        message: 'El scraper de partidos requiere Playwright y no puede ejecutarse en este servidor. Por favor, ejecuta "actualizar_todo.bat" localmente para subir los datos.' 
      }, { status: 400 });
    }
    
    // MODO LOCAL
    const scriptName = 'scrape-upcoming-matches.js';
    const scriptPath = path.join(process.cwd(), 'scripts', scriptName);
    
    console.log(`🚀 Ejecutando scraper de partidos local: ${scriptPath}`);
    const child = spawn('node', [scriptPath]);

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data: Buffer | string) => {
      output += data.toString();
    });

    child.stderr.on('data', (data: Buffer | string) => {
      errorOutput += data.toString();
    });

    return new Promise<Response>((resolve) => {
      child.on('close', (code: number | null) => {
        if (code === 0) {
          resolve(NextResponse.json({ success: true, message: 'Partidos sincronizados (Local)' }));
        } else {
          resolve(NextResponse.json({ 
            success: false, 
            message: `Scraper falló (code ${code})`,
            error: errorOutput 
          }, { status: 500 }));
        }
      });
    });

  } catch (error: any) {
    console.error('Error in sync-matches:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

