import { useContext } from "react";
import { CyclesContext, ThemeContext } from "../../state/Context";
import { getDayOfCycle } from "../../state/CalculationLogics";
import { useTranslation } from "react-i18next";
import { addDays, startOfDay } from "date-fns";
import { format } from "../../utils/datetime";
import { IonLabel, IonProgressBar } from "@ionic/react";
import { datesStyle, lenCycleStyle, progressBarStyle } from "./styles";
import { getNormalizedProgress } from "../../utils/progress-bar";
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

export const CycleList = () => {
  const cycles = useContext(CyclesContext).cycles;
  const dayOfCycle = getDayOfCycle(cycles);
  const maxLength = cycles.reduce((max: number, item) => {
    return Math.max(max, item.cycleLength);
  }, dayOfCycle);

  const list = cycles
    // NOTE: 6 is the number of cycles we display in details. We store a maximum of 7 cycles (in case the last cycle is accidentally deleted)
    .slice(1, 6)
    .map((_item, idx) => {
      return (
        <CycleListItem
          key={idx}
          cycleIndex={idx}
          maxLength={maxLength}
        />
      );
    });

  return <>{list}</>;
};
