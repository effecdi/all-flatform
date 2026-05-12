import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary-dark dark:text-primary-light",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive dark:text-error-light",
        outline: "text-foreground border-border",
        success: "border-transparent bg-success/10 text-success-dark dark:text-success-light",
        warning: "border-transparent bg-warning/10 text-warning-dark dark:text-warning-light",
        error: "border-transparent bg-error/10 text-error-dark dark:text-error-light",
        info: "border-transparent bg-info/10 text-info-dark dark:text-info-light",
        gov: "border-transparent bg-gov-primary/10 text-gov-primary dark:text-gov-primary-light",
        invest: "border-transparent bg-invest-primary/10 text-invest-primary dark:text-invest-primary-light",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
