import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldControlClasses } from "./input";

/** Native select: lightweight, accessible, and works well on mobile. */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(fieldControlClasses, "min-h-[44px] py-2 pr-8", className)}
    {...props}
  />
));
Select.displayName = "Select";

export { Select };
