import { Info } from "lucide-react";
import { Temporal } from "temporal-polyfill";
import type {
  Cycle,
  PredictionDay,
} from "@repo/config-schema/config-v2.schema";
import { Typography } from "@/components/ui/Typography";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { formatInstant } from "@/lib/utils/dates";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { defineInternalApp } from "@/lib/sdk/app/api";
import { useCycles, usePredictions } from "@/lib/sdk/app/hooks";
import {
  currentPhase,
  dayOfPeriod,
  daysLate,
  daysUntilPeriod,
} from "@/lib/sdk/calculations/predictions";
import type { Phase } from "@/lib/sdk/types";
import { manifest } from "./manifest";

export const PeriodStatusApp = () => {
  const [cycles] = useCycles();
  if (cycles.length === 0) {
    return <NoDataFallback />;
  }
  return <PeriodStatus cycles={cycles} />;
};

const DEFAULT_PERIOD_LENGTH = 5;

const NoDataFallback = () => {
  const [, setCycles] = useCycles();
  const startToday = () => {
    const start = Temporal.Now.plainDateISO("UTC")
      .toZonedDateTime("UTC")
      .toInstant();
    void setCycles((current) => {
      return [
        ...current,
        {
          start_date: formatInstant(start),
          period_length: DEFAULT_PERIOD_LENGTH,
        },
      ];
    });
  };
  return (
    <div className="flex flex-col items-start gap-2 md:gap-4">
      <div className="flex flex-col gap-1">
        <Typography size={7} weight="bold">
          Add your last period
        </Typography>
        <Typography size={1} weight="bold" color="secondary">
          Predictions start after your first log.
        </Typography>
      </div>
      <Button
        size="sm"
        variant="outlined"
        color="menstrual"
        onClick={startToday}
      >
        Period started today
      </Button>
    </div>
  );
};

const PeriodStatus = ({ cycles }: { cycles: Cycle[] }) => {
  const predictions = usePredictions();
  const menstruationDays = predictions.menstruation?.days;
  const phase = currentPhase(predictions, cycles);
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PeriodCountdown
        phase={phase}
        menstruationDays={menstruationDays}
        late={daysLate(menstruationDays, cycles)}
      />
      <PeriodInfo phase={phase} />
    </div>
  );
};

const PeriodCountdown = ({
  phase,
  menstruationDays,
  late,
}: {
  phase: Phase;
  menstruationDays: PredictionDay[] | undefined;
  late: number | undefined;
}) => {
  if (late !== undefined) {
    return (
      <CountdownText title="Delay" value={formatDays(late)} color="delayed" />
    );
  }
  if (phase === "menstrual") {
    const day = dayOfPeriod(menstruationDays) ?? 1;
    return <CountdownText title="Period" value={`Day ${day}`} color={phase} />;
  }
  const daysLeft = daysUntilPeriod(menstruationDays);
  // The period is predicted for today and not logged yet
  if (daysLeft === 0) {
    return <CountdownText title="Period" value="Today" color={phase} />;
  }
  return (
    <CountdownText
      title="Period in"
      value={daysLeft === undefined ? "No prediction" : formatDays(daysLeft)}
      color={phase}
    />
  );
};

const formatDays = (count: number): string => {
  return `${count} ${count === 1 ? "day" : "days"}`;
};

const CountdownText = ({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: Phase | "delayed";
}) => {
  return (
    <div className="flex flex-col gap-1">
      <Typography size={7} weight="bold">
        {title}
      </Typography>
      <Typography size={11} weight="bold" color={color}>
        {value}
      </Typography>
    </div>
  );
};

const phaseInfo = "Current phase of the cycle";

const chanceInfo = "Chance of getting pregnant";

const PeriodInfo = ({ phase }: { phase: Phase }) => {
  const highChance = phase === "ovulation";
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <PeriodInfoIndicator label={phase} color={phase} info={phaseInfo} />
      <PeriodInfoIndicator
        label={highChance ? "High" : "Low"}
        color={highChance ? "pregnancyHigh" : "pregnancyLow"}
        info={chanceInfo}
      />
    </div>
  );
};

const periodInfoIndicatorVariants = cva("", {
  variants: {
    color: {
      follicular: "bg-follicular-primary",
      menstrual: "bg-menstrual-primary",
      ovulation: "bg-ovulation-primary",
      luteal: "bg-luteal-primary",
      pregnancyLow: "bg-pregnancyLow-primary",
      pregnancyHigh: "bg-pregnancyHigh-primary",
    },
  },
});

type PeriodInfoIndicatorProps = {
  label: string;
  info: string;
} & VariantProps<typeof periodInfoIndicatorVariants>;

const PeriodInfoIndicator = ({
  label,
  color,
  info,
}: PeriodInfoIndicatorProps) => {
  return (
    <div className="flex gap-0.5 md:gap-1">
      <div className="flex items-center gap-1 md:gap-2">
        <div
          className={cn(
            "size-3 rounded-full md:size-4",
            periodInfoIndicatorVariants({ color }),
          )}
        />
        <Typography size={2} className="capitalize">
          {label}
        </Typography>
      </div>
      <Popover>
        <PopoverTrigger
          render={
            <IconButton size="sm" color="ternary" aria-label={`About ${label}`}>
              <Info />
            </IconButton>
          }
        />
        <PopoverContent>{info}</PopoverContent>
      </Popover>
    </div>
  );
};

void defineInternalApp(manifest, {
  component: PeriodStatusApp,
});
