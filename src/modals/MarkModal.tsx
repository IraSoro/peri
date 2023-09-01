import { useContext, useRef } from "react";
import {
  IonButton,
  IonModal,
  IonDatetime,
  IonContent,
  IonItem,
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
    <>
      <IonButton
        class="mark-button"
        color="dark-basic"
        onClick={() => props.setIsOpen(true)}
      >
        {t("mark")}
      </IonButton>
      <IonModal
        class="mark-modal"
        isOpen={props.isOpen}
        backdropDismiss={false}
      >
        <IonContent
          className="ion-padding"
          color="basic"
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
          <IonItem
            color="basic"
            lines="none"
          />
          <IonButton
            class="edit-buttons"
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
            class="edit-buttons"
            color="dark-basic"
            fill="outline"
            onClick={() => {
              datetimeRef.current?.cancel().catch((err) => console.error(err));
              props.setIsOpen(false);
            }}
          >
            {t("cancel")}
          </IonButton>
        </IonContent>
      </IonModal>
    </>
  );
};

export default MarkModal;
