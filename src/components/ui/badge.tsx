import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white",
        secondary:
          "bg-surface-muted text-text-secondary border border-border",
        outline:
          "text-text-primary border border-border",
        received:
          "bg-brand text-white",
        inProgress:
          "bg-warning-tint text-warning border border-amber-300",
        resolved:
          "bg-success-tint text-success border border-emerald-300",
        urgencyLow:
          "bg-slate-100 text-slate-700 border border-slate-200",
        urgencyMedium:
          "bg-slate-200 text-slate-800 border border-slate-300",
        urgencyHigh:
          "bg-amber-100 text-amber-800 border border-amber-300",
        urgencyCritical:
          "bg-danger-tint text-danger border border-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
