import { useEffect, useState } from "react";
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
];

const DOT_ORDER = [0, 1, 3, 2];

const DOT_COUNT = 4;

export type LoaderProps = {
  size: number;
  message?: string;
};

export const Loader = ({ message, size }: LoaderProps) => {
  const [colors, setColors] = useState(["", "", "", ""]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prevTick) => {
        const nextTick = prevTick + 1;
        setColors((prevColors) => {
          const newColors = [...prevColors];
          const dotIndex = DOT_ORDER[prevTick % DOT_ORDER.length];
          newColors[dotIndex] = COLORS[prevTick % COLORS.length];
          return newColors;
        });
        return nextTick;
      });
    }, 350);

    return () => clearInterval(interval);
  }, []);

  const dotCount = message ? tick % DOT_COUNT : 0;
  const gap = size * (4 / 42);

  return (
    <div className="flex items-center gap-2">
      <div
        className="grid grid-cols-2 grid-rows-2 content-center items-center justify-center justify-items-start"
        style={{ gap }}
      >
        {colors.map((color, i) => (
          <span
            key={i}
            className={cn("rounded-full", color)}
            style={{ width: size, height: size }}
          />
        ))}
      </div>

      {message && (
        <span className="text-base-secondary text-xl">
          {message}
          <span className="inline-block w-4 text-left">
            {".".repeat(dotCount)}
          </span>
        </span>
      )}
    </div>
  );
};
