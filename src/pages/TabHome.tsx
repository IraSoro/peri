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
  useIonAlert,
} from "@ionic/react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useTranslation } from "react-i18next";
import {
  parseISO,
  startOfToday,
  format,
  formatISO,
  subMonths,
  min,
} from "date-fns";
import { CyclesContext } from "../state/Context";

import { storage } from "../data/Storage";

import Welcome from "../modals/WelcomeModal";
import InfoModal from "../modals/InfoModal";

import {
  getPregnancyChance,
  getDaysBeforePeriod,
  getNewCyclesHistory,
  getLastPeriodDays,
  getActiveDates,
  getPastFuturePeriodDays,
  isPeriodToday,
  isMarkedFutureDays,
  getForecastPeriodDays,
  getOvulationDays,
} from "../state/CalculationLogics";
import { getCurrentTranslation } from "../utils/translation";

import { chevronForwardOutline } from "ionicons/icons";

interface InfoButtonProps {
  setIsInfoModal: (newIsOpen: boolean) => void;
}

const InfoButton = (props: InfoButtonProps) => {
  const { t } = useTranslation();
  const cycles = useContext(CyclesContext).cycles;
  const pregnancyChance = getPregnancyChance(cycles);
  if (cycles.length === 0) {
    return <></>;
  }
  return (
    <IonLabel
      class="info-button"
      onClick={() => props.setIsInfoModal(true)}
    >
      <p
        style={{
          fontSize: "14px",
          color: "var(--ion-color-medium)",
          marginBottom: "20px",
        }}
      >
        <span style={{ color: "var(--ion-color-dark)" }}>
          {pregnancyChance}
        </span>{" "}
        - {t("chance of getting pregnant")}
        <IonIcon
          color="medium"
          slot="end"
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

  const lastPeriodDays = getLastPeriodDays(cycles);
  const forecastPeriodDays = getForecastPeriodDays(cycles);
  const ovulationDays = getOvulationDays(cycles);

  const firstPeriodDay = lastPeriodDays
    .sort((left, right) => {
      const leftDate = new Date(left);
      const rightDate = new Date(right);
      return leftDate.getTime() - rightDate.getTime();
    })
    .at(0);

  const firstPeriodDayDate = firstPeriodDay
    ? parseISO(firstPeriodDay)
    : startOfToday();

  const minDate = formatISO(
    min([firstPeriodDayDate, subMonths(startOfToday(), 6)]),
  );

  return (
    <IonDatetime
      className={
        ovulationDays.includes(format(startOfToday(), "yyyy-MM-dd"))
          ? "view-calendar-today-ovulation"
          : "view-calendar"
      }
      presentation="date"
      locale={getCurrentTranslation()}
      size="cover"
      min={minDate}
      max={formatISO(startOfToday())}
      firstDayOfWeek={1}
      highlightedDates={(isoDateString) => {
        if (cycles.length === 0) {
          return undefined;
        }
        if (forecastPeriodDays.includes(isoDateString)) {
          return {
            textColor: "var(--ion-color-dark-basic)",
            backgroundColor: "rgba(var(--ion-color-light-basic-rgb), 0.3)",
          };
        } else if (lastPeriodDays.includes(isoDateString)) {
          return {
            textColor: "#43348d",
            backgroundColor: "rgba(var(--ion-color-light-basic-rgb), 0.8)",
          };
        } else if (ovulationDays.includes(isoDateString)) {
          return {
            textColor: "var(--ion-color-ovulation)",
            backgroundColor: "var(--ion-color-light)",
            fontWeight: "bold",
          };
        }

        return undefined;
      }}
    >
      <IonButtons slot="buttons">
        <IonButton
          color="dark-basic"
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
  const [cannotSaveAlert] = useIonAlert();

  const { t } = useTranslation();
  const { cycles, updateCycles } = useContext(CyclesContext);

  const lastPeriodDays = getLastPeriodDays(cycles);

  const firstPeriodDay = lastPeriodDays
    .sort((left, right) => {
      const leftDate = new Date(left);
      const rightDate = new Date(right);
      return leftDate.getTime() - rightDate.getTime();
    })
    .at(0);

  const firstPeriodDayDate = firstPeriodDay
    ? parseISO(firstPeriodDay)
    : startOfToday();

  const minDate = formatISO(
    min([firstPeriodDayDate, subMonths(startOfToday(), 6)]),
  );

  return (
    <IonDatetime
      className="edit-calendar"
      ref={datetimeRef}
      presentation="date"
      locale={getCurrentTranslation()}
      size="cover"
      min={minDate}
      max={formatISO(startOfToday())}
      multiple
      firstDayOfWeek={1}
      // NOTE: Please don't remove `reverse` here, more info https://github.com/IraSoro/peri/issues/157
      value={lastPeriodDays.reverse()}
      isDateEnabled={(isoDateString) => {
        return getActiveDates(parseISO(isoDateString), cycles);
      }}
    >
      <IonButtons slot="buttons">
        <IonButton
          color="blackout-basic"
          onClick={() => {
            props.setIsEditCalendar(false);
          }}
        >
          {t("cancel")}
        </IonButton>
        <IonButton
          color="blackout-basic"
          onClick={() => {
            datetimeRef.current?.confirm().catch((err) => console.error(err));
            if (datetimeRef.current?.value) {
              const periodDaysString = (
                datetimeRef.current.value as string[]
              ).map((isoDateString) => {
                return parseISO(isoDateString).toString();
              });

              if (isMarkedFutureDays(periodDaysString)) {
                datetimeRef.current.value = getLastPeriodDays(cycles);

                cannotSaveAlert({
                  header: t("You can't mark future days"),
                  buttons: ["OK"],
                }).catch((err) => console.error(err));

                return;
              }
              updateCycles(getNewCyclesHistory(periodDaysString));
            }
            props.setIsEditCalendar(false);
          }}
        >
          {t("save")}
        </IonButton>
      </IonButtons>
    </IonDatetime>
  );
};

interface HomeProps {
  isLanguageModal: boolean;
  setIsLanguageModal: (newIsOpen: boolean) => void;
}

const TabHome = (props: HomeProps) => {
  const [isInfoModal, setIsInfoModal] = useState(false);
  const [isWelcomeModal, setIsWelcomeModal] = useState(false);
  const [isEditCalendar, setIsEditCalendar] = useState(false);
  const [periodTodayAlert] = useIonAlert();

  const router = useIonRouter();

  useEffect(() => {
    storage.get.cycles().catch((err) => {
      console.error(`Can't get cycles ${(err as Error).message}`);
      setIsWelcomeModal(true);
    });
  }, []);

  useEffect(() => {
    const backButtonHandler = () => {
      if (isInfoModal || props.isLanguageModal) {
        setIsInfoModal(false);
        props.setIsLanguageModal(false);
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
  }, [router, isInfoModal, props]);

  const { t } = useTranslation();
  const { cycles, updateCycles } = useContext(CyclesContext);

  return (
    <IonPage style={{ backgroundColor: "var(--ion-color-background)" }}>
      <div id="wide-screen">
        <IonContent
          className="ion-padding"
          color="transparent-basic"
        >
          <Welcome
            isOpen={isWelcomeModal}
            setIsOpen={setIsWelcomeModal}
            isLanguageModal={props.isLanguageModal}
            setIsLanguageModal={props.setIsLanguageModal}
          />
          <div id="context-size">
            <div style={{ marginTop: "30px", marginBottom: "30px" }}>
              <IonLabel>
                <p style={{ fontSize: "35px", color: "var(--ion-color-dark)" }}>
                  {getDaysBeforePeriod(cycles).title}
                </p>
              </IonLabel>
            </div>
            <div>
              <IonLabel>
                <p
                  style={
                    cycles.length === 1
                      ? {
                          fontWeight: "bold",
                          fontSize: "35px",
                          color: "var(--ion-color-dark-basic)",
                          marginBottom: "30px",
                        }
                      : {
                          fontWeight: "bold",
                          fontSize: "40px",
                          color: "var(--ion-color-dark-basic)",
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
                color="dark-basic"
                onClick={() => {
                  if (isPeriodToday(cycles)) {
                    periodTodayAlert({
                      header: t("Period today"),
                      buttons: ["OK"],
                    }).catch((err) => console.log(err));
                    return;
                  }
                  const newCycles = getNewCyclesHistory(
                    getPastFuturePeriodDays(cycles),
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
