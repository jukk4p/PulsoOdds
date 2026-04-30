import { cn } from "@/lib/utils";

export type PickStatus = "pending" | "won" | "lost" | "void";

interface StatusBadgeProps {
  status: PickStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    pending: {
      label: "Pendiente",
      classes: "bg-pending-bg text-pending border-pending/30"
    },
    won: {
      label: "Ganado",
      classes: "bg-win-bg text-win border-win/30"
    },
    lost: {
      label: "Perdido",
      classes: "bg-loss-bg text-loss border-loss/30"
    },
    void: {
      label: "Nulo",
      classes: "bg-bg-subtle text-void border-border-base"
    }
  };

  const { label, classes } = config[status];

  return (
    <div className={cn(
      "px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest leading-none",
      classes,
      className
    )}>
      {label}
    </div>
  );
}
