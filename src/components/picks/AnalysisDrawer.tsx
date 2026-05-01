"use client";

import { useEffect, useState } from "react";
import { cn, normalizeOdds, normalizeBettingPick, formatMatchName } from "@/lib/utils";
import { normalizeTeamName, normalizeLeagueName } from "@/lib/team-normalization";
import { 
  X, Zap, TrendingUp, History, Info, 
  BarChart3, ShieldAlert, Target, AlertCircle, 
  CheckCircle2, ShieldCheck, ChevronLeft, Calendar
} from "lucide-react";
import { getTeamLogo, getLeagueLogo } from "@/lib/logos";

interface Pick {
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
  razonamiento?: string;
  confianza?: number;
  home_stats?: any;
  away_stats?: any;
  alertas?: string;
  factores?: string;
  ev?: number;
  home_slug?: string;
  away_slug?: string;
  is_top?: boolean;
  prob_estimada?: number;
  prob_implicita?: number;
}

interface AnalysisDrawerProps {
  picks: Pick[] | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnalysisDrawer({ picks, isOpen, onClose }: AnalysisDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedPickId, setSelectedPickId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (picks && picks.length > 0) {
        setSelectedPickId(picks[0].id);
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, picks]);

  if (!mounted || !picks || picks.length === 0) return null;

  const activePick = picks.find(p => p.id === selectedPickId) || picks[0];
  const [homeRaw, awayRaw] = (activePick.match || "").split(/\s+vs\s+/i);
  const homeLogo = getTeamLogo(homeRaw) || activePick.home_slug;
  const awayLogo = getTeamLogo(awayRaw) || activePick.away_slug;
  
  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-md z-[100] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer Panel (Bottom Sheet style) */}
      <div 
        className={cn(
          "fixed inset-x-0 bottom-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] bg-[#0a0a0a] border-t border-white/5 z-[101] rounded-t-[32px] shadow-2xl transition-all duration-500 ease-out flex flex-col max-h-[92vh] md:max-h-[85vh]",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle for mobile */}
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto my-4 shrink-0 md:hidden" />

        {/* Header Navigation */}
        <div className="px-6 py-2 flex items-center justify-between shrink-0">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            <ChevronLeft size={14} />
            Volver a pronósticos
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Match Info Header */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white border border-white/5 p-1 flex items-center justify-center overflow-hidden">
              {getLeagueLogo(activePick.competition) ? (
                <img src={getLeagueLogo(activePick.competition) || ""} alt="" className="w-full h-full object-contain" />
              ) : (
                <BarChart3 size={12} className="text-zinc-600" />
              )}
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {activePick.competition.split('-').pop()?.trim()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <Calendar size={10} className="text-zinc-600" />
              {activePick.match_date ? new Date(activePick.match_date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Hoy'}
            </span>
            <span className="opacity-30">•</span>
            <span>{activePick.match_date ? new Date(activePick.match_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '15:00'}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10 pb-12">
          
          {/* Teams Comparison */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-8 md:gap-16 w-full">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-20 h-20 rounded-2xl bg-white border border-white/5 p-4 shadow-2xl transition-transform hover:scale-105">
                  {homeLogo ? (
                    <img src={homeLogo} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-white/5 rounded-sm" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-black text-white uppercase tracking-tight">{normalizeTeamName(homeRaw)}</span>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Local</span>
                </div>
              </div>

              <span className="text-xs font-black text-zinc-800 italic mt-[-24px]">VS</span>

              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-20 h-20 rounded-2xl bg-white border border-white/5 p-4 shadow-2xl transition-transform hover:scale-105">
                  {awayLogo ? (
                    <img src={awayLogo} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-white/5 rounded-sm" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-black text-white uppercase tracking-tight">{normalizeTeamName(awayRaw)}</span>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Visitante</span>
                </div>
              </div>
            </div>
          </div>

          {/* Picks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Picks disponibles · {picks.length}</span>
            </div>
            
            <div className="space-y-3">
              {picks.map((p, idx) => {
                const isSelected = selectedPickId === p.id;
                const isTopPick = idx === 0;
                const pDots = p.confianza 
                  ? Math.max(1, Math.min(5, Math.floor(p.confianza / 20))) 
                  : (p.stake > 5 ? Math.round(p.stake / 2) : (p.stake || 1));

                return (
                  <button 
                    key={p.id}
                    onClick={() => setSelectedPickId(p.id)}
                    className={cn(
                      "w-full group relative bg-[#121212] border rounded-2xl p-5 flex items-center justify-between transition-all duration-500 text-left",
                      isSelected 
                        ? "border-accent bg-accent/[0.03] shadow-[0_0_40px_rgba(200,255,0,0.05)] scale-[1.02]" 
                        : "border-white/[0.05] hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-11 h-11 rounded-xl border flex items-center justify-center shadow-xl transition-transform group-hover:scale-110",
                        isSelected ? "bg-accent text-black border-accent shadow-accent/20" : "bg-white/5 border-white/10 text-zinc-400"
                      )}>
                        {isTopPick ? <Zap size={22} className={cn(isSelected ? "fill-black" : "fill-accent/20 text-accent/50")} /> : <BarChart3 size={20} />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            isSelected ? "text-accent" : "text-zinc-500"
                          )}>
                            {isTopPick ? "Top Pick" : "Oportunidad"}
                          </span>
                          <span className="text-[8px] font-bold text-zinc-700 opacity-50 uppercase tracking-widest">•</span>
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{p.market}</span>
                        </div>
                        <span className="text-sm font-black text-white uppercase tracking-tight italic">
                          {normalizeBettingPick(p.pick, p.match)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn(
                        "text-2xl font-black tabular-nums tracking-tighter",
                        isSelected ? "text-accent" : "text-white"
                      )}>
                        {normalizeOdds(p.odds).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={cn("w-1.5 h-1.5 rounded-sm", i <= pDots ? (isSelected ? "bg-accent" : "bg-white/40") : "bg-zinc-800")} />
                          ))}
                        </div>
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                          {pDots >= 4 ? "Alta" : pDots >= 3 ? "Media" : "Baja"}
                        </span>
                      </div>
                    </div>
                    
                    {isTopPick && (
                      <div className={cn(
                        "absolute -top-2 -right-1 px-3 py-1 rounded-full flex items-center gap-1 shadow-2xl transition-all duration-300",
                        isSelected ? "bg-accent shadow-accent/30 animate-bounce-subtle" : "bg-zinc-800 border border-white/10"
                      )}>
                        <Zap size={10} className={cn(isSelected ? "text-black fill-black" : "text-zinc-500")} />
                        <span className={cn("text-[9px] font-black uppercase tracking-tighter", isSelected ? "text-black" : "text-zinc-500")}>Valor</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analysis Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Análisis del pick</span>
              <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{activePick.market}</span>
              </div>
            </div>
            <div className="bg-[#121212] border border-white/[0.03] rounded-2xl p-6 shadow-2xl space-y-6">
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                {activePick.razonamiento ? activePick.razonamiento.split(' ').map((word, i) => (
                  <span key={i} className={cn(
                    (word.includes('4') || word.includes('goles') || word.includes('ambos') || word.includes('%')) ? "text-white font-bold" : ""
                  )}>
                    {word}{' '}
                  </span>
                )) : (
                  <span className="italic text-zinc-600">No hay análisis detallado disponible para este mercado específico todavía.</span>
                )}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-1 min-h-[80px] transition-colors hover:border-white/10 group/stat">
                  <span className="text-lg font-black text-white italic group-hover/stat:scale-110 transition-transform">
                    {activePick.prob_estimada ? `${(activePick.prob_estimada * 100).toFixed(0)}%` : (activePick.confianza ? `${activePick.confianza}%` : 'N/A')}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-600 uppercase text-center leading-tight">Probabilidad</span>
                </div>
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-1 min-h-[80px] transition-colors hover:border-white/10 group/stat">
                  <span className="text-lg font-black text-accent italic group-hover/stat:scale-110 transition-transform">
                    {activePick.ev ? `+${(activePick.ev * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-600 uppercase text-center leading-tight">Valor (EV)</span>
                </div>
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-1 min-h-[80px] transition-colors hover:border-white/10 group/stat">
                  <span className="text-lg font-black text-white italic group-hover/stat:scale-110 transition-transform">
                    {activePick.stake ? (activePick.stake > 5 ? Math.round(activePick.stake / 2) : activePick.stake) : '0'}/5
                  </span>
                  <span className="text-[8px] font-bold text-zinc-600 uppercase text-center leading-tight">Stake Sugerido</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
