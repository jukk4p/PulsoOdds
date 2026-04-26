"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Info, Loader2 } from "lucide-react";
import { MASTER_LEAGUES } from "@/lib/masterDictionaries";


const LEAGUES = [
  "LaLiga EA Sports", "LaLiga Hypermotion", "Premier League", "Bundesliga", "Serie A", "Ligue 1", 
  "Eredivisie", "Championship", "2. Bundesliga", "Serie B", "Ligue 2", "Serie A / Brasil", "MLS"
];

const LEAGUE_COLORS: Record<string, string> = {
  "LaLiga EA Sports": "rgba(238, 30, 41, 0.4)",
  "LaLiga Hypermotion": "rgba(238, 30, 41, 0.4)",
  "Premier League": "rgba(61, 25, 91, 0.4)",
  "Bundesliga": "rgba(209, 7, 19, 0.4)",
  "Serie A": "rgba(0, 140, 206, 0.4)",
  "Ligue 1": "rgba(218, 255, 57, 0.4)",
  "Eredivisie": "rgba(242, 145, 0, 0.4)",
  "Championship": "rgba(61, 25, 91, 0.4)",
  "2. Bundesliga": "rgba(209, 7, 19, 0.4)",
  "Serie B": "rgba(0, 140, 206, 0.4)",
  "Ligue 2": "rgba(218, 255, 57, 0.4)",
  "Serie A / Brasil": "rgba(0, 151, 57, 0.4)",
  "MLS": "rgba(0, 0, 0, 0.4)"
};



const LEAGUE_DB_NAMES: Record<string, string> = {
  "LaLiga EA Sports":    "Spain - LaLiga",
  "LaLiga Hypermotion": "Spain - LaLiga2",
  "Premier League":      "England - Premier League",
  "Bundesliga":          "Germany - Bundesliga",
  "Serie A":             "Italy - Serie A",
  "Ligue 1":             "France - Ligue 1",
  "Eredivisie":          "Netherlands - Eredivisie",
  "Championship":        "England - Championship",
  "2. Bundesliga":       "Germany - 2. Bundesliga",
  "Serie B":             "Italy - Serie B",
  "Ligue 2":             "France - Ligue 2",
  "Serie A / Brasil":    "Brazil - Serie A",
  "MLS":                 "USA - MLS",
};

export default function StandingsPage() {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                  "h-7 w-7 shrink-0 transition-all duration-300 flex items-center justify-center",
                  activeLeague === league ? "scale-110" : "group-hover:scale-110"
                )}>
                  <img 
                    src={MASTER_LEAGUES[league] || `/logos/leagues/${
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
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="py-5 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-8 md:w-14">#</th>
                    <th className="py-5 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest w-auto">Equipo</th>
                    <th className="py-5 px-1 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-8 md:w-16">PJ</th>
                    <th className="py-6 px-4 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">G</th>
                    <th className="py-6 px-4 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">E</th>
                    <th className="py-6 px-4 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-12 md:w-20">P</th>
                    <th className="py-5 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-14 md:w-24">G</th>
                    <th className="py-5 px-2 text-[9px] md:text-[11px] font-black text-white/20 uppercase tracking-widest text-center w-12 md:w-24">Pts</th>
                    <th className="py-6 px-6 text-[10px] md:text-xs font-black text-white/20 uppercase tracking-widest text-center hidden md:table-cell w-40 md:w-56">Forma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {standings.map((team) => (
                      <tr 
                        key={`${team.league}-${team.team}`} 
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
                            <span className="text-[10px] md:text-lg font-display font-black text-text-primary uppercase tracking-tight truncate max-w-[70px] md:max-w-none">{team.public_name || team.team}</span>
                          </div>
                        </td>
                        <td className="py-3 md:py-6 px-2 text-center text-[10px] md:text-sm font-mono font-bold text-text-secondary">{team.pj}</td>
                        <td className="py-4 md:py-6 px-4 text-center text-xs md:text-base font-mono font-bold text-text-muted hidden md:table-cell">{team.pg}</td>
                        <td className="py-4 md:py-6 px-4 text-center text-xs md:text-base font-mono font-bold text-text-muted hidden md:table-cell">{team.pe}</td>
                        <td className="py-4 md:py-6 px-4 text-center text-xs md:text-base font-mono font-bold text-text-muted hidden md:table-cell">{team.pp}</td>
                        <td className="py-3 md:py-6 px-2 text-center text-[9px] md:text-sm font-mono font-bold text-text-muted italic">
                          {(team.goals || "").split(':').slice(0, 2).join(':')}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-bg-base/50 px-4 md:px-8 py-6 flex flex-wrap gap-x-8 gap-y-4 items-center justify-center border-t border-border-base">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-sm bg-accent shadow-[0_0_8px_rgba(200,255,0,0.4)]" />
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Champions League</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-sm border border-accent/30 bg-accent/5" />
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Europa League</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-sm bg-red-500/20 border border-red-500/40" />
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Zona de Descenso</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
