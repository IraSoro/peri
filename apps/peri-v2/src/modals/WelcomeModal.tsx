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
import {
  formatISO,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfToday,
  subMonths,
} from "date-fns";

import { CyclesContext, ThemeContext } from "../state/Context";
import { getNewCyclesHistory } from "../state/CalculationLogics";
import { getCurrentTranslation } from "../utils/translation";

interface PropsWelcomeModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const Welcome = (props: PropsWelcomeModal) => {
  const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);
  const [confirmAlert] = useIonAlert();
  const updateCycles = useContext(CyclesContext).updateCycles;
  const theme = useContext(ThemeContext).theme;

  const { t } = useTranslation();

  return (
    <IonModal
      isOpen={props.isOpen}
      backdropDismiss={false}
    >
      <IonContent
        className="ion-padding"
        color={`transparent-${theme}`}
      >
        <div
          style={{ marginTop: "20px", textAlign: "center", fontWeight: "bold" }}
        >
          <IonLabel
            color={`dark-${theme}`}
            style={{ fontSize: "30px", marginTop: "20px" }}
            mode="md"
          >
            {t("Welcome to Peri")}
          </IonLabel>
        </div>
        <div style={{ marginTop: "20px", marginBottom: "25px" }}>
          <IonLabel
            style={{ textAlign: "center" }}
            mode="md"
          >
            <p
              style={{
                fontSize: "15px",
                color: `var(--ion-color-text-${theme})`,
              }}
            >
              {t("Mark the days of your")}
            </p>
            <p
              style={{
                fontSize: "15px",
                color: `var(--ion-color-text-${theme})`,
                fontWeight: "600",
              }}
            >
              {t("last period")}
            </p>
          </IonLabel>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <IonDatetime
            className={`welcome-calendar-${theme}`}
            ref={datetimeRef}
            presentation="date"
            locale={getCurrentTranslation()}
            size="cover"
            mode="md"
            min={formatISO(startOfMonth(subMonths(startOfToday(), 6)))}
            max={formatISO(startOfToday())}
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
            mode="md"
            color={`dark-${theme}`}
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
                  cssClass: `${theme}`,
                  message: t("Forecast will not be generated."),
                  buttons: [
                    {
                      text: t("cancel"),
                      role: "cancel",
                      cssClass: `${theme}`,
                    },
                    {
                      text: "OK",
                      role: "confirm",
                      cssClass: `${theme}`,
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
