import { cn } from "@/lib/cn";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type BaseProps = {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

type AsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsAnchor = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonProps = AsButton | AsAnchor;

const variants: Record<Variant, string> = {
  primary:
    "bg-electric hover:bg-electric-dark text-white shadow-lg shadow-electric/20 hover:shadow-electric/40",
  secondary:
    "glass-bright text-text-primary hover:bg-white/10",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-white/5",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric cursor-pointer",
    variants[variant],
    sizes[size],
    className
  );

  if ("href" in props && props.href) {
    const { href, ...rest } = props as AsAnchor;
    return <a href={href} className={classes} {...rest} />;
  }

  return <button className={classes} {...(props as AsButton)} />;
}
