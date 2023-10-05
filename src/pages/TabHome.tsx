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
} from "@ionic/react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useTranslation } from "react-i18next";
import { CyclesContext } from "../state/Context";

import { storage } from "../data/Storage";

import Welcome from "../modals/WelcomeModal";
import InfoModal from "../modals/InfoModal";

import {
  getPregnancyChance,
  getDaysBeforePeriod,
  isForecastPeriodDays,
  getNewCyclesHistory,
  getLastPeriodDays,
  getActiveDates,
  getPastFuturePeriodDays,
} from "../state/CalculationLogics";

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

interface HomeProps {
  isLanguageModal: boolean;
  setIsLanguageModal: (newIsOpen: boolean) => void;
  isEditModal: boolean;
  setIsEditModal: (newIsOpen: boolean) => void;
}

const TabHome = (props: HomeProps) => {
  const [isInfoModal, setIsInfoModal] = useState(false);
  const [isWelcomeModal, setIsWelcomeModal] = useState(false);

  const router = useIonRouter();

  useEffect(() => {
    storage.get.cycles().catch((err) => {
      console.error(`Can't get cycles ${(err as Error).message}`);
      setIsWelcomeModal(true);
    });
  }, []);

  useEffect(() => {
    const backButtonHandler = () => {
      if (isInfoModal || props.isLanguageModal || props.isEditModal) {
        setIsInfoModal(false);
        props.setIsLanguageModal(false);
        props.setIsEditModal(false);
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
  const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);
  const { cycles, updateCycles } = useContext(CyclesContext);

  useEffect(() => {
    if (!datetimeRef.current) return;
    const lastPeriodDays = getLastPeriodDays(cycles);
    if (!lastPeriodDays.length) {
      return;
    }
    datetimeRef.current.value = getLastPeriodDays(cycles);
  }, [cycles]);

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
                <p style={{ fontSize: "40px", color: "var(--ion-color-dark)" }}>
                  {getDaysBeforePeriod(cycles).title}
                </p>
              </IonLabel>
            </div>
            <div>
              <IonLabel>
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "40px",
                    color: "var(--ion-color-dark-basic)",
                    marginBottom: "30px",
                  }}
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
                class="main"
                style={{ width: "200px" }}
                color="dark-basic"
                onClick={() => {
                  const newCycles = getNewCyclesHistory(
                    getPastFuturePeriodDays(cycles),
                  );
                  updateCycles(newCycles);
                }}
              >
                {t("mark period today")}
              </IonButton>
            </IonCol>
            <IonCol>
              <IonDatetime
                style={{ borderRadius: "20px" }}
                ref={datetimeRef}
                color="light-basic"
                presentation="date"
                locale={t("locale")}
                size="cover"
                multiple
                firstDayOfWeek={1}
                // isDateEnabled={(date: string) => {
                //   return getActiveDates(date, cycles);
                // }}
                highlightedDates={(isoString) => {
                  if (cycles.length === 0) {
                    return undefined;
                  }

                  const date = new Date(isoString);
                  if (isForecastPeriodDays(date, cycles)) {
                    return {
                      textColor: "var(--ion-color-dark)",
                      backgroundColor: "var(--ion-color-transparent-basic)",
                    };
                  }

                  return undefined;
                }}
              >
                <IonButtons slot="buttons">
                  <IonButton
                    color="primary"
                    onClick={() => {
                      datetimeRef.current
                        ?.confirm()
                        .catch((err) => console.error(err));
                      if (datetimeRef.current?.value) {
                        const newCycles = getNewCyclesHistory(
                          [datetimeRef.current.value].flat(),
                        );
                        updateCycles(newCycles);
                      }
                    }}
                  >
                    save
                  </IonButton>
                </IonButtons>
              </IonDatetime>
            </IonCol>
          </div>
        </IonContent>
      </div>
    </IonPage>
  );
};

export default TabHome;
