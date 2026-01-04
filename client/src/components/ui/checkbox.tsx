import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // 1. LAYOUT & SIZING
      "peer shrink-0 border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      
      // FIX: Add these critical properties
      "h-6 w-6",
      "box-border", // Ensures border is included in dimensions
      "inline-flex", // Better than default display
      "items-center justify-center", // Centers the checkmark
      
      // 2. SHAPE (Square)
      "rounded-none", 
      "border-black",
      "border-2", // Explicit border width
      
      // 3. CHECKMARK COLOR
      "data-[state=checked]:text-green-500",
      
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-5 w-5 stroke-[3px]" /> 
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };