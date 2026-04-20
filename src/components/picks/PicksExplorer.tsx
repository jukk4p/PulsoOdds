"use client";

import { useState, useMemo } from "react";
import { PickRow } from "@/components/ui/PickRow";
import { cn } from "@/lib/utils";
import { BetSlip } from "./BetSlip";

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
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPickIds, setSelectedPickIds] = useState<string[]>([]);

  const filterOptions = [
    { id: "pending", label: "Pendientes" },
    { id: "won", label: "Ganados" },
    { id: "lost", label: "Perdidos" },
    { id: "void", label: "Nulos" },
    { id: "all", label: "Historial Total" }
  ];

  const sportOptions = [
    { id: "all", label: "Todos", icon: "💎" },
    { id: "football", label: "Fútbol", icon: "⚽" },
    { id: "basketball", label: "Basket", icon: "🏀" },
    { id: "tennis", label: "Tenis", icon: "🎾" },
    { id: "top", label: "Top Picks", icon: "🔥" },
  ];

  const filteredPicks = useMemo(() => {
    let result = initialPicks;
    
    // Status filter
    if (filter !== "all") {
      result = result.filter((p) => p.status === filter);
    }

    // Sport / Top filter
    if (selectedSport === "top") {
      result = result.filter(p => (p.confianza || p.stake) >= 8);
    } else if (selectedSport !== "all") {
      result = result.filter(p => 
        (p.sport || "").toLowerCase().includes(selectedSport)
      );
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.match?.toLowerCase().includes(q) || false) ||
        (p.competition?.toLowerCase().includes(q) || false) ||
        (p.pick?.toLowerCase().includes(q) || false)
      );
    }
    
    return result;
  }, [initialPicks, filter, selectedSport, searchQuery]);

  const counts = useMemo(() => {
    return {
      pending: initialPicks.filter(p => p.status === 'pending').length,
      won: initialPicks.filter(p => p.status === 'won').length,
      lost: initialPicks.filter(p => p.status === 'lost').length,
      void: initialPicks.filter(p => p.status === 'void').length,
      all: initialPicks.length
    };
  }, [initialPicks]);

  const togglePick = (id: string) => {
    setSelectedPickIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedPicks = useMemo(() => 
    initialPicks.filter(p => selectedPickIds.includes(p.id)),
    [initialPicks, selectedPickIds]
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters Toolbar */}
      <div className="space-y-4">
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
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/30 transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Sport Categories Picker */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {sportOptions.map((sport) => {
            const isActive = selectedSport === sport.id;
            return (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-tighter transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-neon-green text-deep-black border-neon-green shadow-[0_0_20px_rgba(0,255,135,0.3)] scale-105" 
                    : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
                )}
              >
                <span>{sport.icon}</span>
                {sport.label}
              </button>
            );
          })}
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
              <PickRow 
                key={pick.id} 
                pick={pick} 
                isSelected={selectedPickIds.includes(pick.id)}
                onToggle={() => togglePick(pick.id)}
              />
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

      <BetSlip 
        picks={selectedPicks} 
        onRemove={togglePick} 
        onClear={() => setSelectedPickIds([])} 
      />
    </div>
  );
}
