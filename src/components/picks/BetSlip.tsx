"use client";
 
import { useState } from "react";
import { cn, normalizeBettingPick, formatMatchName } from "@/lib/utils";
import { X, Trash2, TrendingUp, Calculator, ChevronUp, ChevronDown } from "lucide-react";
 
interface Pick {
  id: string;
  match: string;
  market?: string;
  pick: string;
  odds: number;
  sport: string;
}
 
interface BetSlipProps {
  picks: Pick[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function BetSlipItem({ pick, onRemove }: { pick: Pick; onRemove: (id: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      "group/item bg-bg-base/50 rounded-sm border border-border-base/50 hover:border-accent/20 transition-all overflow-hidden",
      isExpanded && "bg-bg-base border-border-base"
    )}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 cursor-pointer"
      >
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-[9px] text-text-muted font-black tracking-widest truncate pr-4 uppercase">{formatMatchName(pick.match)}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-text-primary uppercase italic truncate max-w-[150px]">{normalizeBettingPick(pick.pick, pick.match)}</span>
            <span className="text-xs font-mono font-black text-accent">@{pick.odds.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="h-6 w-6 flex items-center justify-center rounded-sm bg-bg-surface border border-border-base group-hover/item:border-accent/30 transition-all">
               {isExpanded ? <ChevronUp size={10} className="text-text-muted" /> : <ChevronDown size={10} className="text-text-muted" />}
           </div>
           <button 
             onClick={(e) => { e.stopPropagation(); onRemove(pick.id); }}
             className="h-8 w-8 rounded-sm flex items-center justify-center text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-all"
           >
             <X size={14} />
           </button>
        </div>
      </div>

      <div className={cn(
        "px-4 overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[100px] pb-4 opacity-100" : "max-h-0 opacity-0"
      )}>
         <div className="pt-3 border-t border-border-base/30 space-y-2">
            <div className="flex items-center justify-between">
               <span className="text-[8px] text-text-muted font-black uppercase tracking-widest">Mercado</span>
               <span className="text-[9px] text-accent font-black italic tracking-widest uppercase">{normalizeBettingPick(pick.market || "", pick.match)}</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-[8px] text-text-muted font-black uppercase tracking-widest">Selección</span>
               <span className="text-[10px] text-text-primary font-black uppercase italic tracking-tight">{normalizeBettingPick(pick.pick, pick.match)}</span>
            </div>
         </div>
      </div>
    </div>
  );
}

export function BetSlip({ picks, onRemove, onClear }: BetSlipProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stake, setStake] = useState(1);

  if (picks.length === 0) return null;

  const totalOdds = picks.reduce((acc, pick) => acc * pick.odds, 1);
  const potentialProfit = (totalOdds * stake) - stake;

  return (
    <div className={cn(
      "fixed bottom-8 right-4 md:right-8 z-50 transition-all duration-500 transform translate-y-0",
      "w-[calc(100vw-2rem)] md:w-[380px] animate-in slide-in-from-bottom-10"
    )}>
      <div className={cn(
        "bg-bg-surface/95 backdrop-blur-2xl border border-border-base rounded-lg shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[600px] border-accent/20" : "max-h-[76px]"
      )}>
        {/* Header */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-[76px] flex items-center justify-between px-6 cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 animate-pulse rounded-sm blur-md" />
              <div className="relative bg-accent text-bg-base h-10 w-10 rounded-sm flex items-center justify-center font-black text-lg">
                {picks.length}
              </div>
            </div>
            <div>
              <h3 className="text-text-primary font-black text-[10px] tracking-[0.3em] uppercase">Combinada</h3>
              <p className="text-accent text-[11px] font-mono font-black italic">@{totalOdds.toFixed(2)} TOTAL</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="p-2.5 text-text-muted hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <div className="h-8 w-8 flex items-center justify-center rounded-sm bg-bg-base border border-border-base group-hover:border-accent/30 transition-all">
              {isExpanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronUp size={14} className="text-text-muted" />}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6 overflow-y-auto max-h-[400px] no-scrollbar">
          <div className="space-y-3">
            <span className="text-[9px] text-text-muted font-black tracking-[0.5em] block uppercase border-b border-border-base/30 pb-3">Selecciones</span>
            {picks.map((pick) => (
               <BetSlipItem key={pick.id} pick={pick} onRemove={onRemove} />
            ))}
          </div>

          {/* Calculator */}
          <div className="bg-bg-base/50 border border-border-base p-6 rounded-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent/10" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator size={14} className="text-accent" />
                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">Inversión</span>
              </div>
              <div className="flex items-center gap-3 bg-bg-surface rounded-sm border border-border-base px-3 py-2">
                <input 
                  type="number" 
                  value={stake}
                  onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
                  className="bg-transparent text-text-primary text-xs font-mono font-black w-12 focus:outline-none text-right"
                />
                <span className="text-[9px] text-text-muted font-black uppercase tracking-widest">unidades</span>
              </div>
            </div>

            <div className="h-px bg-border-base/50" />

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">Beneficio Estimado</span>
                <span className="text-2xl font-mono font-black text-accent italic leading-none mt-2">
                  +{potentialProfit.toFixed(2)}
                </span>
              </div>
              <div className="h-12 w-12 rounded-sm bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-[0_0_20px_rgba(200,255,0,0.1)]">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
