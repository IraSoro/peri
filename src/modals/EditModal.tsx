import { useContext, useRef } from "react";
import {
  IonButton,
  IonModal,
  IonDatetime,
  IonButtons,
  IonContent,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import "./EditModal.css";

import type { Cycle } from "../data/ClassCycle";
import { CyclesContext } from "../state/Context";

interface PropsEditModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const EditModal = (props: PropsEditModal) => {
  const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);
  const { t } = useTranslation();

  const { cycles, updateCycles } = useContext(CyclesContext);

  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);

  const isActiveDates = (dateString: string) => {
    if (cycles.length === 0) {
      return true;
    }
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    const lastCycleFinish: Date = new Date(cycles[0].startDate);
    lastCycleFinish.setDate(lastCycleFinish.getDate() + cycles[0].cycleLength);
    lastCycleFinish.setHours(0, 0, 0, 0);

    return date.getTime() < lastCycleFinish.getTime();
  };

  function getPeriodDays() {
    const value: string[] = [];

    for (const cycle of cycles) {
      const startOfCycle = new Date(cycle.startDate);
      startOfCycle.setHours(0, 0, 0, 0);
      value.push(format(startOfCycle, "yyyy-MM-dd"));

      for (let i = 1; i < cycle.periodLength; i++) {
        startOfCycle.setDate(startOfCycle.getDate() + 1);
        value.push(format(startOfCycle, "yyyy-MM-dd"));
      }
    }
    return value;
  }
  let periodDays = getPeriodDays();

  return (
    <IonModal
      isOpen={props.isOpen}
      backdropDismiss={false}
    >
      <IonContent
        className="ion-padding"
        color="basic"
      >
        <IonDatetime
          class="edit-modal"
          ref={datetimeRef}
          color="white-basic"
          presentation="date"
          locale={t("locale")}
          size="cover"
          multiple
          firstDayOfWeek={1}
          showDefaultButtons
          isDateEnabled={isActiveDates}
          value={periodDays}
          titleSelectedDatesFormatter={(selectedDates: string[]) => {
            console.log("len = ", selectedDates.length);
            periodDays = selectedDates;
            return "Editing";
          }}
        >
          <span slot="title"></span>
          <IonButtons slot="buttons">
            <IonButton
              color="basic"
              onClick={() => {
                datetimeRef.current
                  ?.cancel()
                  .catch((err) => console.error(err));
                props.setIsOpen(false);
                console.log("Cancel");
              }}
            >
              {t("cancel")}
            </IonButton>
            <IonButton
              color="basic"
              onClick={() => {
                if (periodDays.length > 0) {
                  const millisecondsInDay = 24 * 60 * 60 * 1000;
                  periodDays.sort();
                  const newCycles: Cycle[] = [
                    {
                      cycleLength: 28,
                      periodLength: 1,
                      startDate: periodDays[0],
                    },
                  ];
                  for (let i = 1; i < periodDays.length; i++) {
                    const date = new Date(periodDays[i]);
                    const prevDate = new Date(periodDays[i - 1]);
                    const diffInDays = Math.abs(
                      (date.getTime() - prevDate.getTime()) / millisecondsInDay,
                    );

                    if (diffInDays < 2) {
                      newCycles[0].periodLength++;
                    } else {
                      newCycles[0].cycleLength =
                        diffInDays + newCycles[0].periodLength - 1;
                      newCycles.unshift({
                        cycleLength: 0,
                        periodLength: 1,
                        startDate: periodDays[i],
                      });
                    }
                  }
                  updateCycles(newCycles);
                }
                datetimeRef.current
                  ?.confirm()
                  .catch((err) => console.error(err));
                props.setIsOpen(false);
                console.log("Save editing");
              }}
            >
              {t("save")}
            </IonButton>
          </IonButtons>
        </IonDatetime>
      </IonContent>
    </IonModal>
  );
};

export default EditModal;
