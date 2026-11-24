import { useId } from "react";
import { cn } from "@/lib/utils/cn";

const BORDER_BACK_MS = 250;

type EditBorderProps = {
  drawn: boolean;
  drawMs: number;
};

export const EditBorder = ({ drawn, drawMs }: EditBorderProps) => {
  const gradientId = useId();
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute -inset-0.5 h-[calc(100%+4px)] w-[calc(100%+4px)] md:-inset-0.75 md:h-[calc(100%+6px)] md:w-[calc(100%+6px)]"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop
            offset="0"
            style={{ stopColor: "var(--color-gradient-step-2)" }}
          />
          <stop
            offset="1"
            style={{ stopColor: "var(--color-gradient-step-8)" }}
          />
        </linearGradient>
      </defs>
      <rect
        className={cn(
          "fill-none stroke-2 transition-opacity [rx:12px] md:stroke-3 md:[rx:16px]",
          drawn ? "ease-in" : "ease-out",
        )}
        style={{
          stroke: `url(#${gradientId})`,
          opacity: drawn ? 1 : 0,
          transitionDuration: `${drawn ? drawMs : BORDER_BACK_MS}ms`,
          x: 1,
          y: 1,
          width: "calc(100% - 2px)",
          height: "calc(100% - 2px)",
        }}
      />
    </svg>
  );
};
