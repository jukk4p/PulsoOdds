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
        {/* Header Grid: Sincronizada con el esqueleto del cuerpo */}
        <div className="hidden md:flex items-center px-6 md:px-8 pt-3 pb-0 gap-4 md:gap-6 relative z-10 overflow-hidden">
          {/* C1: League Space (50px) */}
          <div className="w-[50px] shrink-0 h-8 border-r border-transparent pr-4" />
          
          {/* C2: Time Center (flex-4.8) */}
          <div className="flex-[4.8] relative h-8 flex items-center justify-center px-4 border-r border-transparent">
             <div className="flex w-full items-center justify-center opacity-50">
                <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-white tracking-[0.2em] truncate">{formattedDay}</span>
                  <div className="h-[1px] w-4 bg-white/10 shrink-0" />
                </div>
                <div className="shrink-0 px-2 font-black text-neon-green text-[10px] tracking-wider">
                  {formattedTime}
                </div>
                <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
                  <div className="h-[1px] w-4 bg-white/10 shrink-0" />
                  <span className="text-[10px] text-white font-bold uppercase tracking-[0.1em] truncate">{pick.competition}</span>
                </div>
             </div>
          </div>

          {/* C3: Mercado Header Label (flex-2.7) - MAX-WIDTH ALINEADA CON EL CUERPO */}
          <div className="flex-[2.7] h-8 flex items-center justify-center px-4 border-r border-transparent">
             <span className="text-[10px] text-white font-bold uppercase tracking-[0.2em] w-full max-w-[140px] text-center opacity-50">Mercado</span>
          </div>

          {/* C4: Odds Area Space (80px) */}
          <div className="w-[80px] shrink-0 h-8 border-r border-transparent" />

          {/* C5: Actions Area (60px++) */}
          <div className="w-[60px] md:flex-1 flex items-center justify-end gap-5 h-8">
             <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={cn("w-0.5 h-2.5 rounded-full transition-all", i < (pick.confianza || pick.stake || 5) ? (pick.confianza || pick.stake || 5) >= 8 ? "bg-neon-green shadow-sm" : "bg-white/40" : "bg-white/5")} />
                  ))}
                </div>
                <span className="text-[7px] font-black uppercase text-white/20 whitespace-nowrap">Confianza</span>
             </div>
             <div className={cn("flex items-center justify-center h-6 md:w-24 rounded-lg border", pick.status === 'pending' ? "text-slate-900 bg-[#c9a84c] border-[#c9a84c]" : statusStyles[pick.status as keyof typeof statusStyles])}>
                <span className="text-[8px] font-black uppercase tracking-tight px-2">{statusLabels[pick.status as keyof typeof statusLabels]}</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center pt-1 md:pt-2 pb-4 md:pb-6 px-6 md:px-8 gap-4 md:gap-6 relative">
          {/* Column 1: League logo */}
          <div className="hidden md:flex flex-col items-center justify-center w-[50px] shrink-0 border-r border-white/5 pr-4 h-full">
              <div className="h-9 w-9 flex items-center justify-center bg-white rounded-lg border border-white/20 overflow-hidden shadow-sm">
                <img src={getLocalLogoPath(pick.league_logo, 'leagues') || pick.league_logo || GENERIC_LEAGUE} alt="" className="h-6 w-6 object-contain" />
              </div>
          </div>

          {/* Column 2: Teams Area */}
          <div className="hidden md:flex flex-[4.8] flex-col items-center justify-center px-4 border-r border-white/5 h-full min-w-0">
            <div className="flex items-center justify-center gap-4 w-full">
              <div className="flex flex-1 items-center justify-end gap-3 min-w-0">
                 <span className="text-sm font-bold text-white truncate text-right uppercase tracking-tight">{homeName}</span>
                  <div className="shrink-0 h-8 w-8 flex items-center justify-center bg-white rounded-lg border border-white/20 overflow-hidden p-1 shadow-sm">
                    <img src={getLocalLogoPath(pick.home_logo, 'teams') || pick.home_logo || GENERIC_SHIELD} alt="" className="h-6 w-6 object-contain" />
                  </div>
              </div>
              <div className="flex flex-col items-center shrink-0">
                 <span className="text-[9px] font-black italic text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-md border border-neon-green/20">VS</span>
              </div>
              <div className="flex flex-1 items-center justify-start gap-3 min-w-0">
                  <div className="shrink-0 h-8 w-8 flex items-center justify-center bg-white rounded-lg border border-white/20 overflow-hidden p-1 shadow-sm">
                    <img src={getLocalLogoPath(pick.away_logo, 'teams') || pick.away_logo || GENERIC_SHIELD} alt="" className="h-6 w-6 object-contain" />
                  </div>
                 <span className="text-sm font-bold text-white truncate text-left uppercase tracking-tight">{awayName}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Market Info (flex-2.7 con max-w-140) */}
          <div className="flex flex-[2.7] flex-col items-center justify-center px-4 border-r border-white/5 text-center h-full min-w-0">
            <div className="flex flex-col gap-0.5 items-center bg-slate-900/40 p-2 rounded-xl border border-white/5 w-full max-w-[140px] shadow-inner min-h-[70px] justify-center">
              <div className="flex flex-col gap-0.5 w-full">
                <span className="text-[9px] text-white/50 uppercase font-bold italic tracking-wide truncate">{translateBettingTerm(pick.market || "Hándicap")}</span>
                <span className="text-[12px] font-black uppercase text-[#00e676] leading-none italic truncate">{translateBettingTerm(pick.pick)}</span>
              </div>
            </div>
          </div>

          {/* Column 4: Odds */}
          <div className="flex items-center justify-center md:w-[80px] shrink-0 md:border-r border-white/5 py-4 md:py-0 h-full">
             <button 
                onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
                className={cn(
                  "flex flex-col items-center relative min-h-[70px] justify-center w-[70px] rounded-xl border transition-all duration-300 backdrop-blur-sm shadow-inner",
                  isSelected 
                    ? "bg-neon-green border-neon-green text-deep-black shadow-[0_0_20px_rgba(0,255,135,0.4)] scale-105" 
                    : "bg-neon-green/10 border-neon-green/20 text-neon-green hover:bg-neon-green/20"
                )}
              >
                <span className={cn("text-[8px] font-black uppercase", isSelected ? "text-deep-black/60" : "text-neon-green/60")}>Cuota</span>
                <span className="text-sm font-black italic">@{normalizeOdds(pick.odds).toFixed(2)}</span>
             </button>
          </div>

          {/* Column 5: Actions */}
          <div className="flex items-center justify-center w-full md:w-[60px] shrink-0 pt-4 md:pt-0 h-full self-center">
             <button onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 transition-all">
               {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
