import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-2xl border border-[#ECECEC] bg-white px-4 py-2 text-sm text-[#1F1F1F] placeholder:text-[#888888] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1F2B]/20",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
