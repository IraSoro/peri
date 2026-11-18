import { Info } from "lucide-react";
import type { Cycle } from "@repo/config-schema/config-v2.schema";
import { Typography } from "@/components/ui/Typography";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "@/components/ui/IconButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { defineInternalApp } from "@/lib/sdk/app/api";
import { NoDataError } from "@/lib/sdk/app/errors";
import { useCycles, usePredictions } from "@/lib/sdk/app/hooks";
import {
  periodStatus,
  type PeriodStatus as Status,
} from "@/lib/sdk/calculations/predictions";
import type { Phase } from "@/lib/sdk/types";
import { manifest } from "./manifest";

export const PeriodStatusApp = () => {
  const [cycles] = useCycles();
  if (cycles.length === 0) {
    throw new NoDataError(
      "The countdown and predictions start after your first logged period.",
    );
  }
  return <PeriodStatus cycles={cycles} />;
};

const PeriodStatus = ({ cycles }: { cycles: Cycle[] }) => {
  const status = periodStatus(usePredictions(), cycles);
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PeriodCountdown status={status} />
      <PeriodInfo phase={status.phase} />
    </div>
  );
};

const PeriodCountdown = ({ status }: { status: Status }) => {
  const { phase, late, dayOfPeriod, daysUntilPeriod } = status;
  if (late !== undefined) {
    return (
      <CountdownText title="Delay" value={formatDays(late)} color="delayed" />
    );
  }
  if (phase === "menstrual") {
    return (
      <CountdownText
        title="Period"
        value={`Day ${dayOfPeriod ?? 1}`}
        color={phase}
      />
    );
  }
  // The period is predicted for today and not logged yet
  if (daysUntilPeriod === 0) {
    return <CountdownText title="Period" value="Today" color={phase} />;
  }
  return (
    <CountdownText
      title="Period in"
      value={
        daysUntilPeriod === undefined
          ? "No prediction"
          : formatDays(daysUntilPeriod)
      }
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
