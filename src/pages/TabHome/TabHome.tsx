import { useContext, useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonLabel,
  useIonRouter,
  IonButton,
  IonCol,
  IonIcon,
  IonModal,
  IonToolbar,
  IonButtons,
} from "@ionic/react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useTranslation } from "react-i18next";

import { CyclesContext, ThemeContext } from "../../state/Context";
import { storage } from "../../data/Storage";
import { configuration } from "../../data/AppConfiguration";

import { WelcomeModal } from "../../modals/WelcomeModal";
import { InfoModal } from "../../modals/InfoModal";

import {
  getDaysBeforePeriod,
  getNewCyclesHistory,
  getPeriodDatesWithNewElement,
  getPregnancyChance,
  isPeriodToday,
} from "../../state/CalculationLogics";
import { chevronForwardOutline } from "ionicons/icons";
import { EditCalendar, ViewCalendar } from "./Calendar";

interface InfoButtonProps {
  setIsInfoModal: (newIsOpen: boolean) => void;
}

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

const InfoButton = (props: InfoButtonProps) => {
  const { t } = useTranslation();

  const cycles = useContext(CyclesContext).cycles;
  const theme = useContext(ThemeContext).theme;

  const pregnancyChance = getPregnancyChance(cycles);
  if (cycles.length === 0) {
    return <p style={{ marginBottom: "20px", height: "22px" }}></p>;
  }
  return (
    <IonLabel
      onClick={() => props.setIsInfoModal(true)}
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

export const TabHome = () => {
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
          <WelcomeModal
            isOpen={isWelcomeModal}
            setIsOpen={setIsWelcomeModal}
          />
          <div id="context-size">
            <div style={{ marginTop: "30px", marginBottom: "30px" }}>
              <IonLabel>
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
              <IonLabel>
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
