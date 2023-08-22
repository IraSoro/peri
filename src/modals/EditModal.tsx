import { useContext, useRef } from "react";
import {
  IonButton,
  IonModal,
  IonDatetime,
  IonContent,
  IonItem,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import "./EditModal.css";

import { CyclesContext } from "../state/Context";
import { useAverageLengthOfCycle } from "../state/CycleInformationHooks";
import { getNewCyclesHistory } from "../state/CalculationLogics";

interface PropsEditModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const EditModal = (props: PropsEditModal) => {
  const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);
  const { t } = useTranslation();

  const { cycles, updateCycles } = useContext(CyclesContext);
  const averLengthOfCycle = useAverageLengthOfCycle();

  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);

  const isActiveDates = (dateString: string) => {
    if (cycles.length === 0) {
      return true;
    }
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    const lastCycleFinish: Date = new Date(cycles[0].startDate);
    lastCycleFinish.setDate(lastCycleFinish.getDate() + averLengthOfCycle);
    lastCycleFinish.setHours(0, 0, 0, 0);

    return (
      date.getTime() < lastCycleFinish.getTime() ||
      date.getTime() <= nowDate.getTime()
    );
  };

  function periodDays() {
    const value: string[] = [];

    for (const cycle of cycles) {
      const startOfCycle = new Date(cycle.startDate);
      startOfCycle.setHours(0, 0, 0, 0);

      for (let i = 0; i < cycle.periodLength; i++) {
        const newDate = new Date(startOfCycle);
        newDate.setDate(startOfCycle.getDate() + i);
        value.push(format(newDate, "yyyy-MM-dd"));
      }
    }
    return value;
  }

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
          value={periodDays()}
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
