import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn("border-b border-[#ECECEC]", className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={cn(
          "flex w-full items-center justify-between py-5 text-left text-base font-medium text-[#1F1F1F]",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 text-[#666666] transition-transform data-[state=open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={cn("pb-5 text-sm leading-7 text-[#666666]", className)}
      {...props}
    />
  );
}
