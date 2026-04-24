"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MASTER_TEAMS, MASTER_LEAGUES } from "@/lib/masterDictionaries";

interface Team {
  name: string;
  logo: string;
}

interface LogoAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  type?: "teams" | "leagues";
}

export function LogoAutocomplete({ value, onChange, placeholder, label, type = "teams" }: LogoAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const source = type === "teams" ? MASTER_TEAMS : MASTER_LEAGUES;
  const teamsList = Object.entries(source).map(([name, logo]) => ({ name, logo }));

  const filteredTeams = teamsList.filter((team: Team) => 
    team.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10); // Limit to 10 results for performance

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full relative" ref={containerRef}>
      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">
        {label}
      </label>
      
      <div className="relative group">
        <input
          type="text"
          value={isOpen ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (e.target.value === "") onChange("");
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || "BUSCAR EQUIPO..."}
          className="w-full bg-bg-base border border-border-base rounded-sm px-4 py-3 text-[11px] text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent/40 transition-all pr-12 font-mono font-bold"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {value && !isOpen && (
            <div className="h-6 w-6 rounded-sm bg-white flex items-center justify-center p-1 border border-border-base shadow-sm">
              <img src={value} alt="" className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <Search className="h-4 w-4 text-text-muted group-focus-within:text-accent transition-colors" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-bg-surface/95 backdrop-blur-xl border border-border-base rounded-lg shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team: Team, idx: number) => (
                <button
                  key={`${team.name}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(team.logo);
                    setSearch("");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/[0.03] transition-colors border-b border-border-base/30 last:border-0 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-sm bg-white flex items-center justify-center p-1.5 shadow-sm group-hover:scale-110 transition-transform">
                      <img src={team.logo} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[11px] font-black text-text-primary group-hover:text-accent transition-colors uppercase tracking-tight">{team.name}</span>
                    </div>
                  </div>
                  {value === team.logo && <Check className="h-4 w-4 text-accent" />}
                </button>
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Sin resultados técnicos</span>
              </div>
            )}
            
            <div className="bg-bg-base/50 px-6 py-3 border-t border-border-base">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[9px] font-black text-text-muted hover:text-accent uppercase tracking-[0.4em] w-full text-center py-2 transition-colors"
              >
                Cerrar Buscador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
