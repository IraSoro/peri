import { useContext } from "react";
import {
  IonContent,
  IonPage,
  IonLabel,
  IonProgressBar,
  IonList,
  IonCol,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import "./TabDetails.css";

import {
  getAverageLengthOfCycle,
  getAverageLengthOfPeriod,
  getDayOfCycle,
  getLastStartDate,
  getFormattedDate,
} from "../state/CalculationLogics";
import { CyclesContext } from "../state/Context";

interface InfoOneCycle {
  lengthOfCycleString: string;
  lengthOfCycleNumber: number;
  lengthOfPeriod: number;
  dates: string;
}

function useInfoForOneCycle(idx: number): InfoOneCycle {
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
  const dates = `${getFormattedDate(
    dateStart,
    t("locale"),
  )} - ${getFormattedDate(dateFinish, t("locale"))}`;

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

const progressBarStyle = {
  marginTop: "5px" as const,
  marginBottom: "5px" as const,
};

function setBufferProgress(value: number) {
  return (value / 100) * 3;
}

function setValueProgress(lengthOfPeriod: number, dayOfCycle: number) {
  return dayOfCycle < lengthOfPeriod
    ? (dayOfCycle / 100) * 3
    : (lengthOfPeriod / 100) * 3;
}

const CurrentCycle = () => {
  const cycles = useContext(CyclesContext).cycles;
  const { t } = useTranslation();
  const dayOfCycle = getDayOfCycle(cycles);
  const title = `${dayOfCycle} ${t("Days_interval", {
    postProcess: "interval",
    count: 1, // NOTE: to indicate which day is in the account, you need to write the day as if in the singular
  })}`;

  const startDate = new Date(getLastStartDate(cycles));
  const lengthOfPeriod = getAverageLengthOfPeriod(cycles);

  return (
    <div id="progress-block">
      <div style={{ marginLeft: "15px" }}>
        <IonLabel>
          <p style={lenCycleStyle}>{title}</p>
        </IonLabel>
        <IonProgressBar
          class="current-progress"
          style={progressBarStyle}
          value={setValueProgress(lengthOfPeriod, dayOfCycle)}
          buffer={setBufferProgress(dayOfCycle)}
        />
        <IonLabel>
          <p style={datesStyle}>{getFormattedDate(startDate, t("locale"))}</p>
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
    const dayOfCycle = getDayOfCycle(cycles);

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
            style={progressBarStyle}
            value={setValueProgress(info.lengthOfPeriod, dayOfCycle)}
            buffer={setBufferProgress(info.lengthOfCycleNumber)}
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

const TabDetails = () => {
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
        <div id="progress-block">
          <p style={{ fontSize: "13px" }}>
            {t("You haven't marked any periods yet")}
          </p>
        </div>
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
