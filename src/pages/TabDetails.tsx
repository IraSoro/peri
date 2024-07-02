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
import { addDays, startOfDay } from "date-fns";

import {
  getAverageLengthOfCycle,
  getAverageLengthOfPeriod,
  getDayOfCycle,
  getLastStartDate,
} from "../state/CalculationLogics";
import { CyclesContext, ThemeContext } from "../state/Context";
import { Cycle } from "../data/ClassCycle";
import { format } from "../utils/datetime";

import "./TabDetails.css";

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
  const cycleLenString = `${cycleLenNumber} ${t("Days", {
    postProcess: "interval",
    count: cycleLenNumber,
  })}`;

  const periodLenNumber: number = cycles[idx].periodLength;

  const startDate = startOfDay(new Date(cycles[idx].startDate));
  const endDate = addDays(startDate, cycleLenNumber - 1);
  const dates = `${format(startDate, "MMMM d")} - ${format(endDate, "MMMM d")}`;

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

function setProgressBar(value: number, maxLength: number) {
  return (value / maxLength) * 0.95;
}

const CurrentCycle = () => {
  const cycles = useContext(CyclesContext).cycles;
  const theme = useContext(ThemeContext).theme;

  const { t } = useTranslation();
  const dayOfCycle = getDayOfCycle(cycles);
  const title = `${dayOfCycle} ${t("Days", {
    postProcess: "interval",
    count: 1, // NOTE: to indicate which day is in the account, you need to write the day as if in the singular
  })}`;

  const startDate = new Date(getLastStartDate(cycles));
  const lengthOfPeriod = cycles[0].periodLength ?? 0;

  const maxLength = cycles.reduce((max: number, item) => {
    return Math.max(max, item.cycleLength);
  }, dayOfCycle);

  return (
    <div style={{ marginLeft: "15px" }}>
      <IonLabel>
        <p style={lenCycleStyle}>{title}</p>
      </IonLabel>
      <IonProgressBar
        className={`current-progress-${theme}`}
        style={progressBarStyle}
        value={setProgressBar(
          lengthOfPeriod > dayOfCycle ? dayOfCycle : lengthOfPeriod,
          maxLength,
        )}
        buffer={setProgressBar(dayOfCycle, maxLength)}
      />
      <IonLabel>
        <p style={datesStyle}>{format(startDate, "MMMM d")}</p>
      </IonLabel>
    </div>
  );
};

interface IdxProps {
  idx: number;
}

const ListProgress = () => {
  const cycles = useContext(CyclesContext).cycles;
  const theme = useContext(ThemeContext).theme;
  const dayOfCycle = getDayOfCycle(cycles);

  const maxLength = cycles.reduce((max: number, item) => {
    return Math.max(max, item.cycleLength);
  }, dayOfCycle);

  const ItemProgress = (props: IdxProps) => {
    const info = useInfoForOneCycle(props.idx + 1);

    return (
      <div style={{ marginTop: "15px" }}>
        <div style={{ marginLeft: "15px" }}>
          <IonLabel>
            <p style={lenCycleStyle}>{info.lengthOfCycleString}</p>
          </IonLabel>
          <IonProgressBar
            className={theme}
            style={progressBarStyle}
            value={setProgressBar(info.lengthOfPeriod, maxLength)}
            buffer={setProgressBar(info.lengthOfCycleNumber, maxLength)}
          />
          <IonLabel>
            <p style={datesStyle}>{info.dates}</p>
          </IonLabel>
        </div>
      </div>
    );
  };

  const list = cycles
    // NOTE: 6 is the number of cycles we display in details. We store a maximum of 7 cycles (in case the last cycle is accidentally deleted)
    .slice(1, 6)
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

interface AverageValuesProps {
  cycles: Cycle[];
}

const AverageValues = ({ cycles }: AverageValuesProps) => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext).theme;

  const averageLengthOfCycle = getAverageLengthOfCycle(cycles);
  const averageLengthOfPeriod = getAverageLengthOfPeriod(cycles);

  const lengthOfCycle = `${averageLengthOfCycle} ${t("Days", {
    postProcess: "interval",
    count: averageLengthOfCycle,
  })}`;

  const lengthOfPeriod = `${averageLengthOfPeriod} ${t("Days", {
    postProcess: "interval",
    count: averageLengthOfPeriod,
  })}`;

  const p_style = {
    fontSize: "12px" as const,
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
    <div
      style={{
        marginBottom: "15px",
        borderRadius: "15px",
        height: "90px",
        background: `var(--ion-color-less-dark-${theme})`,
      }}
    >
      <IonLabel
        className="average-values-title"
        style={{
          fontSize: "17px",
          color: "var(--ion-color-light)",
        }}
      >
        Average values
      </IonLabel>
      <IonCol>
        <div id="inline-block">
          <IonLabel className="average-value">
            <p style={h_style}>
              {averageLengthOfCycle && cycles.length > 1
                ? lengthOfCycle
                : "---"}
            </p>
            <p style={p_style}>{t("Cycle")}</p>
          </IonLabel>
        </div>
        <div id="vertical-line" />
        <div id="inline-block">
          <IonLabel className="average-value">
            <p style={h_style}>
              {averageLengthOfPeriod ? lengthOfPeriod : "---"}
            </p>
            <p style={p_style}>{t("Menstruation")}</p>
          </IonLabel>
        </div>
      </IonCol>
    </div>
  );
};

const TabDetails = () => {
  const { t } = useTranslation();
  const cycles = useContext(CyclesContext).cycles;
  const theme = useContext(ThemeContext).theme;

  return (
    <IonPage
      style={{ backgroundColor: `var(--ion-color-background-${theme})` }}
    >
      <div
        id="wide-screen"
        className={theme}
      >
        <IonContent
          className="ion-padding"
          color={`transparent-${theme}`}
        >
          <div>
            <IonCol>
              <AverageValues cycles={cycles} />
            </IonCol>
            <IonCol>
              <div
                id="progress-block"
                style={{ background: `var(--ion-color-calendar-${theme})` }}
              >
                {cycles.length > 0 ? (
                  <IonList>
                    <CurrentCycle />
                    {cycles.length > 1 && <ListProgress />}
                  </IonList>
                ) : (
                  <div id="progress-block">
                    <p style={{ fontSize: "13px" }}>
                      {t("You haven't marked any periods yet")}
                    </p>
                  </div>
                )}
              </div>
            </IonCol>
          </div>
        </IonContent>
      </div>
    </IonPage>
  );
};

export default TabDetails;
