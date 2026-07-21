import { Button, Collapsible } from "@base-ui/react";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { ChartNoAxesCombined, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const phases = [
  {
    color: "bg-luteal-bg border-luteal-primary",
  },
  {
    color: "bg-menstrual-bg border-menstrual-primary",
  },
  {
    color: "bg-ovulation-bg border-ovulation-primary",
  },
  {
    color: "bg-follicular-bg border-follicular-primary",
  },
];

export const CycleInfoWidget = () => {
  return (
    <WidgetLayout className="items-start">
      <div className="text-base-primary text-3xl font-bold">Cycle</div>
      <div className="flex w-full flex-col gap-3">
        {/* Cycle status */}
        <div className="flex gap-1">
          {phases.map((phase, index) => (
            <div
              key={index}
              className={cn(
                "h-14 max-w-7 flex-1 rounded-2xl border-2",
                phase.color,
              )}
            />
          ))}
        </div>
        {/* Start date */}
        <Collapsible.Root className="flex flex-col pt-3 pb-3 pl-0">
          <Collapsible.Trigger className="stroke-base-primary text-base-primary flex w-full items-center justify-between text-lg font-bold">
            Started on January 4th
            <ChevronsUpDown />
          </Collapsible.Trigger>
          <Collapsible.Panel className="flex flex-col gap-2 pt-3 pb-3">
            <div className="text-base-secondary flex w-full items-center gap-1 text-lg">
              <div
                className={cn(
                  "bg-luteal-bg border-luteal-primary h-7 max-w-4 flex-1 rounded-2xl border-2",
                )}
              />
              <div>3rd day of menstruation</div>
            </div>
            <div className="text-base-secondary flex w-full items-center gap-1 text-lg">
              <div
                className={cn(
                  "bg-follicular-bg border-follicular-primary h-7 max-w-4 flex-1 rounded-2xl border-2",
                )}
              />
              <div>5 days of follicular</div>
            </div>
            <div className="text-base-secondary flex w-full items-center gap-1 text-lg">
              <div
                className={cn(
                  "bg-luteal-bg border-luteal-primary h-7 max-w-4 flex-1 rounded-2xl border-2",
                )}
              />
              <div>3 days of luteal</div>
            </div>
            <div className="text-base-secondary flex w-full items-center gap-1 text-lg">
              <div
                className={cn(
                  "bg-ovulation-bg border-ovulation-primary h-7 max-w-4 flex-1 rounded-2xl border-2",
                )}
              />
              <div>4 days of ovulation</div>
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>
        {/* Cycle info */}
        <div className="flex flex-col gap-2 text-lg">
          <div className="flex w-full justify-between">
            <div className="text-base-secondary">Day of cycle</div>
            <div className="font-bold">3rd</div>
          </div>
          <div className="flex w-full justify-between">
            <div className="text-base-secondary">Cycle length</div>
            <div className="font-bold">28 ± 2 days</div>
          </div>
          <div className="flex w-full justify-between">
            <div className="text-base-secondary">Period length</div>
            <div className="font-bold">6 days</div>
          </div>
        </div>
      </div>
      <Button className="border-base-primary flex gap-2 rounded-md border p-2 pr-3 pl-3 text-lg font-semibold">
        <ChartNoAxesCombined />
        Statistics
      </Button>
    </WidgetLayout>
  );
};
