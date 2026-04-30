import { cn, normalizeTeamName, normalizeBettingPick } from "@/lib/utils";
import { getTeamLogo } from "@/lib/logos";
import { StatusBadge, PickStatus } from "@/components/ui/StatusBadge";
import { TeamAvatar } from "@/components/ui/TeamAvatar";

interface Pick {
  id: string;
  competition: string;
  match: string;
  market: string;
  pick: string;
  odds: number;
  status: string;
  match_date: string;
  kickoff?: string;
  home_logo?: string;
  away_logo?: string;
  competition_logo?: string;
}

interface PickCardProps {
  pick: Pick;
  className?: string;
}

export function PickCard({ pick, className }: PickCardProps) {
  const matchDate = new Date(pick.match_date);
  const formattedDate = matchDate.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
  const formattedTime = pick.kickoff || matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const [homeRaw, awayRaw] = (pick.match || "").split(/\s+vs\s+/i);
  
  // Normalización de logos vía diccionario Flashscore
  const homeLogo = getTeamLogo(homeRaw) || pick.home_logo;
  const awayLogo = getTeamLogo(awayRaw) || pick.away_logo;

  return (
    <div className={cn(
      "flex flex-col w-full rounded-lg bg-bg-surface border border-border-base overflow-hidden transition-all duration-300 hover:border-border-accent hover:-translate-y-0.5 group",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg-subtle/50 border-b border-border-base">
        <div className="flex items-center gap-2">
          {pick.competition_logo && (
            <img src={pick.competition_logo} alt="" className="w-4 h-4 object-contain opacity-70" />
          )}
          <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
            {pick.competition} · {formattedDate} · {formattedTime}
          </span>
        </div>
        <StatusBadge status={pick.status.toLowerCase() as PickStatus} />
      </div>

      {/* Teams Section */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          {homeLogo ? (
            <img src={homeLogo} alt={homeRaw} className="w-12 h-12 md:w-14 md:h-14 object-contain" />
          ) : (
            <TeamAvatar name={homeRaw} className="w-12 h-12 md:w-14 md:h-14" />
          )}
          <span className="text-xs md:text-sm font-black uppercase tracking-tight text-text-primary line-clamp-1">
            {normalizeTeamName(homeRaw)}
          </span>
          <span className="text-[9px] font-bold uppercase text-text-muted">Local</span>
        </div>

        <div className="text-[10px] font-black text-text-muted italic opacity-30 mt-[-20px]">VS</div>

        <div className="flex flex-col items-center gap-3 text-center">
          {awayLogo ? (
            <img src={awayLogo} alt={awayRaw} className="w-12 h-12 md:w-14 md:h-14 object-contain" />
          ) : (
            <TeamAvatar name={awayRaw} className="w-12 h-12 md:w-14 md:h-14" />
          )}
          <span className="text-xs md:text-sm font-black uppercase tracking-tight text-text-primary line-clamp-1">
            {normalizeTeamName(awayRaw)}
          </span>
          <span className="text-[9px] font-bold uppercase text-text-muted">Visitante</span>
        </div>
      </div>

      {/* Betting Info */}
      <div className="flex flex-col px-6 pb-6 pt-2 border-t border-white/[0.02]">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1.5">
          {pick.market}
        </span>
        <div className="flex items-end justify-between gap-4">
          <span className="text-sm md:text-base font-black text-text-primary uppercase tracking-tight italic leading-tight">
            {normalizeBettingPick(pick.pick, pick.match)}
          </span>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">Cuota</span>
            <span className="text-2xl md:text-3xl font-mono font-bold text-accent tracking-tighter leading-none">
              {pick.odds.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
