import { cn } from "@/lib/utils";

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number;
}

export function BentoGrid({ className, cols, children, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function BentoItem({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
