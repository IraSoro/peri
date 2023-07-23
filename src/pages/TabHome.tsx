import { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonItem,
  IonImg,
  IonLabel,
  IonRow,
  IonCol,
  useIonRouter,
} from "@ionic/react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useTranslation } from "react-i18next";

import "./TabHome.css";
import uterus from "../assets/uterus.svg";
import {
  useDayOfCycle,
  useLastStartDate,
  useAverageLengthOfCycle,
} from "../state/CycleInformationHooks";

import { storage } from "../data/Storage";

import Welcome from "../modals/WelcomeModal";
import MarkModal from "../modals/MarkModal";
import InfoModal from "../modals/InfoModal";
import CalendarModal from "../modals/CalendarModal";

const millisecondsInDay = 24 * 60 * 60 * 1000;

function useOvulationStatus(): string {
  const cycleLength = useAverageLengthOfCycle();
  const dayOfCycle = Number(useDayOfCycle());
  const { t } = useTranslation();

  if (!cycleLength || !dayOfCycle) {
    return "";
  }

  const lutealPhaseLength = 14;
  const ovulationDay = Number(cycleLength) - lutealPhaseLength;
  const diffDay = ovulationDay - dayOfCycle;
  if (diffDay === 0) {
    return t("homeTab.ovulation.today");
  } else if (diffDay < 0 && diffDay >= -2) {
    return t("homeTab.ovulation.possible");
  } else if (diffDay < 0) {
    return t("homeTab.ovulation.finished");
  } else if (diffDay === 1) {
    return t("homeTab.ovulation.tomorrow");
  } else if (diffDay < 5) {
    return `${t("homeTab.ovulation.in")} ${diffDay} ${t(
      "homeTab.ovulation.daysLess5",
    )}`;
  }
  return `${t("homeTab.ovulation.in")} ${diffDay} ${t(
    "homeTab.ovulation.days",
  )}`;
}

function usePregnancyChance() {
  const cycleLength = useAverageLengthOfCycle();
  const dayOfCycle = Number(useDayOfCycle());
  const { t } = useTranslation();

  if (!cycleLength || !dayOfCycle) {
    return "";
  }

  const lutealPhaseLength = 14;
  const ovulationDay = Number(cycleLength) - lutealPhaseLength;
  const diffDay = ovulationDay - dayOfCycle;

  if (diffDay <= 4 && diffDay >= -2) {
    return t("homeTab.pregnancyChance.high");
  }
  return t("homeTab.pregnancyChance.low");
}

interface DaysBeforePeriod {
  title: string;
  days: string;
}

function useDaysBeforePeriod(): DaysBeforePeriod {
  const startDate = useLastStartDate();
  const cycleLength = useAverageLengthOfCycle();
  const { t } = useTranslation();

  if (!startDate || !cycleLength) {
    return {
      title: t("homeTab.mainInfo.periodIn"),
      days: t("homeTab.mainInfo.noInfo"),
    };
  }

  const dateOfFinish = new Date(startDate);
  dateOfFinish.setDate(dateOfFinish.getDate() + Number(cycleLength));
  dateOfFinish.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dayBefore = Math.round(
    (Number(dateOfFinish) - Number(now)) / millisecondsInDay,
  );

  if (dayBefore > 1) {
    if (
      dayBefore < 5 ||
      (dayBefore > 20 && dayBefore % 10 > 0 && dayBefore % 10 < 5)
    ) {
      return {
        title: t("homeTab.mainInfo.periodIn"),
        days: `${dayBefore} ${t("homeTab.mainInfo.daysLess5")}`,
      };
    }
    return {
      title: t("homeTab.mainInfo.periodIn"),
      days: `${dayBefore} ${t("homeTab.mainInfo.days")}`,
    };
  }
  if (dayBefore === 1) {
    return {
      title: t("homeTab.mainInfo.periodIn"),
      days: `1 ${t("homeTab.mainInfo.days")}`,
    };
  }
  if (dayBefore === 0) {
    return {
      title: t("homeTab.mainInfo.period"),
      days: t("homeTab.mainInfo.today"),
    };
  }
  if (dayBefore === -1) {
    return {
      title: t("homeTab.mainInfo.delay"),
      days: `1 ${t("homeTab.mainInfo.day")}`,
    };
  }
  if (dayBefore > -5) {
    return {
      title: t("homeTab.mainInfo.delay"),
      days: `${dayBefore} ${t("homeTab.mainInfo.daysLess5")}`,
    };
  }
  return {
    title: t("homeTab.mainInfo.delay"),
    days: `${Math.abs(dayBefore)} ${t("homeTab.mainInfo.days")}`,
  };
}

const TabHome = () => {
  const [isInfoModal, setIsInfoModal] = useState(false);
  const [isWelcomeModal, setIsWelcomeModal] = useState(false);
  const [isCalendarModal, setIsCalendarModal] = useState(false);
  const [isMarkModal, setIsMarkModal] = useState(false);

  const router = useIonRouter();

  const dayOfCycle = useDayOfCycle();
  const ovulationStatus = useOvulationStatus();
  const pregnancyChance = usePregnancyChance();
  const daysBeforePeriod = useDaysBeforePeriod();

  const { t } = useTranslation();

  useEffect(() => {
    storage.getCycles.cycles().catch((err) => {
      console.error(`Can't get cycles ${(err as Error).message}`);
      setIsWelcomeModal(true);
    });
  }, []);

  useEffect(() => {
    const backButtonHandler = () => {
      if (isCalendarModal || isMarkModal || isInfoModal) {
        setIsCalendarModal(false);
        setIsMarkModal(false);
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
  }, [router, isInfoModal, isCalendarModal, isMarkModal]);

  const p_style = {
    fontSize: "10px" as const,
    color: "var(--ion-color-light)" as const,
  };

  const h_style = {
    fontWeight: "bold" as const,
    color: "var(--ion-color-light)" as const,
  };

  return (
    <IonPage>
      <IonContent
        color="basic"
        fullscreen
      >
        <IonCard
          class="large-card"
          color="light"
        >
          <IonCardContent class="align-center">
            <Welcome
              isOpen={isWelcomeModal}
              setIsOpen={setIsWelcomeModal}
            />
            <IonRow>
              <IonCol>
                <CalendarModal
                  isOpen={isCalendarModal}
                  setIsOpen={setIsCalendarModal}
                />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonImg src={uterus} />
              </IonCol>
              <IonCol>
                <div>
                  <IonLabel style={{ textAlign: "center" }}>
                    <h2>{daysBeforePeriod.title}</h2>
                  </IonLabel>
                  <IonLabel
                    style={{ textAlign: "center" }}
                    color="dark-basic"
                  >
                    <h1 style={{ fontWeight: "bold" }}>
                      {daysBeforePeriod.days}
                    </h1>
                  </IonLabel>
                  <MarkModal
                    isOpen={isMarkModal}
                    setIsOpen={setIsMarkModal}
                  />
                </div>
              </IonCol>
            </IonRow>
            <IonCard color="basic">
              <IonCardContent>
                <IonItem
                  color="basic"
                  lines="full"
                >
                  <IonLabel>
                    <p style={p_style}>{t("homeTab.curCycleDay")}</p>
                    <h1 style={h_style}>{dayOfCycle}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem
                  color="basic"
                  lines="full"
                >
                  <IonLabel>
                    <p style={p_style}>{t("homeTab.ovulation.title")}</p>
                    <h1 style={h_style}>{ovulationStatus}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem
                  color="basic"
                  lines="none"
                >
                  <IonLabel>
                    <p style={p_style}>{t("homeTab.pregnancyChance.title")}</p>
                    <h1 style={h_style}>{pregnancyChance}</h1>
                  </IonLabel>
                </IonItem>
              </IonCardContent>
            </IonCard>
            <InfoModal
              isOpen={isInfoModal}
              setIsOpen={setIsInfoModal}
            />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default TabHome;
