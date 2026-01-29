import { cn } from "@/lib/cn";

type SectionWrapperProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
};

export function SectionWrapper({
  id,
  children,
  className,
  wide,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      <div className={cn("mx-auto", wide ? "max-w-7xl" : "max-w-6xl")}>
        {children}
      </div>
    </section>
  );
}
