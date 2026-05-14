import { NextResponse } from 'next/server';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Bypass Turbopack static analysis for node-only modules
const { spawn } = eval('require')('child_process');

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
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
  }

  return new Promise<Response>((resolve) => {
    const scriptName = 'master_update.js';
    const scriptPath = path.join(process.cwd(), 'scripts', scriptName);
    
    console.log('🚀 Iniciando sincronización total desde la web...');
    
    // Usamos spawn para poder ver el progreso si quisiéramos, 
    // pero aquí simplemente lanzamos el proceso.
    const child = spawn('node', [scriptPath], {
      cwd: process.cwd(),
      env: { ...process.env },
      stdio: 'inherit' // Esto sacará el log en la consola del servidor
    });

    child.on('close', (code: number | null) => {
      if (code === 0) {
        console.log('✅ Sincronización web completada con éxito.');
        resolve(NextResponse.json({ 
          success: true, 
          message: 'Sincronización completada con éxito.' 
        }));
      } else {
        console.error(`❌ El script falló con código ${code}`);
        resolve(NextResponse.json({ 
          success: false, 
          error: `El script falló con código ${code}` 
        }, { status: 500 }));
      }
    });

    child.on('error', (err: any) => {
      console.error('❌ Error al lanzar el script:', err);
      resolve(NextResponse.json({ 
        success: false, 
        error: err.message 
      }, { status: 500 }));
    });
  });
}
