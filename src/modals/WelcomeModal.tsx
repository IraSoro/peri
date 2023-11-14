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
import { useTranslation } from "react-i18next";
import { parseISO, startOfDay, startOfToday } from "date-fns";

import { CyclesContext } from "../state/Context";
import { getNewCyclesHistory } from "../state/CalculationLogics";
import { getCurrentTranslation } from "../utils/translation";

interface PropsWelcomeModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;

  isLanguageModal: boolean;
  setIsLanguageModal: (newIsOpen: boolean) => void;
}

const Welcome = (props: PropsWelcomeModal) => {
  const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);
  const [confirmAlert] = useIonAlert();
  const updateCycles = useContext(CyclesContext).updateCycles;

  const { t } = useTranslation();

  return (
    <IonModal
      isOpen={props.isOpen}
      backdropDismiss={false}
    >
      <IonContent
        className="ion-padding"
        color="transparent-basic"
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
            ref={datetimeRef}
            presentation="date"
            locale={getCurrentTranslation()}
            size="cover"
            multiple
            firstDayOfWeek={1}
            isDateEnabled={(isoDateString) => {
              return startOfDay(parseISO(isoDateString)) <= startOfToday();
            }}
          />
        </div>
        <IonCol>
          <IonButton
            className="main"
            color="dark-basic"
            onClick={() => {
              if (datetimeRef.current?.value) {
                const periodDaysString = (
                  datetimeRef.current.value as string[]
                ).map((isoDateString) => {
                  return parseISO(isoDateString).toString();
                });

                updateCycles(getNewCyclesHistory(periodDaysString));
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
