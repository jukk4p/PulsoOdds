"use client";

import { useState, useMemo } from "react";
import { PickRow } from "@/components/ui/PickRow";
import { cn } from "@/lib/utils";

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
  analysis?: string;
  alertas?: string;
  factores?: string;
  ev?: number;
  kickoff?: string;
  confianza?: number;
}

interface PicksExplorerProps {
  initialPicks: Pick[];
}

export function PicksExplorer({ initialPicks }: PicksExplorerProps) {
  const [filter, setFilter] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const filterOptions = [
    { id: "pending", label: "Pendientes" },
    { id: "won", label: "Ganados" },
    { id: "lost", label: "Perdidos" },
    { id: "void", label: "Nulos" },
    { id: "all", label: "Historial Total" }
  ];

  const filteredPicks = useMemo(() => {
    let result = initialPicks;
    
    // Status filter
    if (filter !== "all") {
      result = result.filter((p) => p.status === filter);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.home_team?.toLowerCase().includes(q) || "") ||
        (p.away_team?.toLowerCase().includes(q) || "") ||
        (p.competition?.toLowerCase().includes(q) || "") ||
        (p.pick?.toLowerCase().includes(q) || "")
      );
    }
    
    return result;
  }, [initialPicks, filter, searchQuery]);

  const counts = useMemo(() => {
    return {
      pending: initialPicks.filter(p => p.status === 'pending').length,
      won: initialPicks.filter(p => p.status === 'won').length,
      lost: initialPicks.filter(p => p.status === 'lost').length,
      void: initialPicks.filter(p => p.status === 'void').length,
      all: initialPicks.length
    };
  }, [initialPicks]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-white/20 group-focus-within:text-neon-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por equipo, liga o apuesta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/30 transition-all placeholder:text-white/20"
          />
        </div>
      </div>

      {/* Filter Tabs with Scroll Fade */}
      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-deep-black to-transparent z-10 pointer-events-none md:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-deep-black to-transparent z-10 pointer-events-none md:hidden" />
        
        <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth gap-1">
          {filterOptions.map((option) => {
            const isActive = filter === option.id;
            const count = counts[option.id as keyof typeof counts];
            
            return (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={cn(
                  "px-4 md:px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap flex items-center gap-2",
                  isActive 
                    ? "text-neon-green" 
                    : "text-white/40 hover:text-white/70"
                )}
              >
                <span className="relative z-10">{option.label}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded flex items-center justify-center font-bold",
                  isActive ? "bg-neon-green/10 text-neon-green" : "bg-white/5 text-white/20"
                )}>
                  {count}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-green shadow-[0_-2px_10px_rgba(0,255,135,0.5)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Picks List */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {filteredPicks.length > 0 ? (
          <div className="glass-card neon-border rounded-2xl overflow-hidden divide-y divide-white/5">
            {filteredPicks.map((pick) => (
              <PickRow key={pick.id} pick={pick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-card rounded-2xl border border-white/5 bg-white/[0.01]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-6">
              <svg className="w-8 h-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white/60 mb-2">No se encontraron resultados</h3>
            <p className="text-white/30 text-sm max-w-xs mx-auto italic">
              Prueba con otros términos o cambia la categoría seleccionada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
