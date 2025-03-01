import { useContext } from "react";
import {
  IonContent,
  IonPage,
  IonList,
  IonCol,
  IonLabel,
  IonProgressBar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";

import { CyclesContext, ThemeContext } from "../../state/Context";

import "./TabDetails.css";
import {
  getAverageLengthOfCycle,
  getAverageLengthOfPeriod,
  getDayOfCycle,
  getLastStartDate,
} from "../../state/CalculationLogics";
import { Cycle } from "../../data/ClassCycle";
import { datesStyle, lenCycleStyle, progressBarStyle } from "./styles";
import { getNormalizedProgress } from "../../utils/progress-bar";
import { format } from "../../utils/datetime";
import { CycleList } from "./CycleList";

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

  return (
    <div
      id="general-block"
      style={{ background: `var(--ion-color-calendar-${theme})` }}
    >
      <IonCol>
        <div id="inline-block">
          <IonLabel className="average-value">
            <p className={`h_style-${theme}`}>
              {averageLengthOfCycle && cycles.length > 1
                ? lengthOfCycle
                : "---"}
            </p>
            <p className="p_style">{t("Cycle length")}</p>
          </IonLabel>
        </div>
        <div id={`vertical-line-${theme}`} />
        <div id="inline-block">
          <IonLabel className="average-value">
            <p className={`h_style-${theme}`}>
              {averageLengthOfPeriod ? lengthOfPeriod : "---"}
            </p>
            <p className="p_style">{t("Period length")}</p>
          </IonLabel>
        </div>
      </IonCol>
    </div>
  );
};

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
        value={getNormalizedProgress(
          lengthOfPeriod > dayOfCycle ? dayOfCycle : lengthOfPeriod,
          maxLength,
        )}
        buffer={getNormalizedProgress(dayOfCycle, maxLength)}
      />
      <IonLabel>
        <p style={datesStyle}>{format(startDate, "MMMM d")}</p>
      </IonLabel>
    </div>
  );
};

export const TabDetails = () => {
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
          <div id="width-details-screen">
            <AverageValues cycles={cycles} />
            <div
              id="progress-block"
              style={{ background: `var(--ion-color-calendar-${theme})` }}
            >
              {cycles.length > 0 ? (
                <IonList>
                  <CurrentCycle />
                  {cycles.length > 1 && <CycleList />}
                </IonList>
              ) : (
                <p className="no-periods">
                  {t("You haven't marked any periods yet")}
                </p>
              )}
            </div>
          </div>
        </IonContent>
      </div>
    </IonPage>
  );
};
