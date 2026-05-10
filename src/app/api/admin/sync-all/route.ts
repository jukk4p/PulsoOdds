import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST() {
  // Solo permitimos esto en desarrollo para evitar abusos o configurarlo con una KEY en prod
  if (process.env.NODE_ENV === 'production' && !process.env.SYNC_API_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return new Promise((resolve) => {
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

    child.on('close', (code) => {
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

    child.on('error', (err) => {
      console.error('❌ Error al lanzar el script:', err);
      resolve(NextResponse.json({ 
        success: false, 
        error: err.message 
      }, { status: 500 }));
    });
  });
}
