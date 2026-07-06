import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" && "mx-auto max-w-3xl text-center",
        className,
      )}
    >
      {eyebrow ? <Badge className="w-fit">{eyebrow}</Badge> : null}
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight text-[#1F1F1F] sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-base leading-8 text-[#666666]">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
