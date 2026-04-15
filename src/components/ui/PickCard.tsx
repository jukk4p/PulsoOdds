import { cn } from "@/lib/utils";
import { Circle, TrendingUp, Trophy } from "lucide-react";

interface PickCardProps {
  pick: {
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
  };
}

export function PickCard({ pick }: PickCardProps) {
  const statusColors = {
    pending: "text-yellow-400",
    won: "text-neon-green",
    lost: "text-red-500",
    void: "text-gray-400",
  };

  return (
    <div className="glass-card neon-border rounded-xl p-6 transition-all hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-medium text-neon-green uppercase tracking-wider bg-neon-green/10 px-2 py-1 rounded inline-block mb-2">
            {pick.sport} • {pick.competition}
          </span>
          <h3 className="text-lg font-bold text-white">{pick.match}</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-black text-white italic">@{pick.odds.toFixed(2)}</span>
          <span className="text-xs text-white/40">Cuota</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/40 mb-1">Mercado</p>
          <p className="font-semibold text-white">{pick.market}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/40 mb-1">Selección</p>
          <p className="font-semibold text-neon-green">{pick.pick}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-neon-green" 
              style={{ width: `${(pick.stake / 10) * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/60">Stake {pick.stake}/10</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Circle className={cn("h-2 w-2 fill-current", statusColors[pick.status as keyof typeof statusColors])} />
          <span className={cn("text-xs font-medium uppercase", statusColors[pick.status as keyof typeof statusColors])}>
            {pick.status === 'pending' ? 'Pendiente' : pick.status}
          </span>
        </div>
      </div>
      
      {pick.analysis && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-sm text-white/60 line-clamp-2 italic">
            "{pick.analysis}"
          </p>
        </div>
      )}
    </div>
  );
}
