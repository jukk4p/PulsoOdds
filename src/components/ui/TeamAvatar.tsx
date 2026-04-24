import { cn } from "@/lib/utils";

interface TeamAvatarProps {
  name: string;
  className?: string;
}

export function TeamAvatar({ name, className }: TeamAvatarProps) {
  // Get first two initials
  const initials = name
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn(
      "flex items-center justify-center rounded-full bg-bg-subtle border border-border-base text-text-muted font-bold text-[10px] select-none",
      className
    )}>
      {initials}
    </div>
  );
}
