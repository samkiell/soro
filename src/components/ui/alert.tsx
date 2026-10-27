import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-lg border p-4 text-sm leading-relaxed", {
  variants: {
    variant: {
      info: "border-border bg-light-gold text-text-primary",
      success: "border-emerald-300 bg-success-tint text-ink",
      warning: "border-amber-300 bg-warning-tint text-ink",
      danger: "border-red-300 bg-danger-tint text-ink",
    },
  },
  defaultVariants: { variant: "info" },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, children, ...props }, ref) => (
    <div ref={ref} className={cn(alertVariants({ variant }), className)} {...props}>
      {title ? <p className="font-semibold text-ink">{title}</p> : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  ),
);
Alert.displayName = "Alert";

export { Alert, alertVariants };
