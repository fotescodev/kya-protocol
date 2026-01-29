"use client";

import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

type FadeInOnScrollProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
};

export function FadeInOnScroll({
  children,
  className,
  delay = 0,
  direction = "up",
}: FadeInOnScrollProps) {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  const directionStyles = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isInView
          ? "opacity-100 translate-x-0 translate-y-0"
          : `opacity-0 ${directionStyles[direction]}`,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
