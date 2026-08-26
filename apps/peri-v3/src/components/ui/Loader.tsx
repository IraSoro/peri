import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Typography } from "./Typography";

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

export type LoaderProps = {
  message?: string;
};

export const Loader = ({ message }: LoaderProps) => {
  const [colors, setColors] = useState(["", "", "", ""]);

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

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <div className="grid grid-cols-2 grid-rows-2 content-center items-center justify-center justify-items-start gap-0.5">
        {colors.map((color, i) => (
          <span
            key={i}
            className={cn("h-2 w-2 rounded-full md:h-3 md:w-3", color)}
          />
        ))}
      </div>
      {message && (
        <Typography size={2} color="secondary" className="animate-pulse">
          {message}
        </Typography>
      )}
    </div>
  );
};
