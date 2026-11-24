import { useAlert, useAppData } from "@/lib/sdk/app/hooks";

/** The day the week begins on, as DayPicker counts it: 0 is Sunday */
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEK_STARTS: { value: WeekStart; label: string }[] = [
  { value: 1, label: "Monday" },
  { value: 0, label: "Sunday" },
  { value: 6, label: "Saturday" },
];

const WEEK_START_KEY = "week_starts_on";
const DEFAULT_WEEK_START: WeekStart = 0;

const isWeekStart = (value: unknown): value is WeekStart => {
  return WEEK_STARTS.some((start) => {
    return start.value === value;
  });
};

/** The week start from the app's own storage, and a setter */
export const useWeekStart = (): [WeekStart, (value: WeekStart) => void] => {
  const [data, update] = useAppData();
  const alert = useAlert();
  // NOTE: The schema leaves the format of the app data to the app
  const stored = (data as Record<string, unknown>)[WEEK_START_KEY];
  const weekStart = isWeekStart(stored) ? stored : DEFAULT_WEEK_START;
  const setWeekStart = (value: WeekStart) => {
    void update((current) => {
      return { ...current, [WEEK_START_KEY]: value };
    }).then((res) => {
      if (!res.ok) {
        alert.show({
          type: "error",
          title: "Can't save the setting",
          message: res.error.message,
        });
      }
    });
  };
  return [weekStart, setWeekStart];
};
