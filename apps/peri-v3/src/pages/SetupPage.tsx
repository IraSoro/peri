import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layouts/PageLayout";
import periLookup from "@/assets/peri-lookup.webp";
import { Calendar } from "@/components/ui/Calendar";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { cn } from "@/lib/utils/cn";
import { Button } from "@base-ui/react";

export const SetupPage = () => {
  return (
    <PageLayout>
      <img src={periLookup} alt="Peri lookup" className="h-45" />
      <div className="text-base-secondary text-center text-3xl font-bold whitespace-pre-line">
        {"Let's mark the day of your\nlast period:"}
      </div>
      <WidgetLayout>
        <Calendar />
        <div className="flex justify-between pr-5 pl-5">
          <Loader size={14} message="Saving" />
          <div className="flex gap-4">
            <Button className="text-base-primary min-h-10 items-center justify-center p-1 pr-3 pl-3 text-2xl">
              Discard
            </Button>
            <Button className="bg-base-primary text-base-primary-inverse min-h-10 items-center justify-center rounded-lg border-2 p-1 pr-3 pl-3 text-2xl">
              Save
            </Button>
          </div>
        </div>
      </WidgetLayout>
    </PageLayout>
  );
};

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

type LoaderProps = {
  size: number;
  message?: string;
};

const Loader = ({ message, size }: LoaderProps) => {
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
