"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Info, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Inicializamos el cliente de Supabase (Anon Key para lectura pública)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const LEAGUES = [
  "La Liga", "Premier League", "Bundesliga", "Serie A", "Ligue 1", "Eredivisie",
  "Segunda División", "Championship", "2. Bundesliga", "Serie B", "Ligue 2"
];

export default function StandingsPage() {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandings() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('standings')
          .select('*')
          .eq('league', activeLeague)
          .order('pos', { ascending: true });

        if (error) throw error;
        setStandings(data || []);
      } catch (err) {
        console.error("Error fetching standings:", err);
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[2px] w-8 bg-neon-green" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Live Rankings</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
              Clasificación <br />
              <span className="text-neon-green">Global</span>
            </h1>
          </div>
          <p className="text-white/40 text-xs md:text-sm max-w-xs font-medium leading-relaxed italic border-l border-white/10 pl-6">
            Consulta la posición de tus equipos favoritos en tiempo real y analiza sus dinámicas de cara a tus próximos picks.
          </p>
        </div>

        {/* Selector de Ligas (Tabs) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
          {LEAGUES.map((league, index) => (
            <button
              key={league}
              onClick={() => setActiveLeague(league)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                activeLeague === league 
                  ? "bg-neon-green text-black border-neon-green shadow-[0_0_20px_rgba(0,230,118,0.2)]" 
                  : "bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:text-white",
                // Centrar Ligue 2 en móvil y alinear en escritorio
                index === LEAGUES.length - 1 && "col-span-2 md:col-span-1 md:col-start-3"
              )}
            >
              {league}
            </button>
          ))}
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
                      <td className="py-3 md:py-6 px-1 text-center text-[10px] md:text-sm font-bold text-white/60">{team.pj}</td>
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
