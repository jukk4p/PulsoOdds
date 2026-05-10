import { NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    
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
