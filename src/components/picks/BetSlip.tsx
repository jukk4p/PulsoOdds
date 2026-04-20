"use client";
 
 import { useState } from "react";
 import { cn, translateBettingTerm } from "@/lib/utils";
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
       "group/item bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all overflow-hidden",
       isExpanded && "bg-white/[0.04] border-white/10 shadow-inner"
     )}>
       {/* Collapsed Header */}
       <div 
         onClick={() => setIsExpanded(!isExpanded)}
         className="flex items-center justify-between p-3 cursor-pointer"
       >
         <div className="flex flex-col gap-0.5 flex-1 min-w-0">
           <span className="text-[10px] text-white/40 font-bold uppercase truncate pr-4">{pick.match}</span>
           <div className="flex items-center gap-2">
             <span className="text-xs font-black text-white italic truncate max-w-[150px]">{translateBettingTerm(pick.pick)}</span>
             <span className="text-xs font-black text-neon-green">@{pick.odds.toFixed(2)}</span>
           </div>
         </div>
         <div className="flex items-center gap-2">
            <div className="h-6 w-6 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 group-hover/item:border-neon-green/20 transition-all">
                {isExpanded ? <ChevronUp size={12} className="text-white/40" /> : <ChevronDown size={12} className="text-white/40" />}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(pick.id); }}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white/10 hover:bg-red-500/10 hover:text-red-500 transition-all"
            >
              <X size={14} />
            </button>
         </div>
       </div>

       {/* Expanded Body */}
       <div className={cn(
         "px-4 overflow-hidden transition-all duration-300",
         isExpanded ? "max-h-[100px] pb-4 opacity-100" : "max-h-0 opacity-0"
       )}>
          <div className="pt-2 border-t border-white/5 space-y-2">
             <div className="flex items-center justify-between">
                <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">Mercado</span>
                <span className="text-[9px] text-neon-green/60 font-black uppercase italic tracking-wider">{translateBettingTerm(pick.market || "")}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">Selección</span>
                <span className="text-[10px] text-white/90 font-black uppercase italic">{translateBettingTerm(pick.pick)}</span>
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
       "w-[calc(100vw-2rem)] md:w-[350px] animate-in slide-in-from-bottom-10"
     )}>
       <div className={cn(
         "bg-[#0a111a]/95 backdrop-blur-2xl border border-neon-green/20 rounded-[32px] shadow-[0_0_50px_rgba(0,230,118,0.1)] overflow-hidden transition-all duration-300",
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
               <div className="relative bg-neon-green text-[#0a111a] h-8 w-8 rounded-lg flex items-center justify-center font-black">
                 {picks.length}
               </div>
             </div>
             <div>
               <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em]">Combinada</h3>
               <p className="text-neon-green text-[10px] font-black italic">Total @{totalOdds.toFixed(2)}</p>
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
             <div className="p-1 px-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-neon-green/30 transition-all">
               {isExpanded ? <ChevronDown size={14} className="text-white/40" /> : <ChevronUp size={14} className="text-white/40" />}
             </div>
           </div>
         </div>
 
         {/* Content - Hidden when collapsed */}
         <div className="px-6 pb-6 space-y-6 overflow-y-auto max-h-[400px] no-scrollbar">
           {/* Picks List */}
           <div className="space-y-2">
             <span className="text-[9px] text-white/10 font-black uppercase tracking-[0.4em] block border-b border-white/5 pb-2">Selecciones</span>
             {picks.map((pick) => (
                <BetSlipItem key={pick.id} pick={pick} onRemove={onRemove} />
             ))}
           </div>
 
           {/* Calculator Section */}
           <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Calculator size={14} className="text-white/20" />
                 <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Inversión</span>
               </div>
               <div className="flex items-center gap-2 bg-black/40 rounded-lg border border-white/5 px-2 py-1">
                 <input 
                   type="number" 
                   value={stake}
                   onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
                   className="bg-transparent text-white text-xs font-black w-12 focus:outline-none text-right"
                 />
                 <span className="text-[10px] text-white/20 font-bold ml-1">unidades</span>
               </div>
             </div>
 
             <div className="h-[1px] bg-white/5" />
 
             <div className="flex items-center justify-between">
               <div className="flex flex-col">
                 <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Beneficio</span>
                 <span className="text-lg font-black text-neon-green italic leading-none mt-1">+{Number(potentialProfit.toFixed(2))}</span>
               </div>
               <div className="h-10 w-10 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center text-neon-green">
                 <TrendingUp size={20} />
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 }}
