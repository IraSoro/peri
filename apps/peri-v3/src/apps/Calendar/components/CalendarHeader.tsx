import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import type { WeekStart } from "../settings";
import { calendarClassNames } from "./calendarClassNames";

type CalendarHeaderProps = {
  dir: "ltr" | "rtl";
  month: Date;
  weekStartsOn: WeekStart;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onScrollPrev: () => void;
  onScrollNext: () => void;
};

export const CalendarHeader = ({
  dir,
  month,
  weekStartsOn,
  canScrollPrev,
  canScrollNext,
  onScrollPrev,
  onScrollNext,
}: CalendarHeaderProps) => {
  return (
    <DayPicker
      dir={dir}
      month={month}
      weekStartsOn={weekStartsOn}
      disableNavigation
      classNames={calendarClassNames}
      components={{
        Weeks: () => <></>,
        Nav: () => (
          <div className={calendarClassNames.nav}>
            <IconButton disabled={!canScrollPrev} onClick={onScrollPrev}>
              {dir === "rtl" ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
            <IconButton disabled={!canScrollNext} onClick={onScrollNext}>
              {dir === "rtl" ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          </div>
        ),
      }}
    />
  );
};
