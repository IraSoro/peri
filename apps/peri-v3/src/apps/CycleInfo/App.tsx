import { cva, type VariantProps } from "class-variance-authority";
import { ChartNoAxesCombined } from "lucide-react";
import type { Cycle } from "@repo/config-schema/config-v2.schema";
import { defineInternalApp } from "@/lib/sdk/app/api";
import {
  useCycles,
  usePastPrediction,
  usePredictions,
} from "@/lib/sdk/app/hooks";
import {
  cycleStats,
  dayOfCycle,
  pastPhasesByDay,
  type CycleStats,
} from "@/lib/sdk/calculations/cycles";
import { phasesByDay } from "@/lib/sdk/calculations/predictions";
import type { Phase } from "@/lib/sdk/types";
import { Typography } from "@/components/ui/Typography";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/Collapsible";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { manifest } from "./manifest";

export const CycleInfoApp = () => {
  const [cycles] = useCycles();
  const last = cycles.at(-1);
  if (!last) {
    return <NoDataFallback />;
  }
  return <CycleInfo cycles={cycles} last={last} />;
};

const NoDataFallback = () => {
  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <Typography size={7} weight="bold">
        Cycle
      </Typography>
      <Typography size={1} weight="bold" color="secondary">
        No cycles yet
      </Typography>
    </div>
  );
};

const formatDate = (iso: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
};

const CycleInfo = ({ cycles, last }: { cycles: Cycle[]; last: Cycle }) => {
  const predictions = usePredictions();
  const day = dayOfCycle(last);
  // Only the days that have already passed
  const phases = phasesByDay(predictions, cycles).slice(0, day);
  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <Typography size={7} weight="bold">
        Cycle
      </Typography>
      <div className="flex w-full flex-col gap-4 md:gap-5">
        <div className="flex flex-col gap-2 md:gap-3">
          <CapsuleList>
            {phases.map((phase, index) => {
              return <Capsule key={index} color={phase} />;
            })}
          </CapsuleList>
          <Collapsible>
            <CollapsibleTrigger>
              Started on {formatDate(last.start_date)}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Legend phases={phases} />
            </CollapsibleContent>
          </Collapsible>
        </div>
        <CycleSummary day={day} stats={cycleStats(cycles)} />
      </div>
      <Statistics cycles={cycles} />
    </div>
  );
};

const Statistics = ({ cycles }: { cycles: Cycle[] }) => {
  // NOTE: The current cycle is not a part of the statistics, so it needs a finished one
  const past = cycles
    .filter((cycle) => {
      return cycle.cycle_length !== null;
    })
    .reverse();
  if (past.length === 0) {
    return null;
  }
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="sm" variant="outlined">
            <ChartNoAxesCombined />
            Statistics
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader title="Statistics" />
        <div className="p-4 md:p-6">
          {/* Fits 4 collapsed cycles, more scroll. It reaches the dialog edge to keep the scrollbar there */}
          <ScrollArea className="-me-4 max-h-104 w-[calc(100%+1rem)] md:-me-6 md:max-h-132 md:w-[calc(100%+1.5rem)]">
            <div className="flex flex-col gap-8 pe-4 md:pe-6">
              {past.map((cycle) => {
                return <PastCycle key={cycle.start_date} cycle={cycle} />;
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PastCycle = ({ cycle }: { cycle: Cycle }) => {
  const ovulation = usePastPrediction("ovulation", cycle);
  // The capsules wait for the ovulation days, so they don't change colors
  const phases = ovulation ? pastPhasesByDay(cycle, ovulation) : [];
  if (!cycle.end_date) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <CapsuleList>
        {phases.map((phase, index) => {
          return <Capsule key={index} color={phase} />;
        })}
      </CapsuleList>
      <Collapsible>
        <CollapsibleTrigger>
          {formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Typography size={2} color="secondary">
            Cycle lasted {cycle.cycle_length} days
          </Typography>
          <Legend phases={phases} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

type CapsuleListProps = Pick<React.ComponentProps<"div">, "children">;

const CapsuleList = ({ children }: CapsuleListProps) => {
  return <div className="flex gap-1">{children}</div>;
};

const capsuleVariants = cva("flex-1 rounded-2xl md:rounded-3xl border", {
  variants: {
    size: {
      xs: "h-5 max-w-3 md:h-7 md:max-w-4",
      md: "h-11 max-w-6 md:h-14 md:max-w-7",
    },
    color: {
      follicular: "bg-follicular-bg border-follicular-primary",
      menstrual: "bg-menstrual-bg border-menstrual-primary",
      ovulation: "bg-ovulation-bg border-ovulation-primary",
      luteal: "bg-luteal-bg border-luteal-primary",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type CapsuleProps = VariantProps<typeof capsuleVariants> &
  React.ComponentProps<"div">;

const Capsule = ({ size, color, ...props }: CapsuleProps) => {
  return <div {...props} className={capsuleVariants({ size, color })} />;
};

const Legend = ({ phases }: { phases: Phase[] }) => {
  return (
    <>
      {[...new Set(phases)].map((phase) => {
        const count = phases.filter((item) => {
          return item === phase;
        }).length;
        return (
          <LegendItem
            key={phase}
            color={phase}
            text={`${count} ${count === 1 ? "day" : "days"} of ${phase}`}
          />
        );
      })}
    </>
  );
};

type LegendItemProps = {
  text: string;
  color: React.ComponentProps<typeof Capsule>["color"];
};

const LegendItem = ({ text, color }: LegendItemProps) => {
  return (
    <div className="flex w-full items-center gap-1">
      <Capsule size="xs" color={color} />
      <Typography size={2} color="secondary">
        {text}
      </Typography>
    </div>
  );
};

const formatLength = (stats: CycleStats["cycleLength"]): string => {
  if (!stats) {
    return "—";
  }
  const deviation = stats.deviation > 0 ? ` ± ${stats.deviation}` : "";
  return `${stats.average}${deviation} days`;
};

const CycleSummary = ({ day, stats }: { day: number; stats: CycleStats }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full justify-between">
        <Typography size={2} color="secondary">
          Day of cycle
        </Typography>
        <Typography size={2} color="primary" weight="bold">
          {day}
        </Typography>
      </div>
      <div className="flex w-full justify-between">
        <Typography size={2} color="secondary">
          Cycle length
        </Typography>
        <Typography size={2} color="primary" weight="bold">
          {formatLength(stats.cycleLength)}
        </Typography>
      </div>
      <div className="flex w-full justify-between">
        <Typography size={2} color="secondary">
          Period length
        </Typography>
        <Typography size={2} color="primary" weight="bold">
          {stats.periodLength ? `${stats.periodLength} days` : "—"}
        </Typography>
      </div>
    </div>
  );
};

void defineInternalApp(manifest, {
  component: CycleInfoApp,
});
