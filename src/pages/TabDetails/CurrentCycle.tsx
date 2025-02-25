import { useContext } from "react";
import { CyclesContext, ThemeContext } from "../../state/Context";
import { useTranslation } from "react-i18next";
import { getDayOfCycle, getLastStartDate } from "../../state/CalculationLogics";
import { IonLabel, IonProgressBar } from "@ionic/react";
import { format } from "../../utils/datetime";
import { datesStyle, lenCycleStyle, progressBarStyle } from "./styles";
import { getNormalizedProgress } from "../../utils/progress-bar";

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

export default CurrentCycle;
