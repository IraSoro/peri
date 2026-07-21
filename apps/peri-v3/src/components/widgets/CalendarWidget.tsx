import { Button } from "@base-ui/react";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { Calendar } from "@/components/ui/Calendar";
import { Loader } from "@/components//ui/Loader";

export const CalendarWidget = () => {
  return (
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
  );
};
