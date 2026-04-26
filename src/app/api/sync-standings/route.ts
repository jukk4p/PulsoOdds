import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeTeamName, normalizeLeagueName, clean } from "@/lib/team-normalization";

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
      return row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
    });

    const header = rows[0].map(h => h.toLowerCase());
    const colIdx = {
      league: header.indexOf("liga"),
      pos: header.indexOf("pos"),
      team: header.indexOf("equipo"),
      publicName: header.indexOf("nombre publico"),
      pj: header.indexOf("pj"),
      g: header.indexOf("pg"),
      e: header.indexOf("pe"),
      p: header.indexOf("pp"),
      goals: header.indexOf("goles"),
      pts: header.indexOf("pts"),
      form: header.indexOf("forma"),
      logoTeam: header.indexOf("logo equipo"),
      logoLeague: header.indexOf("logo liga")
    };

    const teams = rows.slice(1).filter(row => row[colIdx.pos] && !isNaN(parseInt(row[colIdx.pos])));

    // ── 1. LIMPIEZA PREVIA ──────────────────────────────────────────────────────
    // Borramos todo para evitar duplicados residuales de nombres antiguos
    if (teams.length > 20) {
      await supabase.from('standings').delete().neq('pos', -1);
    }

    const results: Record<string, number> = {};

    for (const row of teams) {
      const apiLeague = normalizeLeagueName(row[colIdx.league]); // Usamos el ID de la API para filtrar
      const pos = parseInt(row[colIdx.pos]);
      
      const rawTeam = row[colIdx.team] || "";
      const rawPublic = row[colIdx.publicName] || "";
      
      // LA TRINIDAD DE DATOS (Limpios de IDs):
      const apiName = (row[colIdx.team] || "").replace(/\s*\(\d+\)$/g, "").trim(); 
      const publicName = normalizeTeamName(rawPublic || rawTeam); 

      const pj = parseInt(row[colIdx.pj]) || 0;
      const g = parseInt(row[colIdx.g]) || 0;
      const e = parseInt(row[colIdx.e]) || 0;
      const p = parseInt(row[colIdx.p]) || 0;
      const goals = row[colIdx.goals] || "0:0";
      const pts = parseInt(row[colIdx.pts]) || 0;
      const form = (row[colIdx.form] || "").toUpperCase();

      let zone = null;
      if (apiLeague === "Spain - LaLiga") {
        if (pos <= 4) zone = "champions";
        else if (pos <= 6) zone = "europa";
        else if (pos === 7) zone = "conference";
        else if (pos >= 18) zone = "relegation";
      }

      await supabase
        .from('standings')
        .upsert({
          league: apiLeague,
          pos,
          team: apiName,         // GUARDAMOS EL NOMBRE CRUDO DE LA API
          public_name: publicName, // GUARDAMOS EL NOMBRE PÚBLICO
          logo_team: row[colIdx.logoTeam] || "",
          logo_league: row[colIdx.logoLeague] || "",
          pj, 
          pg: g, 
          pe: e, 
          pp: p, 
          pts, 
          zone,
          goals,
          form
        }, { 
          onConflict: 'league,team' 
        });
      
      results[apiLeague] = (results[apiLeague] || 0) + 1;
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
