"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Info, Loader2 } from "lucide-react";

const LEAGUES = [
  "LaLiga EA Sports", "Premier League", "Bundesliga", "Serie A", "Ligue 1", "Eredivisie",
  "LaLiga Hypermotion", "Championship", "2. Bundesliga", "Serie B", "Ligue 2"
];

const LEAGUE_COLORS: Record<string, string> = {
  "LaLiga EA Sports": "rgba(238, 37, 46, 0.4)",
  "Premier League": "rgba(61, 25, 91, 0.4)",
  "Bundesliga": "rgba(211, 1, 12, 0.4)",
  "Serie A": "rgba(0, 143, 215, 0.4)",
  "Ligue 1": "rgba(218, 224, 37, 0.4)",
  "Eredivisie": "rgba(245, 112, 0, 0.4)",
  "LaLiga Hypermotion": "rgba(238, 37, 46, 0.2)",
  "Championship": "rgba(255, 255, 255, 0.1)",
  "2. Bundesliga": "rgba(211, 1, 12, 0.2)",
  "Serie B": "rgba(0, 143, 215, 0.2)",
  "Ligue 2": "rgba(218, 224, 37, 0.2)"
};
// Mapeo de nombres de UI → nombres exactos en Supabase
const LEAGUE_DB_NAMES: Record<string, string> = {
  "LaLiga EA Sports":    "Spain - LaLiga",
  "Premier League":      "England - Premier League",
  "Bundesliga":          "Germany - Bundesliga",
  "Serie A":             "Italy - Serie A",
  "Ligue 1":             "France - Ligue 1",
  "Eredivisie":          "Netherlands - Eredivisie",
  "LaLiga Hypermotion":  "Segunda División",
  "Championship":        "England - Championship",
  "2. Bundesliga":       "Germany - 2. Bundesliga",
  "Serie B":             "Italy - Serie B",
  "Ligue 2":             "France - Ligue 2",
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
        
        {/* Header de la Página */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[2px] w-8 bg-neon-green" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Premium Standings</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.8]">
              Tablas de <br />
              <span className="text-neon-green">Clasificación</span>
            </h1>
          </div>
          <p className="text-white/40 text-xs md:text-sm max-w-xs font-medium leading-relaxed italic border-l border-white/10 pl-6 hidden md:block">
            Explora las dinámicas de las mejores ligas de Europa con datos actualizados en tiempo real para tus picks de valor.
          </p>
        </div>

        {/* Selector de Ligas Estilo Premium */}
        <div className="relative mb-16">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 md:pb-0 md:flex-wrap md:justify-center">
            {LEAGUES.map((league) => (
              <button
                key={league}
                onClick={() => setActiveLeague(league)}
                className={cn(
                  "group relative flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-500 shrink-0",
                  "border border-white/5 bg-white/[0.02] backdrop-blur-md",
                  activeLeague === league 
                    ? "border-neon-green/30 bg-white/[0.05] shadow-[0_10px_30px_-10px_rgba(0,255,135,0.2)]" 
                    : "hover:bg-white/[0.05] hover:border-white/10"
                )}
                style={{
                  boxShadow: activeLeague === league ? `0 0 25px ${LEAGUE_COLORS[league] || 'rgba(0,255,135,0.1)'}` : ''
                }}
              >
                <div className={cn(
                  "h-6 w-6 shrink-0 transition-all duration-500 flex items-center justify-center",
                  activeLeague === league ? "scale-125 rotate-6" : "opacity-30 grayscale group-hover:opacity-60 group-hover:grayscale-0 group-hover:scale-110"
                )}>
                  <img 
                    src={`/logos/leagues/${league.toLowerCase().replace(/\./g, '').replace(/ /g, '-')}.png`} 
                    alt="" 
                    className="h-full w-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                  activeLeague === league ? "text-white" : "text-white/30 group-hover:text-white/60"
                )}>
                  {league}
                </span>
                
                {/* Indicador de Línea Activa */}
                {activeLeague === league && (
                  <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-neon-green rounded-full shadow-[0_0_10px_#00ff87]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Clasificación */}
        <div className="bg-[#111f2e] border border-white/5 rounded-2xl md:rounded-[30px] overflow-hidden shadow-2xl relative min-h-[400px]">
          
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111f2e]/80 backdrop-blur-sm z-10">
              <Loader2 className="h-10 w-10 text-neon-green animate-spin mb-4" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Sincronizando datos...</span>
            </div>
          ) : standings.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <Trophy className="h-16 w-16 text-white/5 mb-4" />
              <h3 className="text-xl font-black italic uppercase text-white/20">Sin datos disponibles</h3>
              <p className="text-white/10 text-xs mt-2 max-w-xs">Estamos actualizando la clasificación de esta liga. Vuelve en unos minutos.</p>
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
                        "group hover:bg-white/[0.01] transition-colors",
                        team.pos === 1 && "bg-neon-green/[0.02]"
                      )}
                    >
                      <td className="py-3 md:py-6 px-2 text-center">
                        <div className={cn(
                          "inline-flex items-center justify-center h-5 w-5 md:h-8 md:w-8 rounded md:rounded-lg text-[9px] md:text-xs font-black italic",
                          team.zone === "champions" ? "bg-neon-green text-black shadow-[0_0_10px_rgba(0,230,118,0.3)]" : 
                          team.zone === "europa" ? "bg-blue-500 text-white" :
                          team.zone === "relegation" ? "bg-red-500 text-white" :
                          "bg-white/5 text-white/40"
                        )}>
                          {team.pos}
                        </div>
                      </td>
                      <td className="py-3 md:py-6 px-2">
                        <div className="flex items-center gap-1.5 md:gap-4">
                          <div className="h-6 w-6 md:h-12 md:w-12 bg-white rounded p-0.5 md:p-1.5 shadow-sm flex items-center justify-center shrink-0">
                            <img src={team.logo || "https://p-cdn.api-sports.io/football/teams/generic.png"} alt={team.team} className="h-full w-full object-contain" />
                          </div>
                          <span className="text-[10px] md:text-lg font-black text-white/90 uppercase tracking-tight truncate max-w-[70px] md:max-w-none">{team.team}</span>
                        </div>
                      </td>
                      <td className="py-3 md:py-6 px-2 text-center text-[10px] md:text-sm font-bold text-white/60">{team.pj}</td>
                      <td className="py-4 md:py-6 px-4 text-center text-xs md:text-base font-bold text-white/30 hidden md:table-cell">{team.g}</td>
                      <td className="py-4 md:py-6 px-4 text-center text-xs md:text-base font-bold text-white/30 hidden md:table-cell">{team.e}</td>
                      <td className="py-4 md:py-6 px-4 text-center text-xs md:text-base font-bold text-white/30 hidden md:table-cell">{team.p}</td>
                      <td className="py-3 md:py-6 px-2 text-center text-[9px] md:text-sm font-bold text-white/40 italic">
                        {(team.goals || "").split(':').slice(0, 2).join(':')}
                      </td>
                      <td className="py-3 md:py-6 px-2 text-center">
                        <span className="text-sm md:text-2xl font-black text-white italic tracking-tighter">{team.pts}</span>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1.5 md:gap-2">
                          <div className="h-5 w-5 md:h-8 md:w-8 rounded-md flex items-center justify-center text-[9px] md:text-[11px] font-black shadow-lg bg-white/10 text-white/20">
                            ?
                          </div>
                          {(team.form || "").split('').map((res: string, i: number) => (
                            <div 
                              key={i}
                              className={cn(
                                "h-5 w-5 md:h-8 md:w-8 rounded-md flex items-center justify-center text-[9px] md:text-[11px] font-black shadow-lg",
                                res === 'G' ? "bg-green-500 text-white" :
                                res === 'E' ? "bg-orange-500 text-white" :
                                res === 'P' ? "bg-red-500 text-white" :
                                "bg-white/10 text-white/20"
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

          {/* Leyenda de la Tabla */}
          <div className="bg-black/20 px-4 md:px-8 py-6 flex flex-wrap gap-x-8 gap-y-4 items-center justify-center border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,230,118,0.4)]" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Champions League</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Europa League</span>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto justify-center">
              <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Descenso</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
