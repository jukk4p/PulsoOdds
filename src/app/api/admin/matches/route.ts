import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'upcoming_matches_detailed.json');
  
  let attempts = 0;
  while (attempts < 3) {
    try {
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({});
      }
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContents);
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    } catch (error: any) {
      attempts++;
      if (attempts >= 3) {
        console.error('Error reading matches file after 3 attempts:', error);
        return NextResponse.json({}, { status: 500 });
      }
      // Esperar 150ms antes de reintentar por si el archivo está bloqueado temporalmente por Windows
      await new Promise(res => setTimeout(res, 150));
    }
  }
  return NextResponse.json({}, { status: 500 });
}
