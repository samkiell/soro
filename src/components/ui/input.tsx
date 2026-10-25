import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldControlClasses =
  "w-full rounded-md border border-border bg-white px-3 text-base text-ink placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(fieldControlClasses, "min-h-[44px] py-2", className)}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
