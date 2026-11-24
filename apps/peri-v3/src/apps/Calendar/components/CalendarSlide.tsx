import { DayPicker } from "react-day-picker";
import type { useCalendarModifiers } from "../hooks/useCalendarModifiers";
import type { WeekStart } from "../settings";
import { calendarClassNames } from "./calendarClassNames";
import { DayButton, DayHoldContext } from "./DayButton";

type CalendarSlideProps = {
  month: Date;
  modifiers: ReturnType<typeof useCalendarModifiers>;
  weekStartsOn: WeekStart;
  onDayClick: (date: Date) => void;
  onDayHold: (date: Date) => void;
  onDayHoldChange: (holding: boolean) => void;
  editing: boolean;
};

export const CalendarSlide = ({
  month,
  modifiers,
  weekStartsOn,
  onDayClick,
  onDayHold,
  onDayHoldChange,
  editing,
}: CalendarSlideProps) => {
  return (
    <DayHoldContext.Provider
      value={{ onHold: onDayHold, onChange: onDayHoldChange, editing }}
    >
      <DayPicker
        // NOTE: A mode makes DayPicker render DayButton, without it the cells are plain
        // text. Nothing is selected, the days are marked by modifiers
        mode="single"
        onDayClick={onDayClick}
        weekStartsOn={weekStartsOn}
        showOutsideDays
        fixedWeeks
        disableNavigation
        hideWeekdays
        month={month}
        className="flex h-full flex-col"
        classNames={calendarClassNames}
        components={{ DayButton, Nav: () => <></>, MonthCaption: () => <></> }}
        modifiers={modifiers}
      />
    </DayHoldContext.Provider>
  );
};
