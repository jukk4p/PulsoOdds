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
}

export function CategoryFilter({ categories, selectedId, onSelect, counts }: CategoryFilterProps) {
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
                "whitespace-nowrap px-4 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3",
                isActive 
                  ? "bg-accent text-bg-base border-accent shadow-[0_0_20px_rgba(200,255,0,0.2)] scale-[1.02]" 
                  : "bg-bg-surface border-border-base text-text-muted hover:border-accent/40 hover:text-text-primary hover:bg-accent/5"
              )}
            >
              <span className="flex items-center gap-2">
                {cat.icon && <span className="text-[13px]">{cat.icon}</span>}
                {cat.label}
              </span>
              
              {cat.count !== undefined && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black tabular-nums",
                  isActive ? "bg-bg-base/20 text-bg-base" : "bg-white/10 text-white/40"
                )}>
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats Summary */}
      {counts && (
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
