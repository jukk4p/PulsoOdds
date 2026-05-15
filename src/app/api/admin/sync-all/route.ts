import { NextResponse } from 'next/server';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Bypass Turbopack static analysis for node-only modules
const { spawn } = eval('require')('child_process');

export async function POST(request: Request) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No autorizado: Token faltante' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user || user.email !== 'jukk4p@gmail.com') {
      return NextResponse.json({ error: 'No autorizado: Credenciales inválidas' }, { status: 401 });
    }

    // --- MODO PRODUCCIÓN: SINCRONIZACIÓN DIRECTA DE NUBE ---
    try {
      console.log('☁️ Producción: Iniciando sincronización directa desde Google Sheets (Saltando Scraper)...');
      
      const syncUrl = `${new URL(request.url).origin}/api/sync-standings?key=${process.env.SYNC_API_KEY}`;
      const syncRes = await fetch(syncUrl, { cache: 'no-store' });
      const syncData = await syncRes.json();

      if (!syncRes.ok) {
        throw new Error(syncData.message || 'Error en sync-standings');
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Base de datos sincronizada desde Google Sheets con éxito.',
        details: syncData
      });
    } catch (err: any) {
      console.error('❌ Error en sincronización de nube:', err.message);
      return NextResponse.json({ 
        success: false, 
        error: `Error en la sincronización de nube: ${err.message}` 
      }, { status: 500 });
    }
  }

  // --- MODO LOCAL: EJECUCIÓN DE SCRAPER COMPLETO ---
  return new Promise<Response>((resolve) => {
    const scriptName = 'master_update.js';
    const scriptPath = path.join(process.cwd(), 'scripts', scriptName);
    
    console.log('🚀 Local: Iniciando sincronización total (Scraper + DB Update)...');
    
    const child = spawn('node', [scriptPath], {
      cwd: process.cwd(),
      env: { ...process.env },
      stdio: 'inherit'
    });

    child.on('close', (code: number | null) => {
      if (code === 0) {
        console.log('✅ Sincronización local completada.');
        resolve(NextResponse.json({ success: true, message: 'Sincronización completada con éxito.' }));
      } else {
        console.error(`❌ El script falló con código ${code}`);
        resolve(NextResponse.json({ success: false, error: `El script falló con código ${code}` }, { status: 500 }));
      }
    });

    child.on('error', (err: any) => {
      console.error('❌ Error al lanzar el script:', err);
      resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
    });
  });
}

