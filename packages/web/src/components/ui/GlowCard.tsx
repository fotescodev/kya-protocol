import { cn } from "@/lib/cn";

type GlowCardProps = {
  children: React.ReactNode;
  className?: string;
  glow?: "blue" | "cyan" | "purple" | "green" | "none";
  hover?: boolean;
};

export function GlowCard({
  children,
  className,
  glow = "blue",
  hover = true,
}: GlowCardProps) {
  const glowStyles = {
    blue: "glow-blue",
    cyan: "glow-cyan",
    purple: "glow-purple",
    green: "glow-blue",
    none: "",
  };

  return (
    <div
      className={cn(
        "glass rounded-2xl p-6",
        glowStyles[glow],
        hover && "transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]",
        className
      )}
    >
      {children}
    </div>
  );
}
