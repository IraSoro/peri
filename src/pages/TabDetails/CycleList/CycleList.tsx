import { useContext } from "react";
import { CyclesContext } from "../../../state/Context";
import { getDayOfCycle } from "../../../state/CalculationLogics";
import CycleListItem from "./CycleListItem";

const CycleList = () => {
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

export default CycleList;
