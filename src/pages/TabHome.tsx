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

  if (!cycleLength || !dayOfCycle) {
    return "";
  }

  const lutealPhaseLength = 14;
  const ovulationDay = Number(cycleLength) - lutealPhaseLength;
  const diffDay = ovulationDay - dayOfCycle;
  if (diffDay === 0) {
    return "today";
  } else if (diffDay < 0 && diffDay >= -2) {
    return "possible";
  } else if (diffDay < 0) {
    return "finished";
  } else if (diffDay === 1) {
    return "tomorrow";
  }
  return "in " + diffDay + " days";
}

function usePregnancyChance() {
  const cycleLength = useAverageLengthOfCycle();
  const dayOfCycle = Number(useDayOfCycle());

  if (!cycleLength || !dayOfCycle) {
    return "";
  }

  const lutealPhaseLength = 14;
  const ovulationDay = Number(cycleLength) - lutealPhaseLength;
  const diffDay = ovulationDay - dayOfCycle;

  if (diffDay <= 4 && diffDay >= -2) {
    return "high";
  }
  return "low";
}

interface DaysBeforePeriod {
  title: string;
  days: string;
}

function useDaysBeforePeriod(): DaysBeforePeriod {
  const startDate = useLastStartDate();
  const cycleLength = useAverageLengthOfCycle();

  if (!startDate || !cycleLength) {
    return { title: "Period in", days: "no info" };
  }

  const dateOfFinish = new Date(startDate);
  dateOfFinish.setDate(dateOfFinish.getDate() + Number(cycleLength));
  dateOfFinish.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let dayBefore = Math.round(
    (Number(dateOfFinish) - Number(now)) / millisecondsInDay,
  );

  if (dayBefore > 1) {
    return { title: "Period in", days: dayBefore + " Days" };
  }
  if (dayBefore === 1) {
    return { title: "Period in", days: "1 Day" };
  }
  if (dayBefore === 0) {
    return { title: "Period", days: "Today" };
  }
  if (dayBefore === -1) {
    return { title: "Delay", days: "1 Day" };
  }
  return {
    title: "Delay",
    days: Math.abs(dayBefore) + " Days",
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

  useEffect(() => {
    storage.get.cycles().catch((err) => {
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
      App.exitApp?.();
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
                    <p style={p_style}>Current cycle day</p>
                    <h1 style={h_style}>{dayOfCycle}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem
                  color="basic"
                  lines="full"
                >
                  <IonLabel>
                    <p style={p_style}>Ovulation</p>
                    <h1 style={h_style}>{ovulationStatus}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem
                  color="basic"
                  lines="none"
                >
                  <IonLabel>
                    <p style={p_style}>Chance of getting pregnant</p>
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
