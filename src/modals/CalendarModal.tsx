import { useContext } from "react";
import {
  IonButton,
  IonModal,
  IonButtons,
  IonDatetime,
  IonIcon,
} from "@ionic/react";
import "./CalendarModal.css";

import { calendarClear } from "ionicons/icons";

import { useTranslation } from "react-i18next";
import { CyclesContext } from "../state/Context";

import {
  isPastPeriodsDays,
  isForecastPeriodDays,
} from "../state/CalculationLogics";

interface PropsCalendarModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const CalendarModal = (props: PropsCalendarModal) => {
  const { t } = useTranslation();
  const cycles = useContext(CyclesContext).cycles;

  return (
    <>
      <IonButton
        class="calendar-button"
        fill="outline"
        onClick={() => props.setIsOpen(true)}
      >
        <IonIcon
          slot="end"
          icon={calendarClear}
        ></IonIcon>
      </IonButton>
      <IonModal
        id="calendar-modal"
        isOpen={props.isOpen}
        backdropDismiss={false}
      >
        <IonDatetime
          color="basic"
          presentation="date"
          locale={t("locale")}
          size="cover"
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
        >
          <IonButtons slot="buttons">
            <IonButton
              color="basic"
              onClick={() => {
                props.setIsOpen(false);
              }}
            >
              Ok
            </IonButton>
          </IonButtons>
        </IonDatetime>
      </IonModal>
    </>
  );
};

export default CalendarModal;
