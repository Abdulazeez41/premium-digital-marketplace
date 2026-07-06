import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-[#F4EBED] text-[#7A1F2B]",
        dark: "bg-[#1F1F1F] text-white",
        success: "bg-[#DCFCE7] text-[#166534]",
        warning: "bg-[#FEF3C7] text-[#92400E]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
