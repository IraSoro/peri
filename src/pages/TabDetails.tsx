import {
  IonContent,
  IonPage,
  IonLabel,
  IonProgressBar,
  IonItem,
  IonList,
} from '@ionic/react';
import './TabDetails.css';

import {
  useDayOfCycle,
  useLengthOfLastPeriod,
  useAverageLengthOfCycle,
  useAverageLengthOfPeriod,
  useInfoForOneCycle,
} from './CycleInformationHooks';

function getTitle(dayOfCycle: string) {
  if (!dayOfCycle) {
    return "Cycle days"
  }

  if (dayOfCycle === "1") {
    return "1 Day";
  }
  return `${dayOfCycle} Days`;
}

function getProgressBarBuffer(dayOfCycle: string) {
  const defaultLengthOfCycle = 28;

  if (!dayOfCycle) {
    return defaultLengthOfCycle;
  }
  return Number(dayOfCycle);
}

const CurrentCycle = () => {
  const dayOfCycle = useDayOfCycle();
  const lengthOfPeriod = useLengthOfLastPeriod();

  const title = getTitle(dayOfCycle);
  const progressBarBuffer = getProgressBarBuffer(dayOfCycle);

  return (
    <IonItem class="transparent-center" lines="none">
      <IonLabel position="stacked">
        <h2>{title}</h2>
      </IonLabel>
      <IonLabel position="stacked">
        <p>current cycle</p>
      </IonLabel>
      <IonLabel position="stacked">
        <IonProgressBar
          class="current-progress"
          value={lengthOfPeriod / 100 * 3}
          buffer={progressBarBuffer / 100 * 3}
        ></IonProgressBar>
      </IonLabel>
    </IonItem>
  );
}

interface IdxProps {
  idx: number;
};

const ItemProgress = (props: IdxProps) => {
  const info = useInfoForOneCycle(props.idx);

  return (
    <IonItem class="transparent-center" lines="none">
      <IonLabel position="stacked">
        <h2>{info.lengthOfCycleString}</h2>
      </IonLabel>
      <IonLabel position="stacked">
        <p>{info.dates}</p>
      </IonLabel>
      <IonLabel position="stacked">
        <IonProgressBar
          value={info.lengthOfPeriod / 100 * 3}
          buffer={info.lengthOfCycleNumber / 100 * 3}
        ></IonProgressBar>
      </IonLabel>
    </IonItem>
  );
}

const ListProgress = () => {
  const numbers = [0, 1, 2, 3, 4];
  const list = numbers.map((idx) =>
    <ItemProgress
      key={idx}
      idx={idx}
    />
  );

  return (
    <>{list}</>
  );
}

const TabDetails = () => {
  const lengthOfCycle = `${useAverageLengthOfCycle()} Days`;
  const lengthOfPeriod = `${useAverageLengthOfPeriod()} Days`;

  const p_style = {
    fontSize: "10px" as const,
    color: "var(--ion-color-basic)" as const,
    textAlign: "center" as const
  };

  const h_style = {
    fontWeight: "bold" as const,
    color: "var(--ion-color-dark-basic)" as const,
    textAlign: "center" as const
  };

  return (
    <IonPage>
      <IonContent color="basic" fullscreen>
        <div id="rectangle-top">
          <div id="circle">
            <IonLabel >
              <p style={p_style}>Period length</p>
              <h1 style={h_style}>{lengthOfPeriod}</h1>
              <p style={p_style}>Cycle length</p>
              <h1 style={h_style}>{lengthOfCycle}</h1>
            </IonLabel>
          </div>
        </div>
        <div id="rectangle-bottom">
          <IonList class="transparent-center">
            <CurrentCycle />
            <ListProgress />
          </IonList>
        </div>
      </IonContent>
    </IonPage >
  );
};

export default TabDetails;
