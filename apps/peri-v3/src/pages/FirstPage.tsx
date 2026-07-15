import { PageLayout } from "@/components/layouts/PageLayout";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { Info } from "lucide-react";

export const FirstPage = () => {
  return (
    <PageLayout>
      <WidgetLayout>
        <div className="flex flex-col gap-1">
          <div className="text-base-primary text-2xl font-bold md:text-3xl">
            Period in
          </div>
          <div className="text-follicular-primary text-6xl font-bold md:text-7xl">
            12 days
          </div>
        </div>
        {/* Period status */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex min-h-6 items-center justify-start gap-1">
            <div className="bg-follicular-primary size-2 rounded-full md:size-3" />
            <div className="text-sm md:text-base">Follicular</div>
            <Info className="stroke-base-ternary mt-0.5 -ml-1.5 h-4 md:-ml-0.5 md:h-4.5" />
          </div>
          <div className="flex min-h-6 items-center justify-start gap-1">
            <div className="bg-pregnancyLow-primary size-2 rounded-full md:size-3" />
            <div className="text-sm md:text-base">Low</div>
            <Info className="stroke-base-ternary mt-0.5 -ml-1.5 h-4 md:-ml-0.5 md:h-4.5" />
          </div>
        </div>
      </WidgetLayout>
      <WidgetLayout>
        <h1>TODO: Calendar</h1>
      </WidgetLayout>
    </PageLayout>
  );
};
