"use client";

import { cn } from "@/lib/utils";

interface Category {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  counts?: {
    pending: number;
    won: number;
    lost: number;
  };
  showStats?: boolean;
}

export function CategoryFilter({ categories, selectedId, onSelect, counts, showStats = true }: CategoryFilterProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Pills Container */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map((cat) => {
          const isActive = selectedId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                isActive 
                  ? "bg-accent text-black border-accent shadow-[0_0_20px_rgba(200,255,0,0.15)]" 
                  : "bg-white/[0.03] border-white/[0.05] text-zinc-400 hover:border-white/10 hover:text-white hover:bg-white/[0.06]"
              )}
            >
              <span className="flex items-center gap-2">
                {cat.icon && <span className="text-xs">{cat.icon}</span>}
                {cat.label}
              </span>
              
              {cat.count !== undefined && (
                <span className={cn(
                  "ml-1 text-[10px] opacity-40 font-bold tabular-nums",
                  isActive && "text-black opacity-60"
                )}>
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats Summary */}
      {showStats && counts && (
        <div className="flex items-center gap-3 text-[12px] font-bold text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pending" />
            <span>{counts.pending} pendientes</span>
          </div>
          <span className="opacity-20">/</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-win" />
            <span>{counts.won} ganados</span>
          </div>
          <span className="opacity-20">/</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-loss" />
            <span>{counts.lost} perdidos</span>
          </div>
        </div>
      )}
    </div>
  );
}
