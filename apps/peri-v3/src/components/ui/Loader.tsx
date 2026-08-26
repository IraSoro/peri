import { useEffect, useRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const COLORS = [
  "bg-gradient-step-1",
  "bg-gradient-step-2",
  "bg-gradient-step-3",
  "bg-gradient-step-4",
  "bg-gradient-step-5",
  "bg-gradient-step-6",
  "bg-gradient-step-7",
  "bg-gradient-step-8",
  "bg-gradient-step-6",
  "bg-gradient-step-5",
  "bg-gradient-step-4",
  "bg-gradient-step-3",
];
const DOT_ORDER = [0, 1, 3, 2];
const DEFAULT_COLORS_DURATION = 100;
const DEFAULT_DOTS_DURATION = 300;

const loaderContainerVariants = cva(
  "grid grid-cols-2 grid-rows-2 content-center items-center justify-center justify-items-start",
  {
    variants: {
      size: {
        sm: "gap-0.5",
        md: "gap-1",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

const loaderDotVariants = cva("rounded-full", {
  variants: {
    size: {
      sm: "w-2 h-2 md:w-4 md:h-4",
      md: "w-4 h-4 md:w-5 md:h-5",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const loaderMessageVariants = cva("text-base-secondary", {
  variants: {
    size: {
      sm: "text-sm md:text-xl",
      md: "text-xl md:text-2xl",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export type LoaderProps = {
  message?: string;
} & VariantProps<typeof loaderContainerVariants>;

export const Loader = ({ message, size }: LoaderProps) => {
  const [colors, setColors] = useState(["", "", "", ""]);
  const [dotTick, setDotTick] = useState(0);

  const colorTickRef = useRef(0);

  useEffect(() => {
    colorTickRef.current = 0;
    const interval = setInterval(() => {
      const t = colorTickRef.current;
      colorTickRef.current += 1;
      setColors((prevColors) => {
        const newColors = [...prevColors];
        const dotIndex = DOT_ORDER[t % DOT_ORDER.length];
        newColors[dotIndex] = COLORS[t % COLORS.length];
        return newColors;
      });
    }, DEFAULT_COLORS_DURATION);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!message) return;

    const interval = setInterval(() => {
      setDotTick((prev) => prev + 1);
    }, DEFAULT_DOTS_DURATION);

    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className="flex items-center gap-2">
      <div className={cn(loaderContainerVariants({ size }))}>
        {colors.map((color, i) => (
          <span key={i} className={cn(loaderDotVariants({ size }), color)} />
        ))}
      </div>

      {message && (
        <span className={loaderMessageVariants({ size })}>
          {message}
          <span
            className={cn(
              "inline-block text-left",
              loaderMessageVariants({ size }),
            )}
          >
            {".".repeat(message ? dotTick % DOT_ORDER.length : 0)}
          </span>
        </span>
      )}
    </div>
  );
};
