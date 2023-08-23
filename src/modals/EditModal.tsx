import { useContext, useRef } from "react";
import {
  IonButton,
  IonModal,
  IonDatetime,
  IonContent,
  IonItem,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import "./EditModal.css";

import { CyclesContext } from "../state/Context";
import { useAverageLengthOfCycle } from "../state/CycleInformationHooks";
import {
  getNewCyclesHistory,
  getActiveDates,
  getLastPeriodDays,
} from "../state/CalculationLogics";

interface PropsEditModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const EditModal = (props: PropsEditModal) => {
  const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);
  const { t } = useTranslation();

  const { cycles, updateCycles } = useContext(CyclesContext);
  const averLengthOfCycle = useAverageLengthOfCycle();

  const isActiveDates = (dateString: string) => {
    return getActiveDates(dateString, cycles, averLengthOfCycle);
  };

  return (
    <IonModal
      isOpen={props.isOpen}
      backdropDismiss={false}
    >
      <IonContent
        className="ion-padding"
        color="basic"
      >
        <IonItem
          color="basic"
          lines="none"
        />
        <IonDatetime
          class="edit-modal"
          ref={datetimeRef}
          color="white-basic"
          presentation="date"
          locale={t("locale")}
          size="cover"
          multiple
          firstDayOfWeek={1}
          value={getLastPeriodDays(cycles)}
          isDateEnabled={isActiveDates}
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
  );
};

export default EditModal;
