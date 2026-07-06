import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-2xl border border-[#ECECEC] bg-white px-4 py-3 text-sm text-[#1F1F1F] placeholder:text-[#888888] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1F2B]/20",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
