import { IonCol, IonLabel } from "@ionic/react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../../state/Context";
import { useContext } from "react";
import {
  getAverageLengthOfCycle,
  getAverageLengthOfPeriod,
} from "../../state/CalculationLogics";
import { Cycle } from "../../data/ClassCycle";

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

export default AverageValues;
