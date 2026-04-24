import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({ label, value, subtext, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "group relative flex flex-col p-5 rounded-lg bg-bg-surface border border-border-base transition-all duration-300 hover:border-border-accent hover:-translate-y-0.5",
      className
    )}>
      <span className="text-[11px] font-black uppercase tracking-wider text-text-muted mb-4">
        {label}
      </span>
      
      <div className="flex items-end gap-2 mb-1">
        <span className="text-3xl md:text-4xl font-mono font-bold text-text-primary tracking-tighter">
          {value}
        </span>
        {trend && (
          <div className={cn(
            "mb-1.5 p-0.5 rounded",
            trend === "up" && "text-win",
            trend === "down" && "text-loss",
            trend === "neutral" && "text-void"
          )}>
            {trend === "up" && <ArrowUpRight size={16} />}
            {trend === "down" && <ArrowDownRight size={16} />}
            {trend === "neutral" && <Minus size={16} />}
          </div>
        )}
      </div>

      {subtext && (
        <span className={cn(
          "text-[11px] font-bold uppercase tracking-tight",
          trend === "up" && "text-win",
          trend === "down" && "text-loss",
          trend === "neutral" && "text-text-muted"
        )}>
          {subtext}
        </span>
      )}
      
      {/* Subtle Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-lg bg-accent-glow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
