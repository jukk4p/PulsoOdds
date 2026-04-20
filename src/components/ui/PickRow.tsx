"use client";

import { useState } from "react";
import { cn, translateBettingTerm, formatTeamName, normalizeOdds, normalizeBettingPick } from "@/lib/utils";
import { ChevronDown, ChevronUp, Zap, List, AlertTriangle, TrendingUp, CheckCircle2, XCircle, Clock, MinusCircle, ShieldCheck } from "lucide-react";

interface PickRowProps {
  pick: {
    id: string;
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
    razonamiento?: string;
    alertas?: string;
    factores?: string;
    ev?: number;
    is_verified?: boolean;
    kickoff?: string;
    confianza?: number;
    league_logo?: string;
    home_logo?: string;
    away_logo?: string;
  };
  isSelected?: boolean;
  onToggle?: () => void;
}

export function PickRow({ pick, isSelected, onToggle }: PickRowProps) {
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

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock size={16} className="shrink-0" />,
    won: <CheckCircle2 size={16} className="shrink-0" />,
    lost: <XCircle size={16} className="shrink-0" />,
    void: <MinusCircle size={16} className="shrink-0" />,
  };

  const statusLabels: Record<string, string> = {
    pending: "PENDIENTE",
    won: "GANADA",
    lost: "PERDIDA",
    void: "NULA",
  };

  const GENERIC_SHIELD = "https://img.icons8.com/ios-filled/100/ffffff/shield.png";
  const GENERIC_LEAGUE = "https://img.icons8.com/ios-filled/100/ffffff/trophy.png";

  const getLocalLogoPath = (url: string | undefined, type: 'teams' | 'leagues') => {
    if (!url || !url.includes('/')) return null;
    const filename = url.split('/').pop();
    return `/logos/${type}/${filename}`;
  };

  return (
    <div className="mb-3">
      {/* Main Card */}
      <div 
        className={cn(
          "bg-[#111f2e] border border-white/5 rounded-[10px] overflow-hidden transition-all duration-300 relative",
          "hover:border-[#00e676]/30 hover:shadow-[0_0_20px_rgba(0,230,118,0.05)]",
          (pick.confianza || pick.stake || 5) >= 8 && "border-[#00e676]/20 shadow-[0_0_15px_rgba(0,230,118,0.1)]",
          isSelected && "border-[#00e676]/50 shadow-[0_0_25px_rgba(0,255,135,0.15)] bg-slate-900/80"
        )}
      >
          <div className="flex flex-col md:flex-row md:items-center pt-9 pb-4 md:pt-11 md:pb-5 px-5 md:px-6 gap-4 md:gap-0 relative">
            {/* Column 1: League (Fixed width) */}
            <div className="hidden md:flex flex-col items-center justify-center w-[70px] shrink-0 md:border-r border-white/5 pr-4">
                <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl border border-white/20 overflow-hidden shadow-lg" title={pick.competition}>
                  <img 
                    src={getLocalLogoPath(pick.league_logo, 'leagues') || pick.league_logo || GENERIC_LEAGUE} 
                    alt={pick.competition} 
                    className="h-7 w-7 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.includes('/logos/')) {
                        target.src = pick.league_logo || GENERIC_LEAGUE;
                      } else {
                        target.src = GENERIC_LEAGUE;
                      }
                    }}
                  />
                </div>
            </div>

            {/* Column 2: Date & Teams Area */}
            <div className="hidden md:flex flex-[4] flex-col items-center justify-center px-6 border-r border-white/5">
              {/* Floating Header: Date & Time (Doesn't push the center) */}
              <div className="absolute top-3 left-0 right-0 md:left-auto md:right-auto md:w-full flex items-center justify-center gap-3 opacity-60 pointer-events-none">
                 <span className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em]">{formattedDay}</span>
                 <div className="h-[1px] w-4 bg-white/10" />
                 <span className="text-xs font-black text-[#00e676] tracking-wider">{formattedTime.replace(/\s*CET\s*/gi, '')}</span>
                 <div className="h-[1px] w-4 bg-white/10" />
                 <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.1em]">{pick.competition}</span>
              </div>

              <div className="flex items-center justify-center gap-4 w-full">
                {/* Home */}
                <div className="flex flex-1 items-center justify-end gap-3 min-w-0">
                   <span className="text-sm font-bold text-white truncate text-right uppercase tracking-tight">{homeName}</span>
                    <div className="shrink-0 h-8 w-8 flex items-center justify-center bg-white rounded-lg border border-white/20 overflow-hidden p-1 shadow-sm">
                      <img 
                        src={getLocalLogoPath(pick.home_logo, 'teams') || pick.home_logo || GENERIC_SHIELD} 
                        alt="" 
                        className={cn("h-6 w-6 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)]", !pick.home_logo && "opacity-30 grayscale")} 
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes('/logos/')) {
                            target.src = pick.home_logo || GENERIC_SHIELD;
                          } else {
                            target.src = GENERIC_SHIELD;
                          }
                        }}
                      />
                    </div>
                </div>

                {/* VS Badge */}
                <div className="flex flex-col items-center shrink-0">
                   <span className="text-[9px] font-black italic text-[#00e676] bg-[#00e676]/10 px-2 py-0.5 rounded-md border border-[#00e676]/20">VS</span>
                </div>

                {/* Away */}
                <div className="flex flex-1 items-center justify-start gap-3 min-w-0">
                    <div className="shrink-0 h-8 w-8 flex items-center justify-center bg-white rounded-lg border border-white/20 overflow-hidden p-1 shadow-sm">
                      <img 
                        src={getLocalLogoPath(pick.away_logo, 'teams') || pick.away_logo || GENERIC_SHIELD} 
                        alt="" 
                        className={cn("h-6 w-6 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)]", !pick.away_logo && "opacity-30 grayscale")} 
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes('/logos/')) {
                            target.src = pick.away_logo || GENERIC_SHIELD;
                          } else {
                            target.src = GENERIC_SHIELD;
                          }
                        }}
                      />
                    </div>
                   <span className="text-sm font-bold text-white truncate text-left uppercase tracking-tight">{awayName}</span>
                </div>
              </div>
            </div>

            {/* MOBILE ONLY: Match Row */}
            <div className="md:hidden flex flex-col items-center py-6 bg-white/[0.02] rounded-xl my-2 relative">
               {/* Mobile Header: League & Time */}
               <div className="flex flex-col items-center gap-2 mb-6">
                  <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl border border-white/20 overflow-hidden shadow-lg">
                    <img 
                      src={getLocalLogoPath(pick.league_logo, 'leagues') || pick.league_logo || GENERIC_LEAGUE} 
                      alt={pick.competition} 
                      className="h-7 w-7 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('/logos/')) {
                          target.src = pick.league_logo || GENERIC_LEAGUE;
                        } else {
                          target.src = GENERIC_LEAGUE;
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-white/30 uppercase font-bold tracking-[0.2em]">{pick.competition}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-[#00e676]">{formattedDay}</span>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[10px] font-bold text-[#00e676]">{formattedTime.replace(/\s*CET\s*/gi, '')}</span>
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-8 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-110" />
                    <div className="h-12 w-12 flex items-center justify-center bg-white rounded-full border border-white/20 overflow-hidden shadow-lg relative z-10">
                      <img 
                        src={getLocalLogoPath(pick.home_logo, 'teams') || pick.home_logo || GENERIC_SHIELD} 
                        alt="" 
                        className={cn("h-9 w-9 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]", !pick.home_logo && "opacity-30 grayscale")} 
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes('/logos/')) {
                            target.src = pick.home_logo || GENERIC_SHIELD;
                          } else {
                            target.src = GENERIC_SHIELD;
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] text-[#00e676] font-black italic uppercase tracking-[0.2em] bg-[#00e676]/10 px-3 py-1 rounded-full border border-[#00e676]/20 shadow-[0_0_15px_rgba(0,230,118,0.1)]">VS</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#00e676]/15 blur-2xl rounded-full scale-150 opacity-50" />
                    <div className="h-12 w-12 flex items-center justify-center bg-white rounded-full border border-white/20 overflow-hidden shadow-lg relative z-10">
                      <img 
                        src={getLocalLogoPath(pick.away_logo, 'teams') || pick.away_logo || GENERIC_SHIELD} 
                        alt="" 
                        className={cn("h-9 w-9 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]", !pick.away_logo && "opacity-30 grayscale")} 
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes('/logos/')) {
                            target.src = pick.away_logo || GENERIC_SHIELD;
                          } else {
                            target.src = GENERIC_SHIELD;
                          }
                        }}
                      />
                    </div>
                  </div>
               </div>
               
               <div className="flex flex-col items-center px-4 w-full">
                 <h4 className="text-xl font-black text-white text-center leading-none uppercase italic tracking-tighter">
                   {homeName}
                 </h4>
                 <div className="flex items-center gap-3 my-3 w-full justify-center">
                   <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                   <div className="w-1.5 h-1.5 rounded-full border border-white/20" />
                   <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
                 </div>
                 <h4 className="text-xl font-black text-white text-center leading-none uppercase italic tracking-tighter">
                   {awayName}
                 </h4>
               </div>
            </div>

             {/* Column 5: Betting Description */}
             <div className="flex flex-[2.5] flex-col items-center justify-center px-4 py-4 md:py-0 border-y md:border-y-0 md:border-r border-white/5 text-center h-full">
                <div className="flex flex-col gap-1 items-center bg-slate-900/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm group hover:bg-slate-800/60 transition-all duration-300 w-full max-w-[220px] shadow-inner min-h-[85px] justify-center">
                  <span className="text-[9px] text-[#00e676] font-black tracking-[0.2em] mb-1.5 opacity-60">
                    MERCADO SELECCIONADO
                  </span>
                  
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-white/50 uppercase font-bold italic tracking-wide">
                      {translateBettingTerm(pick.market || "Hándicap")}
                    </span>
                    <span className="text-sm font-black uppercase text-[#00e676] leading-none drop-shadow-[0_0_12px_rgba(0,230,118,0.25)] italic">
                      {translateBettingTerm(pick.pick)}
                    </span>
                  </div>
                </div>
             </div>

            {/* Column 6: Odds */}
            <div className="flex items-center justify-center md:w-[110px] shrink-0 md:border-r border-white/5 py-4 md:py-0 h-full">
               <div className="bg-[#00e676]/10 border border-[#00e676]/20 px-3 py-3 rounded-xl flex flex-col items-center relative group/tooltip min-h-[85px] justify-center w-[90px] backdrop-blur-sm shadow-inner transition-all hover:bg-[#00e676]/20">
                  <span className="text-[8px] text-[#00e676]/60 font-black tracking-widest uppercase">Cuota</span>
                  <div className="flex items-center gap-1">
                    <span className="text-base font-black text-[#00e676] italic">@{normalizeOdds(pick.odds).toFixed(2)}</span>
                    {pick.is_verified && (
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                    )}
                  </div>
                  
                  {pick.is_verified && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[8px] font-black py-1 px-2 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-tighter">
                      Cuota Verificada
                    </div>
                  )}
               </div>
            </div>

            {/* Column 7: Actions & Badge */}
            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-[260px] shrink-0 pt-4 md:pt-0 px-2 md:pl-6 h-full self-center">
               {/* Selection Toggle (Moved here) */}
               <div className="flex items-center justify-center mr-2">
                 <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle?.();
                    }}
                    className={cn(
                      "h-10 w-10 md:h-9 md:w-9 rounded-xl border transition-all duration-300 flex items-center justify-center group/btn shadow-sm",
                      isSelected 
                        ? "bg-neon-green border-neon-green text-deep-black shadow-[0_0_15px_rgba(0,255,135,0.4)]" 
                        : "bg-white/5 border-white/10 text-white/20 hover:border-neon-green/50 hover:text-neon-green hover:bg-neon-green/5"
                    )}
                    title={isSelected ? "Quitar de la combinada" : "Añadir a la combinada"}
                  >
                    {isSelected ? (
                      <CheckCircle2 size={18} className="animate-in zoom-in" />
                    ) : (
                      <TrendingUp size={16} className="group-hover/btn:scale-110 transition-transform" />
                    )}
                  </button>
               </div>

               <div className="flex flex-col items-center md:items-end gap-2 h-[85px] justify-center mr-2">
                 {/* Confidence Meter */}
                 <div className="flex flex-col items-center md:items-end gap-1">
                   <div className="flex gap-0.5">
                     {[...Array(10)].map((_, i) => (
                       <div 
                         key={i} 
                         className={cn(
                           "w-1 h-3 rounded-full transition-all duration-500",
                           i < (pick.confianza || pick.stake || 5) 
                             ? (pick.confianza || pick.stake || 5) >= 8 
                               ? "bg-neon-green shadow-[0_0_8px_rgba(0,255,135,0.5)]" 
                               : "bg-white/40"
                             : "bg-white/5"
                         )}
                       />
                     ))}
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/20">Confianza</span>
                 </div>
               </div>
              <div className="flex items-center gap-3 h-[85px]">
                 {/* Interactive Badge */}
                 <div className="group relative flex items-center justify-center">
                   <div className={cn(
                     "flex items-center justify-center h-10 w-10 md:group-hover:w-32 rounded-full md:rounded-xl border transition-all duration-300 ease-out overflow-hidden cursor-help",
                     pick.status === 'pending' ? "text-slate-900 bg-[#c9a84c] border-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.2)]" : statusStyles[pick.status as keyof typeof statusStyles],
                     (pick.confianza || pick.stake || 5) >= 8 && "animate-pulse shadow-[0_0_15px_rgba(0,230,118,0.3)]"
                   )}>
                      <div className="flex items-center gap-2 px-3">
                        {statusIcons[pick.status as keyof typeof statusIcons] || statusIcons.pending}
                        <span className="hidden md:group-hover:block text-[10px] font-black uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                          {statusLabels[pick.status as keyof typeof statusLabels]}
                        </span>
                      </div>
                   </div>
                   
                   <span className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-[8px] font-bold px-2 py-1 rounded border border-white/10 opacity-0 group-active:opacity-100 transition-opacity">
                     {statusLabels[pick.status as keyof typeof statusLabels]}
                   </span>
                 </div>
                 
                 <button 
                   onClick={() => setIsExpanded(!isExpanded)}
                   className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90 text-white/40"
                 >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </button>
               </div>
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
                           <div className="h-full bg-[#00e676] shadow-[0_0_10px_#00e676]" style={{ width: `${(pick.confianza || 0) * 10}%` }} />
                        </div>
                        <span className="text-[10px] text-white/40 uppercase font-bold">Confianza: {pick.confianza || 0}/10</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                        <Zap size={12} className="text-[#00e676]" />
                        <span className="text-[10px] text-white/40 uppercase font-bold">Stake: <span className="text-white">{pick.stake || 0}/10</span></span>
                     </div>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed font-medium italic">
                    {pick.razonamiento || "No hay análisis detallado disponible."}
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
