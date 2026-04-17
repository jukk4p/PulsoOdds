"use client";

import { useState } from "react";
import { cn, translateBettingTerm, formatTeamName } from "@/lib/utils";
import { ChevronDown, ChevronUp, Zap, List, AlertTriangle, TrendingUp } from "lucide-react";

interface PickRowProps {
  pick: {
    sport: string;
    competition: string;
    match: string;
    market: string;
    pick: string;
    odds: number;
    stake: number;
    status: string;
    match_date: string;
    analysis?: string;
    alertas?: string;
    factores?: string;
    ev?: number;
    kickoff?: string;
    confianza?: number;
    league_logo?: string;
    home_logo?: string;
    away_logo?: string;
  };
}

export function PickRow({ pick }: PickRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const matchDate = new Date(pick.match_date);
  const dayName = matchDate.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const dayMonth = matchDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '');
  const formattedDay = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dayMonth}`;
  const formattedTime = pick.kickoff || matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  const [homeRaw, awayRaw] = (pick.match || "").split(/\s+vs\s+/i);
  const homeName = formatTeamName(homeRaw || "Local");
  const awayName = formatTeamName(awayRaw || "Visitante");

  const parseJsonList = (text: string | null | undefined) => {
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      return [text];
    } catch {
      return text.replace(/[\[\]"]/g, '').split(',').map(s => s.trim());
    }
  };

  const statusStyles = {
    pending: "text-[#c9a84c] bg-[#c9a84c]/10 border-[#c9a84c]/20",
    won: "text-[#00e676] bg-[#00e676]/10 border-[#00e676]/20",
    lost: "text-red-500 bg-red-500/10 border-red-500/20",
    void: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  };

  return (
    <div className="mb-3">
      {/* Main Card */}
      <div 
        className={cn(
          "bg-[#111f2e] border border-white/5 rounded-[10px] overflow-hidden transition-all duration-300",
          "hover:border-[#00e676]/30 hover:shadow-[0_0_20px_rgba(0,230,118,0.05)]"
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center py-4 px-5 md:px-6 gap-4 md:gap-0">
          
          {/* Column 1: Date/Time (Desktop: Fixed Width) */}
          <div className="flex flex-row md:flex-col items-center justify-between md:justify-center md:w-[135px] shrink-0 border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0 md:pr-4">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
              {formattedDay}
            </span>
            <span className="text-sm font-black text-[#00e676]">
              {formattedTime.replace(/\s*CET\s*/gi, '')} <span className="text-[10px] text-white/20 ml-0.5">CET</span>
            </span>
            {/* League Logo (Badge) - Standardized Size */}
            {pick.league_logo && (
              <div className="mt-2 flex items-center gap-2" title={pick.competition}>
                <div className="shrink-0 h-9 w-9 flex items-center justify-center bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                  <img 
                    src={pick.league_logo} 
                    alt={pick.competition} 
                    className="h-6 w-6 object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.2)] transition-transform hover:scale-110" 
                  />
                </div>
                <div className="md:hidden flex flex-col">
                  <span className="text-[10px] text-white/50 font-black leading-none">{pick.competition}</span>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Home Team (Desktop: Flex-1, Right Aligned) */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-3 px-4 min-w-0 md:pt-10">
             <span className="text-base font-bold text-white truncate text-right">
               {homeName}
             </span>
             {pick.home_logo && (
               <div className="shrink-0 h-9 w-9 flex items-center justify-center bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                 <img src={pick.home_logo} alt="" className="h-6 w-6 object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]" />
               </div>
             )}
          </div>

          {/* Column 3: VS Center (Desktop: Fixed Width) */}
          <div className="hidden md:flex flex-col items-center justify-center w-[80px] shrink-0 md:pt-10">
            <span className="text-[11px] font-black italic text-white/20">VS</span>
            <span className="text-[9px] text-white/30 uppercase font-black truncate max-w-full text-center mt-0.5 whitespace-nowrap">
              {pick.competition}
            </span>
          </div>

          {/* Column 4: Away Team (Desktop: Flex-1, Left Aligned) */}
          <div className="hidden md:flex flex-1 items-center justify-start gap-3 px-4 min-w-0 md:pt-10">
             {pick.away_logo && (
               <div className="shrink-0 h-9 w-9 flex items-center justify-center bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                 <img src={pick.away_logo} alt="" className="h-6 w-6 object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]" />
               </div>
             )}
             <span className="text-base font-bold text-white truncate text-left">
               {awayName}
             </span>
          </div>

          {/* MOBILE ONLY: Match Row */}
          <div className="md:hidden flex flex-col items-center py-1">
             <div className="flex items-center gap-3 mb-2">
                {pick.home_logo && <img src={pick.home_logo} alt="" className="h-5 w-5 object-contain" />}
                <span className="text-[10px] text-white/20 font-black italic uppercase">vs</span>
                {pick.away_logo && <img src={pick.away_logo} alt="" className="h-5 w-5 object-contain" />}
             </div>
             <h4 className="text-sm font-bold text-white text-center">
               {homeName} <span className="text-white/20 mx-1">vs</span> {awayName}
             </h4>
             <span className="text-[9px] text-white/30 uppercase font-bold mt-1 tracking-widest">{pick.competition}</span>
          </div>

          {/* Column 5: Betting Description (Center Column) */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 md:py-0 border-y md:border-y-0 border-white/5 md:pt-11">
             <span className="text-[10px] text-white/30 uppercase font-bold mb-0.5">
               {translateBettingTerm(pick.market)}
             </span>
             <span className="text-xs md:text-sm font-black uppercase text-[#00e676] text-center leading-tight">
               {translateBettingTerm(pick.pick)}
             </span>
          </div>

          {/* Column 6: Odds (Desktop: Fixed width) */}
          <div className="flex items-center justify-center md:w-[100px] shrink-0 md:pt-12">
             <div className="bg-[#00e676]/10 border border-[#00e676]/20 px-3 py-1.5 rounded-lg flex flex-col items-center">
                <span className="text-[8px] text-[#00e676]/60 font-black tracking-tighter uppercase">Cuota</span>
                <span className="text-sm font-black text-[#00e676] italic">@{pick.odds.toFixed(2)}</span>
             </div>
          </div>

          {/* Column 7: Actions (Desktop: Status + Chevron) */}
          <div className="flex items-center justify-center md:justify-end gap-3 md:w-[160px] shrink-0 pt-2 md:pt-12">
             <div className={cn(
               "flex items-center justify-center px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-wider min-w-[100px]",
               pick.status === 'pending' ? "text-black bg-[#c9a84c] border-[#c9a84c]" : statusStyles[pick.status as keyof typeof statusStyles]
             )}>
                {pick.status === 'pending' ? 'PENDIENTE' : pick.status === 'won' ? 'GANADA' : 'PERDIDA'}
             </div>
             
             <button 
               onClick={() => setIsExpanded(!isExpanded)}
               className="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/50"
             >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
             </button>
          </div>
        </div>

        {/* Expanded Analysis */}
        {isExpanded && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
            <div className="grid md:grid-cols-3 gap-6 pt-4">
               <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-[#00e676] shadow-[0_0_10px_#00e676]" style={{ width: `${pick.confianza || 0}%` }} />
                        </div>
                        <span className="text-[10px] text-white/40 uppercase font-bold">Confianza: {pick.confianza || 0}%</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                        <Zap size={12} className="text-[#00e676]" />
                        <span className="text-[10px] text-white/40 uppercase font-bold">Stake: <span className="text-white">{pick.stake || 0}/10</span></span>
                     </div>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed font-medium italic">
                    {pick.analysis || "No hay análisis detallado disponible."}
                  </p>
               </div>

               <div className="space-y-4">
                  {pick.factores && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3 text-[#00e676]">
                        <List size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Factores Clave</span>
                      </div>
                      <ul className="space-y-1.5">
                        {parseJsonList(pick.factores).map((f, i) => (
                          <li key={i} className="text-[11px] text-white/60 leading-tight flex gap-2">
                            <span className="text-[#00e676]">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pick.alertas && (
                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3 text-orange-500">
                        <AlertTriangle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Riesgos</span>
                      </div>
                      <ul className="space-y-1.5">
                        {parseJsonList(pick.alertas).map((a, i) => (
                          <li key={i} className="text-[11px] text-orange-400/80 leading-tight flex gap-2">
                            <span>!</span> {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pick.ev != null && pick.ev > 0 && (
                    <div className="bg-[#00e676]/5 border border-[#00e676]/10 rounded-xl p-3 flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-[#00e676]" />
                          <span className="text-[10px] text-white/30 uppercase font-bold">Valor Estimado (+EV)</span>
                       </div>
                       <span className="text-sm font-black text-[#00e676]">+{pick.ev.toFixed(2)}%</span>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
