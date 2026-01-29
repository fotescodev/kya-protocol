import { cn } from "@/lib/cn";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "glow";
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase",
        variant === "default" &&
          "bg-electric/10 text-electric border border-electric/20",
        variant === "glow" &&
          "bg-electric/10 text-electric border border-electric/30 glow-blue",
        className
      )}
    >
      {children}
    </span>
  );
}
