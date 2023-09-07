import { useContext } from "react";
import {
  IonContent,
  IonPage,
  IonLabel,
  IonProgressBar,
  IonItem,
  IonList,
  IonCol,
} from "@ionic/react";
import "./TabDetails.css";

import {
  getAverageLengthOfCycle,
  getAverageLengthOfPeriod,
  getDayOfCycle,
  getLastStartDate,
} from "../state/CalculationLogics";
import { useTranslation } from "react-i18next";
import { CyclesContext } from "../state/Context";

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
      dates: t("date"),
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
  const dates = `${dateStart.toLocaleDateString()} - ${dateFinish.toLocaleDateString()}`;

  return {
    lengthOfCycleNumber: cycleLenNumber,
    lengthOfCycleString: cycleLenString,
    lengthOfPeriod: periodLenNumber,
    dates: dates,
  };
}

const CurrentCycle = () => {
  const title = useTitleLastCycle();
  const progressBarBuffer = useProgressBarBuffer();

  const cycles = useContext(CyclesContext).cycles;
  const startDate = getLastStartDate(cycles);
  const lengthOfPeriod = getAverageLengthOfPeriod(cycles);

  const { t } = useTranslation();

  return (
    <IonItem
      class="transparent-center"
      lines="none"
    >
      <IonLabel position="stacked">
        {title ? (
          <h2>{`${t("Current cycle")}: ${title}`}</h2>
        ) : (
          <h2>{t("Current cycle")}</h2>
        )}
      </IonLabel>
      <IonLabel position="stacked">
        {startDate ? (
          <p>{`${t("Started date")} ${new Date(
            startDate,
          ).toLocaleDateString()}`}</p>
        ) : (
          <p>{t("Started date")}</p>
        )}
      </IonLabel>
      <IonLabel position="stacked">
        <IonProgressBar
          class="current-progress"
          value={(lengthOfPeriod / 100) * 3}
          buffer={(progressBarBuffer / 100) * 3}
        ></IonProgressBar>
      </IonLabel>
    </IonItem>
  );
};

interface IdxProps {
  idx: number;
}

const ItemProgress = (props: IdxProps) => {
  const info = useInfoForOneCycle(props.idx);

  return (
    <IonItem
      class="transparent-center"
      lines="none"
    >
      <IonLabel position="stacked">
        <h2>{info.lengthOfCycleString}</h2>
      </IonLabel>
      <IonLabel position="stacked">
        <p>{info.dates}</p>
      </IonLabel>
      <IonLabel position="stacked">
        <IonProgressBar
          value={(info.lengthOfPeriod / 100) * 3}
          buffer={(info.lengthOfCycleNumber / 100) * 3}
        ></IonProgressBar>
      </IonLabel>
    </IonItem>
  );
};

const ListProgress = () => {
  const numbers = [1, 2, 3, 4, 5];
  const list = numbers.map((idx) => (
    <ItemProgress
      key={idx}
      idx={idx}
    />
  ));

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

  return (
    <IonPage style={{ backgroundColor: "var(--ion-color-background)" }}>
      <div id="wide-screen">
        <IonContent
          className="ion-padding"
          color="transparent-basic"
        >
          <div id="context-size">
            <IonCol>
              <div id="average-length">
                <IonCol>
                  <div id="inline-block">
                    <IonLabel>
                      <p style={p_style}>{t("Period length")}</p>
                      <p style={h_style}>{lengthOfPeriod}</p>
                    </IonLabel>
                  </div>
                  <div id="vertical-line" />
                  <div id="inline-block">
                    <IonLabel style={{ marginBottom: "10px" }}>
                      <p style={p_style}>{t("Cycle length")}</p>
                      <p style={h_style}>{lengthOfCycle}</p>
                    </IonLabel>
                  </div>
                </IonCol>
              </div>
            </IonCol>
            <IonList class="transparent-center">
              <CurrentCycle />
              <ListProgress />
            </IonList>
          </div>
        </IonContent>
      </div>
    </IonPage>
  );
};

export default TabDetails;
