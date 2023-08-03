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

import {
  getOvulationStatus,
  getPregnancyChance,
  getDaysBeforePeriod,
} from "../state/CalculationLogics";

const pStyle = {
  fontSize: "10px" as const,
  color: "var(--ion-color-light)" as const,
};

const hStyle = {
  fontWeight: "bold" as const,
  color: "var(--ion-color-light)" as const,
};

function DaysBeforePeriod() {
  const startDate = useLastStartDate();
  const cycleLength = useAverageLengthOfCycle();

  const daysBeforePeriod = getDaysBeforePeriod(cycleLength, startDate);

  return (
    <>
      <IonLabel style={{ textAlign: "center" }}>
        <h2>{daysBeforePeriod.title}</h2>
      </IonLabel>
      <IonLabel
        style={{ textAlign: "center" }}
        color="dark-basic"
      >
        <h1 style={{ fontWeight: "bold" }}>{daysBeforePeriod.days}</h1>
      </IonLabel>
    </>
  );
}

const DayOfCycle = () => {
  const dayOfCycle = useDayOfCycle();
  const { t } = useTranslation();

  return (
    <>
      <p style={pStyle}>{t("Current cycle day")}</p>
      <h1 style={hStyle}>{dayOfCycle}</h1>
    </>
  );
};

const OvulationStatus = () => {
  const cycleLength = useAverageLengthOfCycle();
  const dayOfCycle = Number(useDayOfCycle());

  const { t } = useTranslation();

  const ovulationStatus = getOvulationStatus(cycleLength, dayOfCycle);

  return (
    <>
      <p style={pStyle}>{t("Ovulation")}</p>
      <h1 style={hStyle}>{ovulationStatus}</h1>
    </>
  );
};

const PregnancyChance = () => {
  const cycleLength = useAverageLengthOfCycle();
  const dayOfCycle = Number(useDayOfCycle());

  const { t } = useTranslation();

  const pregnancyChance = getPregnancyChance(cycleLength, dayOfCycle);

  return (
    <>
      <p style={pStyle}>{t("Chance of getting pregnant")}</p>
      <h1 style={hStyle}>{pregnancyChance}</h1>
    </>
  );
};

interface HomeProps {
  isLanguageModal: boolean;
  setIsLanguageModal: (newIsOpen: boolean) => void;
}

const TabHome = (props: HomeProps) => {
  const [isInfoModal, setIsInfoModal] = useState(false);
  const [isWelcomeModal, setIsWelcomeModal] = useState(false);
  const [isCalendarModal, setIsCalendarModal] = useState(false);
  const [isMarkModal, setIsMarkModal] = useState(false);

  const router = useIonRouter();

  useEffect(() => {
    storage.get.cycles().catch((err) => {
      console.error(`Can't get cycles ${(err as Error).message}`);
      setIsWelcomeModal(true);
    });
  }, []);

  useEffect(() => {
    const backButtonHandler = () => {
      if (
        isCalendarModal ||
        isMarkModal ||
        isInfoModal ||
        props.isLanguageModal
      ) {
        setIsCalendarModal(false);
        setIsMarkModal(false);
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
  }, [router, isInfoModal, isCalendarModal, isMarkModal, props]);

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
              isLanguageModal={props.isLanguageModal}
              setIsLanguageModal={props.setIsLanguageModal}
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
                  <DaysBeforePeriod />
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
                    <DayOfCycle />
                  </IonLabel>
                </IonItem>
                <IonItem
                  color="basic"
                  lines="full"
                >
                  <IonLabel>
                    <OvulationStatus />
                  </IonLabel>
                </IonItem>
                <IonItem
                  color="basic"
                  lines="none"
                >
                  <IonLabel>
                    <PregnancyChance />
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
