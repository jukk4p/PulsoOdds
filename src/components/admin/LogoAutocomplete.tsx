"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import teamsData from "@/lib/teams-data.json";

interface Team {
  name: string;
  league: string;
  logo: string;
  localLogo: string;
}

interface LogoAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}

export function LogoAutocomplete({ value, onChange, placeholder, label }: LogoAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTeams = teamsData.filter((team: Team) => 
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.league.toLowerCase().includes(search.toLowerCase())
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
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
        {label}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={isOpen ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (e.target.value === "") onChange("");
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || "Buscar equipo..."}
          className="w-full bg-deep-black/60 border border-white/10 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-[11px] md:text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-neon-green/40 transition-all pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && !isOpen && (
            <div className="h-4 w-4 md:h-5 md:w-5 rounded bg-white/10 flex items-center justify-center p-0.5 border border-white/10">
              <img src={value} alt="" className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <Search className="h-3.5 w-3.5 md:h-4 md:w-4 text-white/20" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+5px)] left-0 w-full bg-[#12141c] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[200px] md:max-h-[250px] overflow-y-auto custom-scrollbar">
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
                  className="w-full flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.02] last:border-0 group"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="h-6 w-6 md:h-7 md:w-7 rounded bg-white/90 flex items-center justify-center p-1 shadow-sm group-hover:scale-110 transition-transform">
                      <img src={team.logo} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] md:text-[11px] font-black text-white group-hover:text-neon-green transition-colors leading-tight">{team.name}</span>
                      <span className="text-[7px] md:text-[8px] font-bold text-white/30 uppercase tracking-widest leading-none">{team.league}</span>
                    </div>
                  </div>
                  {value === team.logo && <Check className="h-3 w-3 text-neon-green" />}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">No se encontraron equipos</span>
              </div>
            )}
            
            <div className="bg-white/[0.01] px-4 py-2 border-t border-white/5">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[9px] font-black text-neon-green/40 hover:text-neon-green uppercase tracking-widest w-full text-center py-1"
              >
                Cerrar buscador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
