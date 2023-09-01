import { useContext, useRef } from "react";
import {
  IonButton,
  IonContent,
  IonLabel,
  IonModal,
  useIonAlert,
  IonCol,
  IonDatetime,
} from "@ionic/react";
import "./WelcomeModal.css";

import type { Cycle } from "../data/ClassCycle";
import { useTranslation } from "react-i18next";

import { CyclesContext } from "../state/Context";

interface PropsWelcomeModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;

  isLanguageModal: boolean;
  setIsLanguageModal: (newIsOpen: boolean) => void;
}

const Welcome = (props: PropsWelcomeModal) => {
  const refDatetime = useRef<null | HTMLIonDatetimeElement>(null);
  const [confirmAlert] = useIonAlert();
  const cycle: Cycle[] = [
    {
      cycleLength: 28,
      periodLength: 0,
      startDate: "",
    },
  ];

  const updateCycles = useContext(CyclesContext).updateCycles;

  const { t } = useTranslation();

  return (
    <IonModal
      isOpen={props.isOpen}
      backdropDismiss={false}
    >
      <IonContent
        className="ion-padding"
        color="basic"
      >
        <div
          style={{ marginTop: "20px", textAlign: "center", fontWeight: "bold" }}
        >
          <IonLabel
            color="dark-basic"
            style={{ fontSize: "30px", marginTop: "20px" }}
          >
            {t("Welcome to Peri")}
          </IonLabel>
        </div>
        <div style={{ marginTop: "20px", marginBottom: "25px" }}>
          <IonLabel style={{ textAlign: "center" }}>
            <p style={{ fontSize: "15px", color: "var(--ion-color-dark)" }}>
              {t("Mark the days of your")}
            </p>
            <p
              style={{
                fontSize: "15px",
                color: "var(--ion-color-dark)",
                fontWeight: "600",
              }}
            >
              {t("last period")}
            </p>
          </IonLabel>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <IonDatetime
            style={{ borderRadius: "20px" }}
            ref={refDatetime}
            color="basic"
            presentation="date"
            locale={t("locale")}
            size="cover"
            multiple
            firstDayOfWeek={1}
          />
        </div>
        <IonCol>
          <IonButton
            class="welcome"
            color="dark-basic"
            onClick={() => {
              if (refDatetime.current?.value) {
                const days = [refDatetime.current.value].flat().sort();
                cycle[0].periodLength = days.length;
                cycle[0].startDate = days[0];

                updateCycles(cycle);
                props.setIsOpen(false);
              } else {
                confirmAlert({
                  header: `${t("Continue")}?`,
                  cssClass: "header-color",
                  message: t("Forecast will not be generated."),
                  buttons: [
                    {
                      text: t("cancel"),
                      role: "cancel",
                    },
                    {
                      text: "OK",
                      role: "confirm",
                      handler: () => {
                        props.setIsOpen(false);
                      },
                    },
                  ],
                }).catch((err) => console.error(err));
              }
            }}
          >
            {t("Continue")}
          </IonButton>
        </IonCol>
      </IonContent>
    </IonModal>
  );
};

export default Welcome;
