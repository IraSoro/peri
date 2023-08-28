import { useContext, useRef } from "react";
import {
  IonButton,
  IonModal,
  IonDatetime,
  IonContent,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import "./MarkModal.css";

import { CyclesContext } from "../state/Context";
import { useAverageLengthOfPeriod } from "../state/CycleInformationHooks";

interface PropsMarkModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const MarkModal = (props: PropsMarkModal) => {
  const { t } = useTranslation();
  const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);

  const { cycles, updateCycles } = useContext(CyclesContext);
  const lengthOfPeriod = useAverageLengthOfPeriod();

  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);

  const nextCycleFinish: Date = new Date();
  nextCycleFinish.setDate(nowDate.getDate() + lengthOfPeriod);
  nextCycleFinish.setHours(0, 0, 0, 0);

  function isPastPeriodDay(date: Date) {
    date.setHours(0, 0, 0, 0);

    return cycles.some((cycle) => {
      const startOfCycle = new Date(cycle.startDate);
      startOfCycle.setHours(0, 0, 0, 0);
      const endOfCycle = new Date(cycle.startDate);
      endOfCycle.setHours(0, 0, 0, 0);
      endOfCycle.setDate(endOfCycle.getDate() + cycle.periodLength);
      return date >= startOfCycle && date < endOfCycle;
    });
  }

  function nextPeriodDays() {
    const periodDates: string[] = [];
    if (cycles.length !== 0) {
      const endOfCurrentCycle = new Date(cycles[0].startDate);
      endOfCurrentCycle.setDate(
        endOfCurrentCycle.getDate() + cycles[0].periodLength,
      );
      endOfCurrentCycle.setHours(0, 0, 0, 0);
      if (endOfCurrentCycle >= nowDate) {
        return undefined;
      }
    }

    for (let day = 0; day < (lengthOfPeriod || 5); day++) {
      const periodDay = new Date(nowDate);
      periodDay.setHours(0, 0, 0, 0);
      periodDay.setDate(periodDay.getDate() + day);

      periodDates.push(format(periodDay, "yyyy-MM-dd"));
    }

    return periodDates;
  }

  const isActiveDates = (dateString: string) => {
    if (cycles.length === 0) {
      return true;
    }
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    const lastCycleFinish: Date = new Date(cycles[0].startDate);
    lastCycleFinish.setDate(lastCycleFinish.getDate() + cycles[0].periodLength);
    lastCycleFinish.setHours(0, 0, 0, 0);

    return date.getTime() > lastCycleFinish.getTime();
  };

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
            isDateEnabled={isActiveDates}
            value={nextPeriodDays()}
            highlightedDates={(isoString) => {
              if (cycles.length === 0) {
                return undefined;
              }

              const date = new Date(isoString);
              if (isPastPeriodDay(date)) {
                return {
                  textColor: "var(--ion-color-light)",
                  backgroundColor: "var(--ion-color-basic)",
                };
              }

              return undefined;
            }}
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
                const markPeriodDays = [datetimeRef.current.value]
                  .flat()
                  .sort();
                if (cycles.length > 0) {
                  const millisecondsInDay = 24 * 60 * 60 * 1000;

                  const startDate = new Date(cycles[0].startDate);
                  const finishDate = new Date(markPeriodDays[0]);

                  const diff = new Date(
                    finishDate.getTime() - startDate.getTime(),
                  );
                  cycles[0].cycleLength =
                    Math.ceil(diff.getTime() / millisecondsInDay) - 1;

                  cycles.unshift({
                    cycleLength: 0,
                    periodLength: markPeriodDays.length,
                    startDate: markPeriodDays[0],
                  });
                } else {
                  cycles.unshift({
                    cycleLength: 28,
                    periodLength: markPeriodDays.length,
                    startDate: markPeriodDays[0],
                  });
                }
              }

              Promise.all([updateCycles([...cycles])])
                .then(() => {
                  console.log("All new values are set, setIsOpen(false)");
                  datetimeRef.current
                    ?.confirm()
                    .catch((err) => console.error(err));
                  props.setIsOpen(false);
                })
                .catch((err) => console.error(err));
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
