import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CyclesContext, ThemeContext } from "../../state/Context";
import {
  addMonths,
  endOfMonth,
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
  getForecastPeriodDates,
  getNewCyclesHistory,
  getOvulationDates,
  getPeriodDates,
  getPeriodDatesOfLastCycle,
} from "../../state/CalculationLogics";
import { IonButton, IonButtons, IonDatetime } from "@ionic/react";
import { getCurrentTranslation } from "../../utils/translation";
import { format } from "../../utils/datetime";

interface CalendarProps {
  setIsEditCalendar: (newIsOpen: boolean) => void;
}

export const ViewCalendar = (props: CalendarProps) => {
  const { t } = useTranslation();
  const { cycles } = useContext(CyclesContext);
  const theme = useContext(ThemeContext).theme;

  const periodDates = getPeriodDates(cycles);
  const forecastPeriodDates = getForecastPeriodDates(cycles);
  const ovulationDates = getOvulationDates(cycles);

  const firstPeriodDay = periodDates
    .sort((left, right) => {
      const leftDate = new Date(left);
      const rightDate = new Date(right);
      return leftDate.getTime() - rightDate.getTime();
    })
    .at(0);

  const firstPeriodDayDate = firstPeriodDay
    ? parseISO(firstPeriodDay)
    : startOfToday();

  const minDate = formatISO(startOfMonth(firstPeriodDayDate));

  const lastForecastPeriodDay = forecastPeriodDates
    .sort((left, right) => {
      const leftDate = new Date(left);
      const rightDate = new Date(right);
      return leftDate.getTime() - rightDate.getTime();
    })
    .at(-1);

  const lastForecastPeriodDayDate = lastForecastPeriodDay
    ? endOfMonth(parseISO(lastForecastPeriodDay))
    : endOfMonth(startOfToday());

  const maxDate = formatISO(
    endOfMonth(max([lastForecastPeriodDayDate, addMonths(startOfToday(), 6)])),
  );

  return (
    <IonDatetime
      className={
        ovulationDates.includes(format(startOfToday(), "yyyy-MM-dd"))
          ? `view-calendar-today-ovulation-${theme}`
          : `view-calendar-${theme}`
      }
      presentation="date"
      locale={getCurrentTranslation()}
      size="cover"
      min={minDate}
      max={maxDate}
      firstDayOfWeek={1}
      highlightedDates={(isoDateString) => {
        if (cycles.length === 0) {
          return undefined;
        }
        if (forecastPeriodDates.includes(isoDateString)) {
          if (theme === "dark") {
            return {
              textColor: `#ffffff`,
              backgroundColor: `rgba(var(--ion-color-light-${theme}-rgb), 0.3)`,
            };
          }
          return {
            textColor: `var(--ion-color-dark-${theme})`,
            backgroundColor: `rgba(var(--ion-color-light-${theme}-rgb), 0.3)`,
          };
        } else if (periodDates.includes(isoDateString)) {
          return theme === "dark"
            ? {
                textColor: `#ffffff`,
                backgroundColor: `rgba(var(--ion-color-dark-${theme}-rgb), 0.6)`,
              }
            : {
                textColor: `var(--ion-color-dark-${theme})`,
                backgroundColor: `rgba(var(--ion-color-light-${theme}-rgb), 0.8)`,
              };
        } else if (ovulationDates.includes(isoDateString)) {
          return {
            textColor: `var(--ion-color-ovulation-${theme})`,
            backgroundColor: `var(--ion-color-calendar-${theme})`,
            fontWeight: "bold",
          };
        }

        return undefined;
      }}
    >
      <IonButtons slot="buttons">
        <IonButton
          color={`dark-${theme}`}
          onClick={() => {
            props.setIsEditCalendar(true);
          }}
        >
          {t("edit")}
        </IonButton>
      </IonButtons>
    </IonDatetime>
  );
};

export const EditCalendar = (props: CalendarProps) => {
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
