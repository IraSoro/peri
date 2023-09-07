import { useContext } from "react";
import {
  IonContent,
  IonPage,
  IonLabel,
  IonProgressBar,
  IonList,
  IonCol,
  IonButton,
} from "@ionic/react";
import "./TabDetails.css";

import {
  getAverageLengthOfCycle,
  getAverageLengthOfPeriod,
  getDayOfCycle,
  getLastStartDate,
} from "../state/CalculationLogics";
import { CyclesContext } from "../state/Context";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import MarkModal from "../modals/MarkModal";

function useTitleLastCycle() {
  const cycles = useContext(CyclesContext).cycles;
  const dayOfCycle = getDayOfCycle(cycles);
  const { t } = useTranslation();

  if (!dayOfCycle) {
    return "";
  }

  return `${dayOfCycle} ${t("Days_interval", {
    postProcess: "interval",
    count: 1, // NOTE: to indicate which day is in the account, you need to write the day as if in the singular
  })}`;
}

function useProgressBarBuffer() {
  const cycles = useContext(CyclesContext).cycles;
  const dayOfCycle = getDayOfCycle(cycles);
  const defaultLengthOfCycle = 28;

  if (!dayOfCycle) {
    return defaultLengthOfCycle;
  }
  return Number(dayOfCycle);
}

interface InfoOneCycle {
  lengthOfCycleString: string;
  lengthOfCycleNumber: number;
  lengthOfPeriod: number;
  dates: string;
}

export function useInfoForOneCycle(idx: number): InfoOneCycle {
  const cycles = useContext(CyclesContext).cycles;
  const { t } = useTranslation();

  if (!cycles || cycles.length <= idx) {
    const defaultLengthOfCycle = 28;

    return {
      lengthOfCycleNumber: defaultLengthOfCycle,
      lengthOfCycleString: t("Cycle length"),
      lengthOfPeriod: 0,
      dates: "",
    };
  }
  const cycleLenNumber = cycles[idx].cycleLength;
  const cycleLenString = `${cycleLenNumber} ${t("Days_interval", {
    postProcess: "interval",
    count: cycleLenNumber,
  })}`;

  const periodLenNumber: number = cycles[idx].periodLength;

  const dateStart: Date = new Date(cycles[idx].startDate);
  const dateFinish: Date = new Date(cycles[idx].startDate);
  dateFinish.setDate(dateFinish.getDate() + cycleLenNumber - 1);
  let dates = `${format(dateStart, "MMM dd")} - ${format(
    dateFinish,
    "MMM dd",
  )}`;
  if (t("locale") === "ru") {
    dates = `${format(dateStart, "dd MMMM", {
      locale: ru,
    })} - ${format(dateFinish, "dd MMMM", {
      locale: ru,
    })}`;
  }

  return {
    lengthOfCycleNumber: cycleLenNumber,
    lengthOfCycleString: cycleLenString,
    lengthOfPeriod: periodLenNumber,
    dates: dates,
  };
}

const lenCycleStyle = {
  fontSize: "13px" as const,
  color: "var(--ion-color-black)" as const,
  textAlign: "left" as const,
};

const datesStyle = {
  fontSize: "11px" as const,
  color: "var(--ion-color-medium)" as const,
  textAlign: "left" as const,
};

const CurrentCycle = () => {
  const { t } = useTranslation();
  const title = useTitleLastCycle();
  const progressBarBuffer = useProgressBarBuffer();

  const cycles = useContext(CyclesContext).cycles;
  const startDate = getLastStartDate(cycles);
  const lengthOfPeriod = getAverageLengthOfPeriod(cycles);

  return (
    <div id="progress-block">
      <div style={{ marginLeft: "15px" }}>
        <IonLabel>
          <p style={lenCycleStyle}>{title}</p>
        </IonLabel>
        <IonProgressBar
          class="current-progress"
          style={{ marginTop: "5px", marginBottom: "5px" }}
          value={(lengthOfPeriod / 100) * 3}
          buffer={(progressBarBuffer / 100) * 3}
        />
        <IonLabel>
          {t("locale") === "ru" ? (
            <p style={datesStyle}>{`${format(new Date(startDate), "dd MMMM", {
              locale: ru,
            })} - `}</p>
          ) : (
            <p style={datesStyle}>{`${format(
              new Date(startDate),
              "MMM dd",
            )} - `}</p>
          )}
        </IonLabel>
      </div>
    </div>
  );
};

interface IdxProps {
  idx: number;
}

const ListProgress = () => {
  const cycles = useContext(CyclesContext).cycles;

  const ItemProgress = (props: IdxProps) => {
    const info = useInfoForOneCycle(props.idx + 1);

    return (
      <div
        id="progress-block"
        style={{ marginTop: "15px" }}
      >
        <div style={{ marginLeft: "15px" }}>
          <IonLabel>
            <p style={lenCycleStyle}>{info.lengthOfCycleString}</p>
          </IonLabel>
          <IonProgressBar
            style={{ marginTop: "5px", marginBottom: "5px" }}
            value={(info.lengthOfPeriod / 100) * 3}
            buffer={(info.lengthOfCycleNumber / 100) * 3}
          />
          <IonLabel>
            <p style={datesStyle}>{info.dates}</p>
          </IonLabel>
        </div>
      </div>
    );
  };

  const list = cycles
    .filter((_value, idx) => {
      return idx > 0;
    })
    .map((_item, idx) => {
      return (
        <ItemProgress
          key={idx}
          idx={idx}
        />
      );
    });

  return <>{list}</>;
};

interface DetailsProps {
  isMarkModal: boolean;
  setIsMarkModal: (newIsOpen: boolean) => void;
}

const TabDetails = (props: DetailsProps) => {
  const { t } = useTranslation();
  const cycles = useContext(CyclesContext).cycles;

  const averageLengthOfCycle = getAverageLengthOfCycle(cycles);
  const averageLengthOfPeriod = getAverageLengthOfPeriod(cycles);

  const lengthOfCycle = `${averageLengthOfCycle} ${t("Days_interval", {
    postProcess: "interval",
    count: averageLengthOfCycle,
  })}`;

  const lengthOfPeriod = `${averageLengthOfPeriod} ${t("Days_interval", {
    postProcess: "interval",
    count: averageLengthOfPeriod,
  })}`;

  const p_style = {
    fontSize: "13px" as const,
    color: "var(--ion-color-light)" as const,
    textAlign: "left" as const,
    marginBottom: "5px" as const,
  };

  const h_style = {
    fontSize: "20px" as const,
    color: "var(--ion-color-light)" as const,
    textAlign: "left" as const,
  };

  const History = () => {
    if (cycles.length === 0) {
      return (
        <IonList>
          <div id="progress-block">
            <p style={{ fontSize: "13px" }}>
              {t("You haven't marked any periods yet")}
            </p>
          </div>
          <div style={{ marginTop: "40px" }}>
            <IonButton
              class="mark-button"
              color="dark-basic"
              onClick={() => props.setIsMarkModal(true)}
            >
              {t("mark")}
            </IonButton>
            <MarkModal
              isOpen={props.isMarkModal}
              setIsOpen={props.setIsMarkModal}
            />
          </div>
        </IonList>
      );
    } else if (cycles.length === 1) {
      return (
        <IonList>
          <CurrentCycle />
        </IonList>
      );
    } else {
      return (
        <IonList>
          <CurrentCycle />
          <ListProgress />
        </IonList>
      );
    }
  };

  return (
    <IonPage style={{ backgroundColor: "var(--ion-color-background)" }}>
      <div id="wide-screen">
        <IonContent
          className="ion-padding"
          color="transparent-basic"
        >
          <div id="context-size">
            <IonCol>
              <div
                id="average-length"
                style={{ marginBottom: "15px" }}
              >
                <IonCol>
                  <div id="inline-block">
                    <IonLabel style={{ marginBottom: "10px" }}>
                      <p style={p_style}>{t("Cycle length")}</p>
                      {averageLengthOfCycle ? (
                        <p style={h_style}>{lengthOfCycle}</p>
                      ) : (
                        <p style={h_style}>---</p>
                      )}
                    </IonLabel>
                  </div>
                  <div id="vertical-line" />
                  <div id="inline-block">
                    <IonLabel>
                      <p style={p_style}>{t("Period length")}</p>
                      {averageLengthOfPeriod ? (
                        <p style={h_style}>{lengthOfPeriod}</p>
                      ) : (
                        <p style={h_style}>---</p>
                      )}
                    </IonLabel>
                  </div>
                </IonCol>
              </div>
            </IonCol>
            <IonCol>
              <History />
            </IonCol>
          </div>
        </IonContent>
      </div>
    </IonPage>
  );
};

export default TabDetails;
