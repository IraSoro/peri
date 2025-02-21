import { IonLabel, IonProgressBar } from "@ionic/react";
import { datesStyle, lenCycleStyle, progressBarStyle } from "../styles";
import { useContext } from "react";
import { CyclesContext, ThemeContext } from "../../../state/Context";
import { useTranslation } from "react-i18next";
import { addDays, startOfDay } from "date-fns";
import { format } from "../../../utils/datetime";
import { getNormalizedProgress } from "../../../utils/progress-bar";

interface CycleListItemProps {
  cycleIndex: number;
  maxLength: number;
}

const CycleListItem = (props: CycleListItemProps): JSX.Element => {
  const theme = useContext(ThemeContext).theme;
  const cycles = useContext(CyclesContext).cycles;
  const { t } = useTranslation();

  // default values
  let lengthOfCycleNumber = 28;
  let lengthOfCycleString = t("Cycle length");
  let lengthOfPeriod = 0;
  let dates = "";

  if (cycles && cycles.length > props.cycleIndex) {
    lengthOfCycleNumber = cycles[props.cycleIndex].cycleLength;
    lengthOfCycleString = `${lengthOfCycleNumber} ${t("Days", {
      postProcess: "interval",
      count: lengthOfCycleNumber,
    })}`;

    lengthOfPeriod = cycles[props.cycleIndex].periodLength;

    const startDate = startOfDay(new Date(cycles[props.cycleIndex].startDate));
    const endDate = addDays(startDate, lengthOfCycleNumber - 1);
    dates = `${format(startDate, "MMMM d")} - ${format(endDate, "MMMM d")}`;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <div style={{ marginLeft: "15px" }}>
        <IonLabel>
          <p style={lenCycleStyle}>{lengthOfCycleString}</p>
        </IonLabel>
        <IonProgressBar
          className={theme}
          style={progressBarStyle}
          value={getNormalizedProgress(lengthOfPeriod, props.maxLength)}
          buffer={getNormalizedProgress(lengthOfCycleNumber, props.maxLength)}
        />
        <IonLabel>
          <p style={datesStyle}>{dates}</p>
        </IonLabel>
      </div>
    </div>
  );
};

export default CycleListItem;
