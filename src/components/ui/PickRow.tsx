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
          <div className="flex flex-col w-full relative">
            {/* Top Action Bar: Market, Odds, Confidence, Status */}
            <div className="flex flex-col md:flex-row items-center justify-between pb-6 md:pb-8 border-b border-white/5 gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
                {/* League Logo (Small) */}
                <div className="h-8 w-8 flex items-center justify-center bg-white rounded-lg border border-white/20 overflow-hidden shrink-0">
                  <img 
                    src={getLocalLogoPath(pick.league_logo, 'leagues') || pick.league_logo || GENERIC_LEAGUE} 
                    alt="" 
                    className="h-5 w-5 object-contain"
                  />
                </div>
                
                {/* Market Block */}
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 bg-white/5 border border-white/5 rounded-xl px-4 py-2">
                  <span className="text-[10px] text-neon-green font-black tracking-widest uppercase opacity-60">MERCADO</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/50 uppercase font-bold italic tracking-wide">{translateBettingTerm(pick.market || "Resultado")}</span>
                    <span className="text-sm font-black uppercase text-neon-green italic leading-none">{translateBettingTerm(pick.pick)}</span>
                  </div>
                </div>

                {/* Odds Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
                  className={cn(
                    "flex flex-row items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300",
                    isSelected 
                      ? "bg-neon-green border-neon-green text-deep-black shadow-[0_0_20px_rgba(0,255,135,0.4)]" 
                      : "bg-white/5 border-white/10 text-neon-green hover:bg-white/10"
                  )}
                >
                  <span className="text-[10px] font-black uppercase opacity-60">Cuota</span>
                  <span className="text-base font-black italic">@{normalizeOdds(pick.odds).toFixed(2)}</span>
                </button>
              </div>

              {/* Right Side: Confidence & Status (Moved up) */}
              <div className="flex items-center gap-6">
                {/* Confidence Meter */}
                <div className="flex flex-col items-center md:items-end gap-1">
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={cn(
                        "w-1 h-3 rounded-full transition-all duration-500",
                        i < (pick.confianza || pick.stake || 5) 
                          ? (pick.confianza || pick.stake || 5) >= 8 ? "bg-neon-green shadow-[0_0_8px_rgba(0,255,135,0.5)]" : "bg-white/40"
                          : "bg-white/5"
                      )} />
                    ))}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/20">Confianza</span>
                </div>

                {/* Status Badge */}
                <div className={cn(
                  "flex items-center justify-center h-10 w-10 md:w-32 rounded-xl border transition-all duration-300",
                  pick.status === 'pending' ? "text-slate-900 bg-[#c9a84c] border-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.2)]" : statusStyles[pick.status as keyof typeof statusStyles]
                )}>
                  <div className="flex items-center gap-2 px-3">
                    {statusIcons[pick.status as keyof typeof statusIcons] || statusIcons.pending}
                    <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">{statusLabels[pick.status as keyof typeof statusLabels]}</span>
                  </div>
                </div>

                {/* Expand Button */}
                <button onClick={() => setIsExpanded(!isExpanded)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/40">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>

            {/* Bottom Body: Match & Teams */}
            <div className="flex flex-col md:flex-row items-center justify-between pt-6 md:pt-8 gap-8">
              <div className="flex items-center justify-center gap-6 w-full flex-1">
                {/* Home Team */}
                <div className="flex items-center justify-end gap-4 flex-1 min-w-0">
                  <span className="text-xl md:text-2xl font-black text-white truncate text-right uppercase italic tracking-tighter">{homeName}</span>
                  <div className="shrink-0 h-12 w-12 flex items-center justify-center bg-white rounded-xl border border-white/20 overflow-hidden p-1.5 shadow-xl relative">
                    <div className="absolute inset-0 bg-white/40 blur-lg rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img 
                      src={getLocalLogoPath(pick.home_logo, 'teams') || pick.home_logo || GENERIC_SHIELD} 
                      alt="" 
                      className={cn("h-9 w-9 object-contain relative z-10", !pick.home_logo && "opacity-30 grayscale")}
                    />
                  </div>
                </div>

                {/* VS Badge */}
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-xs font-black italic text-neon-green bg-neon-green/10 px-4 py-1 rounded-full border border-neon-green/20 shadow-[0_0_20px_rgba(0,255,135,0.1)]">VS</span>
                  <span className="text-[10px] font-bold text-white/20 mt-2 tracking-widest">{formattedTime}</span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-start gap-4 flex-1 min-w-0">
                  <div className="shrink-0 h-12 w-12 flex items-center justify-center bg-white rounded-xl border border-white/20 overflow-hidden p-1.5 shadow-xl relative">
                    <div className="absolute inset-0 bg-white/40 blur-lg rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img 
                      src={getLocalLogoPath(pick.away_logo, 'teams') || pick.away_logo || GENERIC_SHIELD} 
                      alt="" 
                      className={cn("h-9 w-9 object-contain relative z-10", !pick.away_logo && "opacity-30 grayscale")}
                    />
                  </div>
                  <span className="text-xl md:text-2xl font-black text-white truncate text-left uppercase italic tracking-tighter">{awayName}</span>
                </div>
              </div>
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
