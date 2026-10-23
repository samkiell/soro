import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white hover:bg-brand-hover active:bg-brand-hover shadow-xs",
        destructive:
          "bg-danger text-white hover:bg-red-800 active:bg-red-900 shadow-xs",
        outline:
          "border border-border bg-white text-ink hover:bg-surface-muted hover:text-brand shadow-xs",
        secondary:
          "bg-gold text-ink font-semibold hover:bg-gold-hover shadow-xs",
        ghost:
          "text-text-primary hover:bg-surface-muted hover:text-brand",
        link:
          "text-brand underline-offset-4 hover:underline p-0 h-auto",
        gold:
          "bg-gold text-ink font-semibold hover:bg-gold-hover shadow-xs",
      },
      size: {
        default: "min-h-[44px] px-5 py-2",
        sm: "min-h-[36px] rounded-md px-3 text-xs",
        lg: "min-h-[48px] rounded-md px-7 text-base font-semibold",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
