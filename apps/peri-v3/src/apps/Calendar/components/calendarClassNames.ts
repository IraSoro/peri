import { getDefaultClassNames } from "react-day-picker";
import { cn } from "@/lib/utils/cn";

export const defaultClassNames = getDefaultClassNames();

export const calendarClassNames = {
  root: cn("w-full", defaultClassNames.root),
  months: cn("relative flex relative flex-col", defaultClassNames.months),
  month: cn("flex w-full flex-col gap-1", defaultClassNames.month),
  nav: cn(
    "absolute inset-x-0 top-0 flex h-10 w-full items-center justify-between ps-3 pe-3 md:ps-9 md:pe-9",
    defaultClassNames.nav,
  ),
  button_previous: cn(
    "flex items-center justify-center",
    defaultClassNames.button_previous,
  ),
  button_next: cn(
    "flex items-center justify-center",
    defaultClassNames.button_next,
  ),
  month_caption: cn(
    "flex w-full text-base-primary font-bold text-sm md:text-xl items-center justify-center h-10 lg:text-2xl",
    defaultClassNames.month_caption,
  ),
  month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
  weekdays: cn("flex", defaultClassNames.weekdays),
  weekday: cn(
    "flex flex-1 items-center justify-center text-sm md:text-xl text-base-secondary aspect-square font-normal select-none",
    defaultClassNames.weekday,
  ),
  week: cn("flex w-full", defaultClassNames.week),
  day: cn(
    "flex-1 aspect-square p-0 text-center select-none p-px md:p-1",
    defaultClassNames.day,
  ),
};
