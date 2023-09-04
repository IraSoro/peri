import { useContext, useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonLabel,
  useIonRouter,
  IonDatetime,
  IonButton,
  IonCol,
  IonIcon,
} from "@ionic/react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useTranslation } from "react-i18next";
import { CyclesContext } from "../state/Context";

import "./TabHome.css";

import { storage } from "../data/Storage";

import Welcome from "../modals/WelcomeModal";
import MarkModal from "../modals/MarkModal";
import InfoModal from "../modals/InfoModal";

import {
  getPregnancyChance,
  getDaysBeforePeriod,
  isPastPeriodsDays,
  isForecastPeriodDays,
} from "../state/CalculationLogics";

import { chevronForwardOutline } from "ionicons/icons";

interface HomeProps {
  isLanguageModal: boolean;
  setIsLanguageModal: (newIsOpen: boolean) => void;
  isEditModal: boolean;
  setIsEditModal: (newIsOpen: boolean) => void;
}

const TabHome = (props: HomeProps) => {
  const [isInfoModal, setIsInfoModal] = useState(false);
  const [isWelcomeModal, setIsWelcomeModal] = useState(false);
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
        isMarkModal ||
        isInfoModal ||
        props.isLanguageModal ||
        props.isEditModal
      ) {
        setIsMarkModal(false);
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
  }, [router, isInfoModal, isMarkModal, props]);

  const { t } = useTranslation();
  const cycles = useContext(CyclesContext).cycles;
  const daysBeforePeriod = getDaysBeforePeriod(cycles);
  const pregnancyChance = getPregnancyChance(cycles);

  return (
    <IonPage>
      <IonContent
        className="ion-padding"
        color="light"
      >
        <Welcome
          isOpen={isWelcomeModal}
          setIsOpen={setIsWelcomeModal}
          isLanguageModal={props.isLanguageModal}
          setIsLanguageModal={props.setIsLanguageModal}
        />
        <div id="block">
          <div style={{ marginTop: "30px", marginBottom: "30px" }}>
            <IonLabel>
              <p style={{ fontSize: "40px", color: "var(--ion-color-dark)" }}>
                {daysBeforePeriod.title}
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
                {daysBeforePeriod.days}
              </p>
            </IonLabel>
          </div>
          <IonLabel
            class="info-button"
            onClick={() => setIsInfoModal(true)}
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
          <InfoModal
            isOpen={isInfoModal}
            setIsOpen={setIsInfoModal}
          />
          <IonCol style={{ marginBottom: "20px" }}>
            <IonButton
              class="mark-button"
              color="dark-basic"
              onClick={() => setIsMarkModal(true)}
            >
              {t("mark")}
            </IonButton>
            <MarkModal
              isOpen={isMarkModal}
              setIsOpen={setIsMarkModal}
            />
          </IonCol>
          <IonDatetime
            class="calendar"
            color="basic"
            presentation="date"
            locale={t("locale")}
            size="fixed"
            firstDayOfWeek={1}
            highlightedDates={(isoString) => {
              if (cycles.length === 0) {
                return undefined;
              }

              const date = new Date(isoString);

              if (isPastPeriodsDays(date, cycles)) {
                return {
                  textColor: "var(--ion-color-dark-basic)",
                  backgroundColor: "var(--ion-color-light-basic)",
                };
              } else if (isForecastPeriodDays(date, cycles)) {
                return {
                  textColor: "var(--ion-color-dark)",
                  backgroundColor: "var(--ion-color-transparent-basic)",
                };
              }

              return undefined;
            }}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TabHome;
