import { Button, Collapsible } from "@base-ui/react";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export const PhaseInfoWidget = () => {
  return (
    <WidgetLayout>
      <div className="text-base-primary text-3xl font-bold">
        Follicular phase
      </div>
      <div className="flex flex-col gap-4">
        {/* Carousel header */}
        <div className="flex min-h-8 w-full items-center justify-between">
          <div className="bg-follicular-bg text-follicular-primary stroke-follicular-primary rounded-2xl border-2 pt-0.5 pr-2.5 pb-0.5 pl-2.5 text-base font-bold">
            2 days left
          </div>
          <div className="flex h-full items-center justify-center gap-2">
            <div className="text-base-disabled stroke-base-disabled flex h-full items-center justify-center">
              <ChevronLeft />
              <Button className="text-xl font-bold">Back</Button>
            </div>
            <div className="flex h-full items-center justify-center gap-0.5">
              <div className="bg-base-primary size-3 rounded-full" />
              <div className="stroke-base-primary size-3 rounded-full border" />
              <div className="stroke-base-primary size-3 rounded-full border" />
              <div className="stroke-base-primary size-3 rounded-full border" />
            </div>
            <div className="text-base-primary stroke-base-primary flex h-full items-center justify-center">
              <Button className="text-xl font-bold">Next</Button>
              <ChevronRight />
            </div>
          </div>
        </div>
        {/* Carousel content */}
        <div className="flex flex-col gap-2">
          <div className="text-base-primary text-lg font-bold">About</div>
          <div className="text-base-secondary flex flex-col gap-3">
            <p>
              The luteal phase is the second half of the menstrual cycle,
              starting after ovulation and lasting about 14 days.
            </p>
            <p>
              During this phase, the corpus luteum forms and releases
              progesterone, which prepares the uterus for a possible
              pregnancy...
              <span className="text-action-primary whitespace-nowrap">
                Show more
              </span>
            </p>
          </div>
        </div>
      </div>
      <Collapsible.Root className="flex flex-col rounded-xl border-2 p-3">
        <Collapsible.Trigger className="stroke-base-primary text-base-primary flex w-full items-center justify-between text-lg font-bold">
          Frequent symptoms
          <ChevronDown />
        </Collapsible.Trigger>
        <Collapsible.Panel className="flex flex-wrap gap-1 gap-2 pt-3 pb-3">
          <div className="bg-base-secondary text-base-primary-inverse rounded-md p-1 pr-3 pl-3 text-lg">
            puffiness
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    </WidgetLayout>
  );
};
