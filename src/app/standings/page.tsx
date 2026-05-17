"use client";

import React, { useEffect, useState, useMemo } from "react";
import { cn, normalizeTeamName } from "@/lib/utils";
import { Trophy, Info, Loader2, ArrowUpDown, ChevronDown, Star, RefreshCw } from "lucide-react";
import { MASTER_LEAGUES } from "@/lib/masterDictionaries";

const LEAGUES = [
  "LaLiga EA Sports",
  "Premier League",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
  "Eredivisie",
  "Liga Portugal",
  "LaLiga Hypermotion",
  "Championship",
  "2. Bundesliga",
  "Serie B",
  "Ligue 2",
  "Serie A Betano / Brasil",
  "MLS",
  "Eurocopa",
  "Mundial",
];

const LEAGUE_SLUGS: Record<string, string> = {
  "LaLiga EA Sports": "espana/laliga-ea-sports",
  "Premier League": "inglaterra/premier-league",
  "Bundesliga": "alemania/bundesliga",
  "Serie A": "italia/serie-a",
  "Ligue 1": "francia/ligue-1",
  "Eredivisie": "paises-bajos/eredivisie",
  "LaLiga Hypermotion": "espana/laliga-hypermotion",
  "Championship": "inglaterra/championship",
  "2. Bundesliga": "alemania/2-bundesliga",
  "Serie B": "italia/serie-b",
  "Ligue 2": "francia/ligue-2",
  "Serie A Betano / Brasil": "brasil/serie-a-betano",
  "MLS": "usa/mls",
  "Liga Portugal": "portugal/liga-portugal",
  "Eurocopa": "europa/eurocopa",
  "Mundial": "mundial/copa-del-mundo"
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
  "Serie A Betano / Brasil": {
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
  "LaLiga Hypermotion": {
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

const DB_TO_UI: Record<string, string> = {
  "Spain - LaLiga": "LaLiga EA Sports",
  "Spain - LaLiga2": "LaLiga Hypermotion",
  "England - Premier League": "Premier League",
  "Germany - Bundesliga": "Bundesliga",
  "Italy - Serie A": "Serie A",
  "France - Ligue 1": "Ligue 1",
  "Netherlands - Eredivisie": "Eredivisie",
  "Portugal - Primeira Liga": "Liga Portugal",
  "England - Championship": "Championship",
  "Germany - 2. Bundesliga": "2. Bundesliga",
  "Italy - Serie B": "Serie B",
  "France - Ligue 2": "Ligue 2",
  "Brazil - Brasileiro Serie A": "Serie A Betano / Brasil",
  "USA - MLS": "MLS",
};

export default function StandingsPage() {
  const [standingType, setStandingType] = useState<"general" | "local" | "visitante">("general");
  const [allStandings, setAllStandings] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [isChangingType, setIsChangingType] = useState(false);
  const [sortOrder, setSortOrder] = useState<Record<string, "asc" | "desc">>({});

  // Estado para controlar qué ligas están desplegadas (por defecto abrimos las 2 principales para máxima velocidad de carga)
  const [expandedLeagues, setExpandedLeagues] = useState<Record<string, boolean>>({
    "LaLiga EA Sports": true,
    "Premier League": true,
  });

  const toggleLeague = (league: string) => {
    setExpandedLeagues(prev => ({ ...prev, [league]: !prev[league] }));
  };

  const toggleSort = (league: string) => {
    setSortOrder(prev => ({ ...prev, [league]: prev[league] === "desc" ? "asc" : "desc" }));
  };

  useEffect(() => {
    async function fetchAllStandings() {
      if (Object.keys(allStandings).length === 0) {
        setLoading(true);
      } else {
        setIsChangingType(true);
      }
      try {
        const res = await fetch(`/api/standings?type=${standingType}`);
        const data = await res.json();
        
        const grouped: Record<string, any[]> = {};
        for (const row of (Array.isArray(data) ? data : [])) {
          let uiLeague = DB_TO_UI[row.league] || row.league;
          if (row.league.startsWith("Europe - Euro")) uiLeague = "Eurocopa";
          if (row.league.startsWith("World - World Cup")) uiLeague = "Mundial";
          
          if (!grouped[uiLeague]) grouped[uiLeague] = [];
          grouped[uiLeague].push(row);
        }
        setAllStandings(grouped);
      } catch (err) {
        console.error("Error fetching all standings:", err);
        setAllStandings({});
      } finally {
        setLoading(false);
        setIsChangingType(false);
      }
    }
    fetchAllStandings();
  }, [standingType]);

  return (
    <div className="min-h-screen bg-deep-black pt-28 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col items-center text-center gap-6 mb-12">
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
            
            <div className="flex items-center gap-3 px-6 py-2 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-sm mb-6">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Última Sincronización</span>
              <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-mono font-black text-text-primary uppercase tracking-tighter">
                {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {/* Standings Content - Accordion Layout */}
        <div className={cn("w-full space-y-6 transition-all duration-300", isChangingType && "opacity-60 pointer-events-none")}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.02]">
              <div className="relative">
                <RefreshCw className="h-10 w-10 text-neon-green animate-spin" />
                <div className="absolute inset-0 blur-xl bg-neon-green/20 animate-pulse" />
              </div>
              <span className="mt-6 text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Cargando clasificaciones...</span>
            </div>
          ) : LEAGUES.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.02]">
              <Trophy className="h-16 w-16 text-white/5 mb-6" />
              <p className="text-sm font-black uppercase tracking-widest text-white/20 italic">No hay ligas registradas</p>
            </div>
          ) : (
            LEAGUES.map((league) => {
              const leagueStandings = allStandings[league] || [];
              const isExpanded = !!expandedLeagues[league];
              const logo = MASTER_LEAGUES[league];
              const slug = LEAGUE_SLUGS[league];
              const standingsUrl = slug ? `https://www.flashscore.es/futbol/${slug}/clasificacion/` : "#";
              const currentSort = sortOrder[league] || "asc";
              const currentLegend = LEGENDS[league] || DEFAULT_LEGEND;

              const displayStandings = (() => {
                if (currentSort === "asc") return leagueStandings;
                const grouped = leagueStandings.reduce((acc, team) => {
                  const groupKey = team.league || "default";
                  if (!acc[groupKey]) acc[groupKey] = [];
                  acc[groupKey].push(team);
                  return acc;
                }, {} as Record<string, any[]>);
                return (Object.values(grouped) as any[][]).flatMap((group: any[]) => [...group].reverse());
              })();

              return (
                <div 
                  key={league} 
                  className="border border-white/10 rounded-xl overflow-hidden bg-[#070D14]/60 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300"
                >
                  {/* League Header / Accordion Bar */}
                  <div 
                    onClick={() => toggleLeague(league)}
                    className="flex items-center justify-between bg-[#0B1727] hover:bg-[#112238] border-b border-white/10 px-4 sm:px-6 py-3.5 cursor-pointer transition-all duration-200 select-none group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <Star className="h-4 w-4 text-white/40 hover:text-yellow-400 transition-colors shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); }} />
                      <div className="h-6 w-6 sm:h-7 sm:w-7 bg-white rounded-md p-1 flex items-center justify-center shrink-0 shadow-md">
                        <img src={logo || "https://p-cdn.api-sports.io/football/leagues/generic.png"} alt="" className="h-full w-full object-contain" />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate group-hover:text-neon-green transition-colors">
                        {league}
                      </span>
                      <span className="text-[10px] font-bold text-neon-green/80 bg-neon-green/10 px-2 py-0.5 rounded-full border border-neon-green/20 ml-1 shrink-0">
                        {leagueStandings.length} {league === "Eurocopa" || league === "Mundial" ? "selecciones" : "equipos"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <ChevronDown className={cn("h-4 w-4 text-white/40 group-hover:text-white transition-transform duration-300", isExpanded && "rotate-180 text-neon-green")} />
                    </div>
                  </div>

                  {/* Expanded Standings Table */}
                  {isExpanded && (
                    <div className="bg-[#070D14] divide-y divide-white/5">
                      {/* Selector de Modalidad estilo Flashscore por debajo del nombre de la liga */}
                      <div className="bg-[#070D14] px-4 sm:px-6 py-1.5 border-b border-white/10 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none select-none">
                        {(["general", "local", "visitante"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={(e) => { e.stopPropagation(); setStandingType(type); }}
                            className={cn(
                              "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap",
                              standingType === type 
                                ? "bg-neon-green text-deep-black shadow-[0_0_10px_rgba(0,255,135,0.2)] font-black" 
                                : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {type === "general" ? "General" : type === "local" ? "Local" : "Visitante"}
                          </button>
                        ))}
                      </div>

                      {leagueStandings.length === 0 ? (
                        <div className="px-6 py-12 text-center text-xs font-bold text-white/30 italic">
                          No hay datos de clasificación disponibles para esta competición.
                        </div>
                      ) : (
                        <div className="overflow-x-auto no-scrollbar">
                          <table className="w-full text-left border-collapse table-fixed md:table-auto">
                            <thead>
                              {league !== "Eurocopa" && league !== "Mundial" && (
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                  <th className="py-4 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-8 md:w-14">
                                    <button 
                                      onClick={() => toggleSort(league)}
                                      className="flex items-center justify-center gap-1 mx-auto hover:text-accent transition-colors"
                                      title="Invertir orden"
                                    >
                                      #
                                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                                    </button>
                                  </th>
                                  <th className="py-4 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest w-auto">Equipo</th>
                                  <th className="py-4 px-1 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-8 md:w-16">PJ</th>
                                  <th className="py-4 px-4 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">G</th>
                                  <th className="py-4 px-4 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">E</th>
                                  <th className="py-4 px-4 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">P</th>
                                  <th className="py-4 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-14 md:w-24">G</th>
                                  <th className="py-4 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-10 md:w-16">DG</th>
                                  <th className="py-4 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-12 md:w-24">Pts</th>
                                  <th className="py-4 px-6 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-40 md:w-56">Forma</th>
                                </tr>
                              )}
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                              {displayStandings.map((team, idx) => {
                                const isNewGroup = idx === 0 || displayStandings[idx - 1].league !== team.league;
                                const groupTitle = team.league.includes(" - ") ? team.league.split(" - ").pop() : null;

                                return (
                                  <React.Fragment key={`${team.league}-${team.team}-${idx}`}>
                                    {isNewGroup && groupTitle && (league === "Eurocopa" || league === "Mundial") && (
                                      <tr className="bg-white/[0.03] border-y border-white/5">
                                        <th className="py-3 px-2 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest text-center w-8 md:w-14">
                                          <button 
                                            onClick={() => toggleSort(league)}
                                            className="flex items-center justify-center gap-1 mx-auto hover:text-accent transition-colors"
                                            title="Invertir orden"
                                          >
                                            #
                                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                                          </button>
                                        </th>
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
                                      <td className="py-3.5 md:py-5 px-2 text-center">
                                        <div className={cn(
                                          "inline-flex items-center justify-center h-5 w-5 md:h-7 md:w-7 rounded-sm text-[9px] md:text-xs font-mono font-black border shadow-sm",
                                          team.zone === "champions" ? "bg-accent text-bg-base border-accent shadow-[0_0_15px_rgba(200,255,0,0.3)]" : 
                                          team.zone === "europa" ? "bg-bg-surface text-accent border-accent/20" :
                                          team.zone === "relegation" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                          "bg-bg-base text-text-muted border-border-base"
                                        )}>
                                          {team.pos}
                                        </div>
                                      </td>
                                      <td className="py-3.5 md:py-5 px-2">
                                        <div className="flex items-center gap-2.5 md:gap-4">
                                          <div className="h-6 w-6 md:h-9 md:w-9 bg-white rounded-sm p-1 shadow-sm flex items-center justify-center shrink-0">
                                            <img src={team.logo_team || team.logo || "https://p-cdn.api-sports.io/football/teams/generic.png"} alt={team.public_name || team.team} className="h-full w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                          </div>
                                          <span className="text-xs md:text-sm font-display font-black text-text-primary uppercase tracking-tight truncate max-w-[120px] md:max-w-none">{normalizeTeamName(team.public_name || team.team)}</span>
                                        </div>
                                      </td>
                                      <td className="py-3.5 md:py-5 px-2 text-center text-[10px] md:text-sm font-mono font-bold text-text-secondary">{team.pj}</td>
                                      <td className="py-3.5 md:py-5 px-4 text-center text-xs md:text-sm font-mono font-bold text-text-muted hidden md:table-cell">{team.pg}</td>
                                      <td className="py-3.5 md:py-5 px-4 text-center text-xs md:text-sm font-mono font-bold text-text-muted hidden md:table-cell">{team.pe}</td>
                                      <td className="py-3.5 md:py-5 px-4 text-center text-xs md:text-sm font-mono font-bold text-text-muted hidden md:table-cell">{team.pp}</td>
                                      <td className="py-3.5 md:py-5 px-2 text-center text-[9px] md:text-sm font-mono font-bold text-text-muted italic">
                                        {(team.goals || "").split(':').slice(0, 2).join(':')}
                                      </td>
                                      <td className="py-3.5 md:py-5 px-2 text-center text-[9px] md:text-sm font-mono font-bold text-text-muted">
                                        {(() => {
                                          const [gf, gc] = (team.goals || "0:0").split(':').map(Number);
                                          const diff = gf - gc;
                                          return isNaN(diff) ? "0" : (diff > 0 ? `+${diff}` : diff);
                                        })()}
                                      </td>
                                      <td className="py-3.5 md:py-5 px-2 text-center">
                                        <span className="text-sm md:text-xl font-mono font-black text-text-primary italic tracking-tighter">{team.pts}</span>
                                      </td>
                                      <td className="py-3.5 px-6 hidden md:table-cell">
                                        <div className="flex items-center justify-center gap-1 md:gap-1.5">
                                          {(team.form || "").split('').map((res: string, i: number) => (
                                            <div 
                                              key={i}
                                              className={cn(
                                                "h-5 w-5 md:h-7 md:w-7 rounded-sm flex items-center justify-center text-[9px] md:text-[11px] font-mono font-black shadow-sm",
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

                      {/* League Legend */}
                      <div className="bg-bg-base/40 px-6 md:px-8 py-6 border-t border-white/5">
                        <div className="flex flex-col gap-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 flex-1">
                              {currentLegend.zones.map((zone, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className={cn("h-3.5 w-3.5 rounded-[4px] shrink-0", zone.color, zone.border)} />
                                  <span className="text-[10px] font-black text-text-primary uppercase tracking-[0.1em] leading-none">
                                    {zone.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                            
                            {currentLegend.extraNote && (
                              <div className="flex items-start gap-3 max-w-xs md:border-l md:border-white/5 md:pl-6 shrink-0">
                                <div className="mt-0.5 p-1 bg-white/5 rounded-full shrink-0">
                                  <Info className="h-3 w-3 text-text-muted" />
                                </div>
                                <p className="text-[10px] font-medium text-text-muted leading-relaxed">
                                  {currentLegend.extraNote}
                                </p>
                              </div>
                            )}
                          </div>

                          {currentLegend.note && (
                            <div className="pt-4 border-t border-white/5">
                              <p className="text-[10px] font-medium text-text-muted/60 leading-relaxed italic">
                                {currentLegend.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
