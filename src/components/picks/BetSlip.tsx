"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, Trash2, TrendingUp, Calculator, ChevronUp, ChevronDown } from "lucide-react";

interface Pick {
  id: string;
  match: string;
  pick: string;
  odds: number;
  sport: string;
}

interface BetSlipProps {
  picks: Pick[];
  onRemove: (id: string) => void;
  onClear: () => void;
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
      "w-[calc(100vw-2rem)] md:w-[350px] animate-in slide-in-from-bottom-10"
    )}>
      <div className={cn(
        "bg-[#0a0a0a]/95 backdrop-blur-xl border border-neon-green/30 rounded-3xl shadow-[0_0_50px_rgba(0,255,135,0.15)] overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[600px]" : "max-h-[70px]"
      )}>
        {/* Header - Always visible */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-[70px] flex items-center justify-between px-6 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-green/20 animate-pulse rounded-lg blur-md" />
              <div className="relative bg-neon-green text-deep-black h-8 w-8 rounded-lg flex items-center justify-center font-black">
                {picks.length}
              </div>
            </div>
            <div>
              <h3 className="text-white font-black text-xs uppercase tracking-widest">Combinada</h3>
              <p className="text-neon-green text-[10px] font-bold">Total @{totalOdds.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="p-2 text-white/20 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <div className="p-1 px-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-neon-green/30 transition-all">
              {isExpanded ? <ChevronDown className="text-white/40" /> : <ChevronUp className="text-white/40" />}
            </div>
          </div>
        </div>

        {/* Content - Hidden when collapsed */}
        <div className="px-6 pb-6 space-y-6 overflow-y-auto max-h-[400px] no-scrollbar">
          {/* Picks List */}
          <div className="space-y-3">
            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest block border-b border-white/5 pb-2">Selecciones</span>
            {picks.map((pick) => (
              <div key={pick.id} className="group/item flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-white/40 font-bold uppercase truncate max-w-[180px]">{pick.match}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white italic">{pick.pick}</span>
                    <span className="text-xs font-black text-neon-green">@{pick.odds.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onRemove(pick.id)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-white/10 hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Calculator Section */}
          <div className="bg-neon-green/5 border border-neon-green/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator size={14} className="text-neon-green" />
                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Inversión</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 rounded-lg border border-white/5 px-2 py-1">
                <input 
                  type="number" 
                  value={stake}
                  onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
                  className="bg-transparent text-white text-xs font-black w-12 focus:outline-none text-right"
                />
                <span className="text-[10px] text-white/20 font-bold">u</span>
              </div>
            </div>

            <div className="h-[1px] bg-white/5" />

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Beneficio Potencial</span>
                <span className="text-lg font-black text-neon-green italic">+{potentialProfit.toFixed(2)}u</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-neon-green/20 flex items-center justify-center text-neon-green">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
