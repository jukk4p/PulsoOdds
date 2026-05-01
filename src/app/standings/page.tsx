"use client";

import React, { useEffect, useState, Fragment } from "react";
import { cn, normalizeTeamName } from "@/lib/utils";
import { Trophy, Info, Loader2 } from "lucide-react";
import { MASTER_LEAGUES } from "@/lib/masterDictionaries";


const LEAGUES = [
  "LaLiga EA Sports", "LaLiga Hypermotion", "Premier League", "Bundesliga", "Serie A", "Ligue 1", 
  "Eredivisie", "Liga Portugal", "Championship", "2. Bundesliga", "Serie B", "Ligue 2", "Serie A / Brasil", "MLS",
  "Eurocopa", "Mundial"
];

const LEAGUE_COLORS: Record<string, string> = {
  "LaLiga EA Sports": "rgba(238, 30, 41, 0.4)",
  "LaLiga Hypermotion": "rgba(238, 30, 41, 0.4)",
  "Premier League": "rgba(61, 25, 91, 0.4)",
  "Bundesliga": "rgba(209, 7, 19, 0.4)",
  "Serie A": "rgba(0, 140, 206, 0.4)",
  "Ligue 1": "rgba(218, 255, 57, 0.4)",
  "Eredivisie": "rgba(242, 145, 0, 0.4)",
  "Liga Portugal": "rgba(0, 82, 155, 0.4)",
  "Championship": "rgba(61, 25, 91, 0.4)",
  "2. Bundesliga": "rgba(209, 7, 19, 0.4)",
  "Serie B": "rgba(0, 140, 206, 0.4)",
  "Ligue 2": "rgba(218, 255, 57, 0.4)",
  "Serie A / Brasil": "rgba(0, 151, 57, 0.4)",
  "MLS": "rgba(0, 0, 0, 0.4)",
  "Eurocopa": "rgba(0, 51, 153, 0.4)",
  "Mundial": "rgba(255, 215, 0, 0.4)"
};



const LEAGUE_DB_NAMES: Record<string, string> = {
  "LaLiga EA Sports":    "Spain - LaLiga",
  "LaLiga Hypermotion": "Spain - LaLiga2",
  "Premier League":      "England - Premier League",
  "Bundesliga":          "Germany - Bundesliga",
  "Serie A":             "Italy - Serie A",
  "Ligue 1":             "France - Ligue 1",
  "Eredivisie":          "Netherlands - Eredivisie",
  "Liga Portugal":       "Portugal - Primeira Liga",
  "Championship":        "England - Championship",
  "2. Bundesliga":       "Germany - 2. Bundesliga",
  "Serie B":             "Italy - Serie B",
  "Ligue 2":             "France - Ligue 2",
  "Serie A / Brasil":    "Brazil - Brasileiro Serie A",
  "MLS":                 "USA - MLS",
  "Eurocopa":            "Europe - Euro - %",
  "Mundial":             "World - World Cup - %"
};

const LEGENDS: Record<string, { zones: { label: string, color: string, border?: string }[], note?: string, extraNote?: string }> = {
  "Mundial": {
    zones: [
      { label: "Clasificación - Mundial (Playoffs)", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Ranking de equipos clasificados en 3ª posición", color: "bg-accent/20", border: "border-accent/40" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, se tendrán en cuenta los enfrentamientos directos como criterio de desempate."
  },
  "Eurocopa": {
    zones: [
      { label: "Clasificación - Eurocopa (Playoffs: 1/8 de final)", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Ranking de equipos clasificados en 3ª posición", color: "bg-accent/20", border: "border-accent/40" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, se tendrán en cuenta los enfrentamientos directos como criterio de desempate."
  },
  "MLS": {
    zones: [
      { label: "Clasificación - MLS (Playoffs: 1/8 de final)", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Clasificación - MLS (Playoffs: 1/16 de final)", color: "bg-accent/20", border: "border-accent/40" }
    ]
  },
  "Serie A": {
    zones: [
      { label: "Acceso - Champions League (Fase de liga)", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Acceso - Europa League (Fase de liga)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Acceso - Conference League (Clasificación)", color: "bg-white/10", border: "border-white/20" },
      { label: "Descenso - Serie B", color: "bg-red-500/20", border: "border-red-500/40" }
    ],
    extraNote: "Si dos equipos están empatados a puntos por la 17.ª posición, se jugará un encuentro adicional.",
    note: "Si los equipos finalizan la temporada empatados a puntos, se tendrán en cuenta los enfrentamientos directos como criterio de desempate."
  },
  "Serie A / Brasil": {
    zones: [
      { label: "Acceso - Copa Libertadores (Fase Grupos)", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Acceso - Copa Libertadores (Clasificación)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Acceso - Copa Sudamericana (Fase Grupos)", color: "bg-white/10", border: "border-white/20" },
      { label: "Descenso - Brasileirao Serie B", color: "bg-red-500/20", border: "border-red-500/40" }
    ]
  },
  "Ligue 1": {
    zones: [
      { label: "Acceso - Champions League (Fase de liga)", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Acceso - Champions League (Clasificación)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Acceso - Europa League (Fase de liga)", color: "bg-white/10", border: "border-white/20" },
      { label: "Acceso - Conference League (Clasificación)", color: "bg-white/5", border: "border-white/10" },
      { label: "Ligue 1 (Descenso - Playoffs)", color: "bg-red-500/20", border: "border-red-500/40" },
      { label: "Descenso - Ligue 2", color: "bg-red-500/40", border: "border-red-500/60" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, el criterio de desempate es la diferencia general de goles."
  },
  "Ligue 2": {
    zones: [
      { label: "Ascenso - Ligue 1", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Clasificación - Ligue 1 (Ascenso - Playoffs: Final)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Clasificación - Ligue 1 (Ascenso - Playoffs: Semifinales)", color: "bg-white/10", border: "border-white/20" },
      { label: "Ligue 2 (Descenso)", color: "bg-red-500/20", border: "border-red-500/40" },
      { label: "Descenso - National", color: "bg-red-500/40", border: "border-red-500/60" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, el criterio de desempate es la diferencia general de goles."
  },
  "Serie B": {
    zones: [
      { label: "Ascenso - Serie A", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Clasificación - Serie B (Playoffs: Semifinales)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Clasificación - Serie B (Playoffs: Cuartos de final)", color: "bg-white/10", border: "border-white/20" },
      { label: "Serie B (Playoffs permanencia)", color: "bg-red-500/20", border: "border-red-500/40" },
      { label: "Descenso", color: "bg-red-500/40", border: "border-red-500/60" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, se tendrán en cuenta los enfrentamientos directos como criterio de desempate."
  },
  "Bundesliga": {
    zones: [
      { label: "Acceso - Champions League (Fase de liga)", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Acceso - Europa League (Fase de liga)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Acceso - Conference League (Clasificación)", color: "bg-white/10", border: "border-white/20" },
      { label: "Bundesliga (Descenso - Playoffs)", color: "bg-red-500/20", border: "border-red-500/40" },
      { label: "Descenso - 2. Bundesliga", color: "bg-red-500/40", border: "border-red-500/60" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, el criterio de desempate es la diferencia general de goles."
  },
  "2. Bundesliga": {
    zones: [
      { label: "Ascenso - Bundesliga", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Clasificación - Bundesliga (Ascenso)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "2. Bundesliga (Descenso)", color: "bg-red-500/20", border: "border-red-500/40" },
      { label: "Descenso - 3. Liga", color: "bg-red-500/40", border: "border-red-500/60" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, el criterio de desempate es la diferencia general de goles."
  },
  "Premier League": {
    zones: [
      { label: "Acceso - Champions League (Fase de liga)", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Acceso - Europa League (Fase de liga)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Acceso - Conference League (Playoffs)", color: "bg-white/10", border: "border-white/20" },
      { label: "Descenso - Championship", color: "bg-red-500/20", border: "border-red-500/40" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, el criterio de desempate es la diferencia general de goles."
  },
  "Championship": {
    zones: [
      { label: "Ascenso - Premier League", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Clasificación - Championship (Playoffs: Semifinales)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Descenso - League One", color: "bg-red-500/20", border: "border-red-500/40" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, el criterio de desempate es la diferencia general de goles."
  },
  "LaLiga EA Sports": {
    zones: [
      { label: "Acceso - Champions League (Fase de liga)", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Acceso - Europa League (Fase de liga)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Acceso - Conference League (Clasificación)", color: "bg-white/10", border: "border-white/20" },
      { label: "Descenso - LaLiga Hypermotion", color: "bg-red-500/20", border: "border-red-500/40" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, se tendrán en cuenta los enfrentamientos directos como criterio de desempate."
  },
  "Liga Hypermotion": {
    zones: [
      { label: "Ascenso - LaLiga EA Sports", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Clasificación - LaLiga Hypermotion (Ascenso - Playoffs: Semifinales)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Descenso", color: "bg-red-500/20", border: "border-red-500/40" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, se tendrán en cuenta los enfrentamientos directos como criterio de desempate."
  },
  "Eredivisie": {
    zones: [
      { label: "Acceso - Champions League (Fase de liga)", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Acceso - Champions League (Clasificación)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Acceso - Europa League (Clasificación)", color: "bg-white/10", border: "border-white/20" },
      { label: "Clasificación - Eredivisie (Conference League - Play Offs)", color: "bg-white/5", border: "border-white/10" },
      { label: "Eredivisie (Descenso - Playoffs)", color: "bg-red-500/20", border: "border-red-500/40" },
      { label: "Descenso - Keuken Kampioen Divisie", color: "bg-red-500/40", border: "border-red-500/60" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, el criterio de desempate es la diferencia general de goles."
  },
  "Liga Portugal": {
    zones: [
      { label: "Acceso - Champions League (Fase de liga)", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
      { label: "Acceso - Champions League (Clasificación)", color: "bg-accent/20", border: "border-accent/40" },
      { label: "Acceso - Europa League (Fase de liga)", color: "bg-white/10", border: "border-white/20" },
      { label: "Acceso - Conference League (Clasificación)", color: "bg-white/5", border: "border-white/10" },
      { label: "Liga Portugal (Descenso - Playoffs)", color: "bg-red-500/20", border: "border-red-500/40" },
      { label: "Descenso - Liga Portugal 2", color: "bg-red-500/40", border: "border-red-500/60" }
    ],
    note: "Si los equipos finalizan la temporada empatados a puntos, se tendrán en cuenta los enfrentamientos directos como criterio de desempate."
  }
};

const DEFAULT_LEGEND = {
  zones: [
    { label: "Champions League", color: "bg-accent", border: "border-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" },
    { label: "Europa League", color: "bg-accent/5", border: "border-accent/30" },
    { label: "Zona de Descenso", color: "bg-red-500/20", border: "border-red-500/40" }
  ]
};

export default function StandingsPage() {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentLegend = LEGENDS[activeLeague] || DEFAULT_LEGEND;

  useEffect(() => {
    async function fetchStandings() {
      setLoading(true);
      try {
        const dbName = LEAGUE_DB_NAMES[activeLeague] || activeLeague;
        const res = await fetch(`/api/standings?league=${encodeURIComponent(dbName)}`);
        const data = await res.json();
        setStandings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching standings:", err);
        setStandings([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStandings();
  }, [activeLeague]);

  return (
    <div className="min-h-screen bg-deep-black pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex flex-col items-center text-center gap-6 mb-16">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1.5 w-16 bg-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Análisis Técnico</span>
              <div className="h-1.5 w-16 bg-accent" />
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black text-text-primary uppercase tracking-tighter leading-[0.85] mb-8">
              Tablas de <br />
              <span className="text-accent text-glow">Clasificación</span>
            </h1>
            
            <div className="flex items-center gap-3 px-6 py-2 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-sm">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Última Sincronización</span>
              <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-mono font-black text-text-primary uppercase tracking-tighter">
                {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        <div className="relative mb-16">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 md:pb-0 md:flex-wrap md:justify-center">
            {LEAGUES.map((league) => (
              <button
                key={league}
                onClick={() => setActiveLeague(league)}
                className={cn(
                  "group relative flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-300 shrink-0 border",
                  "border-border-base bg-bg-surface/50 backdrop-blur-md",
                  activeLeague === league 
                    ? "border-accent/30 bg-bg-surface shadow-[0_10px_30px_-10px_rgba(200,255,0,0.1)]" 
                    : "hover:bg-bg-surface hover:border-accent/20"
                )}
              >
                {activeLeague === league && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                )}
                <div className={cn(
                  "h-7 w-7 shrink-0 transition-all duration-300 flex items-center justify-center rounded-sm p-0.5 bg-white",
                  activeLeague === league ? "scale-110" : "group-hover:scale-110"
                )}>
                  <img 
                    src={MASTER_LEAGUES[league] || (league.startsWith("Euro") ? MASTER_LEAGUES["Eurocopa"] : null) || (league.startsWith("Mundial") ? MASTER_LEAGUES["Mundial"] : null) || `/logos/leagues/${
                      league === "LaLiga" ? "la-liga" :
                      league === "MLS" ? "mls" :
                      league === "Serie A / Brasil" ? "serie-a-brasil" :
                      league.toLowerCase().replace(/\./g, '').replace(/ /g, '-')
                    }.png`} 
                    alt={league} 
                    className="h-full w-full object-contain filter drop-shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                  activeLeague === league ? "text-text-primary" : "text-text-muted group-hover:text-text-primary"
                )}>
                  {league}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-bg-surface border border-border-base rounded-lg overflow-hidden shadow-2xl relative min-h-[400px]">
          
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-surface/80 backdrop-blur-sm z-10">
              <Loader2 className="h-10 w-10 text-accent animate-spin mb-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Analizando Datos...</span>
            </div>
          ) : standings.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <Trophy className="h-16 w-16 text-text-muted/10 mb-4" />
              <h3 className="text-xl font-black italic uppercase text-text-muted">Sin datos disponibles</h3>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse table-fixed md:table-auto">
                {activeLeague !== "Eurocopa" && activeLeague !== "Mundial" && (
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="py-5 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-8 md:w-14">#</th>
                      <th className="py-5 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest w-auto">Equipo</th>
                      <th className="py-5 px-1 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-8 md:w-16">PJ</th>
                      <th className="py-6 px-4 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">G</th>
                      <th className="py-6 px-4 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">E</th>
                      <th className="py-6 px-4 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">P</th>
                      <th className="py-5 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-14 md:w-24">G</th>
                      <th className="py-5 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-10 md:w-16">DG</th>
                      <th className="py-5 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-12 md:w-24">Pts</th>
                      <th className="py-6 px-6 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-40 md:w-56">Forma</th>
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-white/[0.03]">
                  {standings.map((team, idx) => {
                    const isNewGroup = idx === 0 || standings[idx - 1].league !== team.league;
                    const groupTitle = team.league.includes(" - ") ? team.league.split(" - ").pop() : null;

                    return (
                      <React.Fragment key={`${team.league}-${team.team}`}>
                        {isNewGroup && groupTitle && (
                          <tr className="bg-white/[0.03] border-y border-white/5">
                            <th className="py-3 px-2 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest text-center w-8 md:w-14">#</th>
                            <th className="py-3 px-2 text-[9px] md:text-[10px] font-black text-accent uppercase tracking-[0.2em] w-auto">{groupTitle}</th>
                            <th className="py-3 px-1 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest text-center w-8 md:w-16">PJ</th>
                            <th className="py-3 px-4 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">G</th>
                            <th className="py-3 px-4 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">E</th>
                            <th className="py-3 px-4 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">P</th>
                            <th className="py-3 px-2 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest text-center w-14 md:w-24">G</th>
                            <th className="py-3 px-2 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest text-center w-10 md:w-16">DG</th>
                            <th className="py-3 px-2 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest text-center w-12 md:w-24">Pts</th>
                            <th className="py-3 px-6 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest text-center hidden md:table-cell w-40 md:w-56">Forma</th>
                          </tr>
                        )}
                        <tr 
                          className={cn(
                            "group hover:bg-accent/[0.02] transition-colors",
                            team.pos === 1 && "bg-accent/[0.02]"
                          )}
                        >
                          <td className="py-3 md:py-6 px-2 text-center">
                            <div className={cn(
                              "inline-flex items-center justify-center h-5 w-5 md:h-8 md:w-8 rounded-sm text-[9px] md:text-xs font-mono font-black border",
                              team.zone === "champions" ? "bg-accent text-bg-base border-accent shadow-[0_0_15px_rgba(200,255,0,0.3)]" : 
                              team.zone === "europa" ? "bg-bg-surface text-accent border-accent/20" :
                              team.zone === "relegation" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                              "bg-bg-base text-text-muted border-border-base"
                            )}>
                              {team.pos}
                            </div>
                          </td>
                          <td className="py-3 md:py-6 px-2">
                            <div className="flex items-center gap-1.5 md:gap-4">
                              <div className="h-6 w-6 md:h-12 md:w-12 bg-white rounded-sm p-1 md:p-2 shadow-sm flex items-center justify-center shrink-0">
                                <img src={team.logo_team || team.logo || "https://p-cdn.api-sports.io/football/teams/generic.png"} alt={team.public_name || team.team} className="h-full w-full object-contain" />
                              </div>
                              <span className="text-[10px] md:text-lg font-display font-black text-text-primary uppercase tracking-tight truncate max-w-[70px] md:max-w-none">{normalizeTeamName(team.public_name || team.team)}</span>
                            </div>
                          </td>
                          <td className="py-3 md:py-6 px-2 text-center text-[10px] md:text-sm font-mono font-bold text-text-secondary">{team.pj}</td>
                          <td className="py-4 md:py-6 px-4 text-center text-xs md:text-base font-mono font-bold text-text-muted hidden md:table-cell">{team.pg}</td>
                          <td className="py-4 md:py-6 px-4 text-center text-xs md:text-base font-mono font-bold text-text-muted hidden md:table-cell">{team.pe}</td>
                          <td className="py-4 md:py-6 px-4 text-center text-xs md:text-base font-mono font-bold text-text-muted hidden md:table-cell">{team.pp}</td>
                          <td className="py-3 md:py-6 px-2 text-center text-[9px] md:text-sm font-mono font-bold text-text-muted italic">
                            {(team.goals || "").split(':').slice(0, 2).join(':')}
                          </td>
                          <td className="py-3 md:py-6 px-2 text-center text-[9px] md:text-sm font-mono font-bold text-text-muted">
                            {(() => {
                              const [gf, gc] = (team.goals || "0:0").split(':').map(Number);
                              const diff = gf - gc;
                              return isNaN(diff) ? "0" : (diff > 0 ? `+${diff}` : diff);
                            })()}
                          </td>
                          <td className="py-3 md:py-6 px-2 text-center">
                            <span className="text-sm md:text-2xl font-mono font-black text-text-primary italic tracking-tighter">{team.pts}</span>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <div className="flex items-center justify-center gap-1.5 md:gap-2">
                              {(team.form || "").split('').map((res: string, i: number) => (
                                <div 
                                  key={i}
                                  className={cn(
                                    "h-5 w-5 md:h-8 md:w-8 rounded-sm flex items-center justify-center text-[9px] md:text-[11px] font-mono font-black shadow-lg",
                                    res === 'G' ? "bg-accent text-bg-base" :
                                    res === 'E' ? "bg-bg-surface text-text-muted border border-border-base" :
                                    res === 'P' ? "bg-red-500 text-white" :
                                    "bg-bg-base text-text-muted"
                                  )}
                                >
                                  {res}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-bg-base/50 px-6 md:px-10 py-8 border-t border-border-base">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 flex-1 max-w-4xl">
                  {currentLegend.zones.map((zone, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={cn("h-4 w-4 rounded-[4px] shrink-0", zone.color, zone.border)} />
                      <span className="text-[10px] font-black text-text-primary uppercase tracking-[0.1em] leading-none">
                        {zone.label}
                      </span>
                    </div>
                  ))}
                </div>
                
                {currentLegend.extraNote && (
                  <div className="flex items-start gap-3 max-w-xs md:border-l md:border-white/5 md:pl-8">
                    <div className="mt-0.5 p-1 bg-white/5 rounded-full">
                      <Info className="h-3 w-3 text-text-muted" />
                    </div>
                    <p className="text-[10px] font-medium text-text-muted leading-relaxed">
                      {currentLegend.extraNote}
                    </p>
                  </div>
                )}
              </div>

              {currentLegend.note && (
                <div className="pt-6 border-t border-white/5">
                  <p className="text-[10px] font-medium text-text-muted/60 leading-relaxed italic">
                    {currentLegend.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
