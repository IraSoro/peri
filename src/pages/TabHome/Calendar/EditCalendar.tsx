import { useContext, useEffect, useRef, useState } from "react";
import { CalendarProps } from "./interfaces";
import { useTranslation } from "react-i18next";
import { CyclesContext, ThemeContext } from "../../../state/Context";
import {
  formatISO,
  max,
  min,
  parseISO,
  startOfMonth,
  startOfToday,
  subMonths,
} from "date-fns";
import {
  getActiveDates,
  getNewCyclesHistory,
  getPeriodDates,
  getPeriodDatesOfLastCycle,
} from "../../../state/CalculationLogics";
import { IonButton, IonButtons, IonDatetime } from "@ionic/react";
import { getCurrentTranslation } from "../../../utils/translation";
import { format } from "../../../utils/datetime";

const EditCalendar = (props: CalendarProps) => {
  const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);

  const { t } = useTranslation();
  const { cycles, updateCycles } = useContext(CyclesContext);
  const theme = useContext(ThemeContext).theme;

  // NOTE: This is a hack. I fixed the bug: when opening the editing calendar,
  // a month not related to the specified dates opened (May 2021).
  // I found several similar bugs (for example ionic-team/ionic-framework#29094)
  // I fixed it like this: I specified one date at initialization (today)
  const [datesValue, setDatesValue] = useState([startOfToday().toISOString()]);

  // and then in the useEffect I update this value to the required ones
  useEffect(() => {
    setDatesValue(getPeriodDates(cycles));
  }, [cycles]);

  const periodDays = getPeriodDates(cycles);
  const lastPeriodDays = getPeriodDatesOfLastCycle(cycles);

  const sortedPeriodDays = periodDays.sort((left, right) => {
    const leftDate = new Date(left);
    const rightDate = new Date(right);
    return leftDate.getTime() - rightDate.getTime();
  });

  const firstPeriodDay = sortedPeriodDays.at(0);
  const lastPeriodDay = sortedPeriodDays.at(-1);

  const firstPeriodDayDate = firstPeriodDay
    ? parseISO(firstPeriodDay)
    : startOfToday();

  const lastPeriodDayDate = lastPeriodDay
    ? parseISO(lastPeriodDay)
    : startOfToday();

  const minDate = formatISO(
    startOfMonth(min([firstPeriodDayDate, subMonths(startOfToday(), 6)])),
  );

  const maxDate = formatISO(max([startOfToday(), lastPeriodDayDate]));

  return (
    <IonDatetime
      className={`edit-calendar-${theme}`}
      ref={datetimeRef}
      presentation="date"
      locale={getCurrentTranslation()}
      size="cover"
      min={minDate}
      max={maxDate}
      multiple
      firstDayOfWeek={1}
      value={datesValue}
      isDateEnabled={(isoDateString) => {
        return getActiveDates(parseISO(isoDateString), cycles);
      }}
    >
      <IonButtons slot="buttons">
        <IonButton
          color={`blackout-${theme}`}
          onClick={() => {
            props.setIsEditCalendar(false);
          }}
        >
          {t("cancel")}
        </IonButton>
        <IonButton
          color={`blackout-${theme}`}
          onClick={() => {
            // NOTE: `confirm` should be called to update values in `datetimeRef`
            datetimeRef.current?.confirm().catch((err) => console.error(err));

            let markedDays = (datetimeRef.current?.value as string[]) ?? [];
            const todayFormatted = format(startOfToday(), "yyyy-MM-dd");

            // NOTE: If "lastPeriodDays" includes today, but the marked days don't,
            //       it means that the user has unmarked the first day of a new period
            //       that started today
            //       In this case we thinking that user marked first day of cycle by error
            //       and remove the last period from the cycles array
            if (
              lastPeriodDays.includes(todayFormatted) &&
              !markedDays.includes(todayFormatted)
            ) {
              markedDays = markedDays.filter((isoDateString) => {
                return !lastPeriodDays.includes(isoDateString);
              });
            }

            const periodDaysString = markedDays.map((isoDateString) => {
              return parseISO(isoDateString).toString();
            });

            updateCycles(getNewCyclesHistory(periodDaysString));
            props.setIsEditCalendar(false);
          }}
        >
          {t("save")}
        </IonButton>
      </IonButtons>
    </IonDatetime>
  );
};

export default EditCalendar;
