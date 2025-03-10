import { useContext, useEffect, useRef, useState } from "react";
import {
  IonContent,
  IonPage,
  IonLabel,
  useIonRouter,
  IonDatetime,
  IonButton,
  IonCol,
  IonIcon,
  IonButtons,
  IonModal,
  IonToolbar,
} from "@ionic/react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useTranslation } from "react-i18next";
import {
  parseISO,
  startOfToday,
  formatISO,
  subMonths,
  min,
  startOfMonth,
  endOfMonth,
  addMonths,
  max,
} from "date-fns";
import { CyclesContext, ThemeContext } from "../state/Context";

import { storage } from "../data/Storage";
import { configuration } from "../data/AppConfiguration";

import Welcome from "../modals/WelcomeModal";
import InfoModal from "../modals/InfoModal";

import {
  getPregnancyChance,
  getDaysBeforePeriod,
  getNewCyclesHistory,
  getPeriodDates,
  getActiveDates,
  getPeriodDatesWithNewElement,
  isPeriodToday,
  getForecastPeriodDates,
  getOvulationDates,
  getPeriodDatesOfLastCycle,
} from "../state/CalculationLogics";
import { getCurrentTranslation } from "../utils/translation";
import { format } from "../utils/datetime";

import { chevronForwardOutline } from "ionicons/icons";

interface InfoButtonProps {
  setIsInfoModal: (newIsOpen: boolean) => void;
}

const InfoButton = (props: InfoButtonProps) => {
  const { t } = useTranslation();

  const cycles = useContext(CyclesContext).cycles;
  const theme = useContext(ThemeContext).theme;

  const pregnancyChance = getPregnancyChance(cycles);
  if (cycles.length <= 1) {
    return <p style={{ marginBottom: "20px", height: "22px" }}></p>;
  }
  return (
    <IonLabel
      onClick={() => props.setIsInfoModal(true)}
      mode="md"
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <p
        style={{
          fontSize: "14px",
          color: "var(--ion-color-medium)",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: `var(--ion-color-text-${theme})`,
            marginRight: "3px",
          }}
        >
          {pregnancyChance}
        </span>
        - {t("chance of getting pregnant")}
        <IonIcon
          color={`dark-${theme}`}
          style={{ fontSize: "22px", marginLeft: "5px" }}
          icon={chevronForwardOutline}
        />
      </p>
    </IonLabel>
  );
};

interface SelectCalendarProps {
  setIsEditCalendar: (newIsOpen: boolean) => void;
}

const ViewCalendar = (props: SelectCalendarProps) => {
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
      mode="md"
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

const EditCalendar = (props: SelectCalendarProps) => {
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
      mode="md"
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

const DemoAlert = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();

  return (
    <IonModal
      id="alert-demo-modal"
      isOpen={isOpen}
    >
      <div className="wrapper">
        <h1>{t("This is just a demo")}</h1>
        <p>
          <span>{t("You can download the application ")}</span>
          <a href="https://github.com/IraSoro/peri/releases/latest">
            {t("here")}
          </a>
        </p>
        <IonCol>
          <IonToolbar>
            <IonButtons slot="primary">
              <IonButton
                onClick={() => setIsOpen(false)}
                color="dark-basic"
              >
                OK
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonCol>
      </div>
    </IonModal>
  );
};

const TabHome = () => {
  const theme = useContext(ThemeContext).theme;

  const [isInfoModal, setIsInfoModal] = useState(false);
  const [isWelcomeModal, setIsWelcomeModal] = useState(false);
  const [isEditCalendar, setIsEditCalendar] = useState(false);

  const router = useIonRouter();

  useEffect(() => {
    storage.get.cycles().catch((err) => {
      console.error(`Can't get cycles ${(err as Error).message}`);
      setIsWelcomeModal(true);
    });
  }, []);

  useEffect(() => {
    const backButtonHandler = () => {
      if (isInfoModal) {
        setIsInfoModal(false);
        router.push("/home");
        return;
      }
      if (!Capacitor.isPluginAvailable("App")) {
        return;
      }
      App.exitApp?.().catch((err) => console.error(err));
    };

    document.addEventListener("ionBackButton", backButtonHandler);

    return () => {
      document.removeEventListener("ionBackButton", backButtonHandler);
    };
  }, [router, isInfoModal]);

  const { t } = useTranslation();
  const { cycles, updateCycles } = useContext(CyclesContext);

  return (
    <IonPage
      style={{ backgroundColor: `var(--ion-color-background-${theme})` }}
    >
      {configuration.features.demoMode && <DemoAlert />}
      <div
        id="wide-screen"
        className={theme}
      >
        <IonContent
          className="ion-padding"
          color={`transparent-${theme}`}
        >
          <Welcome
            isOpen={isWelcomeModal}
            setIsOpen={setIsWelcomeModal}
          />
          <div id="context-size">
            <div style={{ marginTop: "30px", marginBottom: "30px" }}>
              <IonLabel mode="md">
                <p
                  style={{
                    fontSize: "35px",
                    color: `var(--ion-color-text-${theme})`,
                  }}
                >
                  {getDaysBeforePeriod(cycles).title}
                </p>
              </IonLabel>
            </div>
            <div>
              <IonLabel mode="md">
                <p
                  style={
                    cycles.length === 1
                      ? {
                          fontWeight: "bold",
                          fontSize: "35px",
                          color: `var(--ion-color-dark-${theme})`,
                          marginBottom: "30px",
                        }
                      : {
                          fontWeight: "bold",
                          fontSize: "40px",
                          color: `var(--ion-color-dark-${theme})`,
                          marginBottom: "30px",
                        }
                  }
                >
                  {getDaysBeforePeriod(cycles).days}
                </p>
              </IonLabel>
            </div>
            <InfoButton setIsInfoModal={setIsInfoModal} />
            <InfoModal
              isOpen={isInfoModal}
              setIsOpen={setIsInfoModal}
            />
            <IonCol style={{ marginBottom: "20px" }}>
              <IonButton
                className="main"
                mode="md"
                color={`dark-${theme}`}
                disabled={isPeriodToday(cycles)}
                onClick={() => {
                  const newCycles = getNewCyclesHistory(
                    getPeriodDatesWithNewElement(cycles),
                  );
                  updateCycles(newCycles);
                }}
              >
                {t("mark")}
              </IonButton>
            </IonCol>
            <IonCol>
              {isEditCalendar ? (
                <EditCalendar setIsEditCalendar={setIsEditCalendar} />
              ) : (
                <ViewCalendar setIsEditCalendar={setIsEditCalendar} />
              )}
            </IonCol>
          </div>
        </IonContent>
      </div>
    </IonPage>
  );
};

export default TabHome;
