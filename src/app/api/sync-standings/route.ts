import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeTeamName, normalizeLeagueName } from "@/lib/team-normalization";

// Configuración de Supabase con Service Role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const SHEET_ID = "1oN_W3RTwVaxZm5zyKv8HQwgUsjAEZlpJSCFDe21GJWI";
const CONSOLIDATED_GID = "1177125270"; // GID de la pestaña n8n_Consolidado

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.SYNC_API_KEY && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${CONSOLIDATED_GID}`,
      { cache: 'no-store' }
    );
    
    const csvData = await response.text();
    const rows = csvData.split('\n').map(row => {
      // Manejo simple de CSV que puede tener comas dentro de celdas (aunque api-sports URLs no suelen tenerlas)
      return row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
    });

    // Detección dinámica de columnas
    const header = rows[0].map(h => h.toLowerCase());
    const colIdx = {
      league: header.indexOf("liga"),
      pos: header.indexOf("pos"),
      team: header.indexOf("equipo"),
      pj: header.indexOf("pj"),
      g: header.indexOf("pg") !== -1 ? header.indexOf("pg") : (header.indexOf("g") !== -1 ? header.indexOf("g") : header.indexOf("pg")),
      e: header.indexOf("pe") !== -1 ? header.indexOf("pe") : (header.indexOf("e") !== -1 ? header.indexOf("e") : header.indexOf("pe")),
      p: header.indexOf("pp") !== -1 ? header.indexOf("pp") : (header.indexOf("p") !== -1 ? header.indexOf("p") : header.indexOf("pp")),
      goals: header.indexOf("goles"),
      pts: header.indexOf("pts"),
      form: header.indexOf("forma"),
      logo: header.indexOf("logo equipo")
    };

    if (colIdx.pos === -1 || colIdx.team === -1 || colIdx.league === -1) {
      throw new Error(`Columnas críticas no encontradas. Cabecera detectada: ${header.join(", ")}`);
    }

    // Filtrar filas que tienen posición (evita cabeceras repetidas si las hay)
    const teams = rows.slice(1).filter(row => row[colIdx.pos] && !isNaN(parseInt(row[colIdx.pos])));

    const results: Record<string, number> = {};

    for (const row of teams) {
      const leagueName = normalizeLeagueName(row[colIdx.league]);
      const pos = parseInt(row[colIdx.pos]);
      const teamName = normalizeTeamName(row[colIdx.team]);
      const pj = parseInt(row[colIdx.pj]) || 0;
      const g = parseInt(row[colIdx.g]) || 0;
      const e = parseInt(row[colIdx.e]) || 0;
      const p = parseInt(row[colIdx.p]) || 0;
      const goals = row[colIdx.goals] || "0:0";
      const pts = parseInt(row[colIdx.pts]) || 0;
      const form = row[colIdx.form] || "";
      const dg = (g * 2) - (p * 2);

      // Zona de competición
      let zone = null;
      if (pos <= 4) zone = "champions";
      else if (pos <= 6) zone = "europa";
      else if (pos >= 18 && (leagueName === "La Liga" || leagueName === "Premier League")) zone = "relegation";

      // Logo: Prioridad al del Excel, si no, genérico
      const logoUrl = row[colIdx.logo] || `https://media.api-sports.io/football/teams/generic.png`;

      await supabase
        .from('standings')
        .upsert({
          league: leagueName,
          pos,
          team: teamName,
          logo: logoUrl,
          pj, g, e, p, dg, pts, zone,
          goals,
          form
        }, { 
          onConflict: 'league,team' 
        });
      
      results[leagueName] = (results[leagueName] || 0) + 1;
    }

    return NextResponse.json({ 
      message: "Sincronización Consolidada Exitosa", 
      details: results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Error en la sincronización consolidada", 
      message: error.message 
    }, { status: 500 });
  }
}
