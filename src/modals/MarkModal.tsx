import { useContext, useRef } from "react";
import {
  IonButton,
  IonModal,
  IonDatetime,
  IonContent,
  IonLabel,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import "./MarkModal.css";

import { CyclesContext } from "../state/Context";
import {
  getMarkModalActiveDates,
  getPastFuturePeriodDays,
  getNewCyclesHistory,
} from "../state/CalculationLogics";

interface PropsMarkModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const MarkModal = (props: PropsMarkModal) => {
  const { t } = useTranslation();
  const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);
  const { cycles, updateCycles } = useContext(CyclesContext);

  return (
    <IonModal
      class="mark-modal"
      isOpen={props.isOpen}
      backdropDismiss={false}
    >
      <IonContent
        className="ion-padding"
        color="transparent-basic"
      >
        <div style={{ marginTop: "30px", marginBottom: "40px" }}>
          <IonLabel
            color="dark-basic"
            style={{ fontSize: "20px" }}
          >
            {t("Select date range")}
          </IonLabel>
        </div>
        <IonDatetime
          class="mark-modal"
          style={{ marginBottom: "40px" }}
          ref={datetimeRef}
          color="light-basic"
          presentation="date"
          locale={t("locale")}
          size="cover"
          multiple
          firstDayOfWeek={1}
          isDateEnabled={(date: string) => {
            return getMarkModalActiveDates(date, cycles);
          }}
          value={getPastFuturePeriodDays(cycles)}
        />
        <IonButton
          class="mark-modal-buttons"
          color="dark-basic"
          fill="solid"
          onClick={() => {
            if (datetimeRef.current?.value) {
              const newCycles = getNewCyclesHistory(
                [datetimeRef.current.value].flat(),
              );
              updateCycles(newCycles);
            }
            datetimeRef.current?.confirm().catch((err) => console.error(err));
            props.setIsOpen(false);
          }}
        >
          {t("save")}
        </IonButton>
        <IonButton
          class="mark-modal-buttons"
          color="dark-basic"
          fill="clear"
          onClick={() => {
            datetimeRef.current?.cancel().catch((err) => console.error(err));
            props.setIsOpen(false);
          }}
        >
          {t("cancel")}
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default MarkModal;
