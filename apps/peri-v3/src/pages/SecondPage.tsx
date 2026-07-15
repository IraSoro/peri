import { PageLayout } from "@/components/layouts/PageLayout";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

export const SecondPage = () => {
  return (
    <PageLayout>
      <WidgetLayout>
        <div className="flex flex-col gap-4">
          <div className="text-base-primary text-2xl font-bold md:text-3xl">
            Follicular phase
          </div>
          <div className="flex flex-col gap-4">
            {/* Carousel header */}
            <div className="flex min-h-8 w-full items-center justify-between">
              <div className="bg-follicular-bg text-follicular-primary stroke-follicular-primary rounded-2xl border-2 pt-0.5 pr-2.5 pb-0.5 pl-2.5 text-sm font-bold md:text-base">
                2 days left
              </div>
              <div className="flex h-full items-center justify-center gap-2">
                <div className="flex h-full items-center justify-center">
                  <ChevronLeft className="stroke-base-disabled h-5 pt-0.5 pl-2" />
                  <div className="text-base-disabled font-bold">Back</div>
                </div>
                <div className="flex h-full items-center justify-center gap-0.5 pt-0.5">
                  <div className="bg-base-primary size-2 rounded-full" />
                  <div className="stroke-base-primary size-2 rounded-full border" />
                  <div className="stroke-base-primary size-2 rounded-full border" />
                  <div className="stroke-base-primary size-2 rounded-full border" />
                </div>
                <div className="flex h-full items-center justify-center">
                  <div className="text-base-primary font-bold">Next</div>
                  <ChevronRight className="h-5 pt-0.5 pr-2" />
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
          <div>TODO: Frequent symptoms</div>
        </div>
      </WidgetLayout>
      <WidgetLayout>
        <div className="flex flex-col gap-4">
          <div className="text-base-primary text-2xl font-bold md:text-3xl">
            Cycle
          </div>
          <div className="flex flex-col gap-4">
            <div>TODO Cycle status</div>
            <div>TODO Start date</div>
            <div>TODO Cycle info</div>
          </div>
          <div>TODO: Statistics button</div>
        </div>
      </WidgetLayout>
    </PageLayout>
  );
};
