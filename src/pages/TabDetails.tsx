import React, { useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonLabel,
  IonProgressBar,
  IonItem,
  IonList,
} from '@ionic/react';
import './TabDetails.css';

import { get } from '../data/Storage';
import {
  CycleData,
  getCurrentCycleDay,
  MainProps
} from '../data/Calculations';

interface CurrentProgressProps {
  dateStartCycle: string;
  lenPeriod: number;
};

interface ProgressProps {
  cycles?: CycleData[];
  idx: number;
};

interface ListProps {
  cycles?: CycleData[];
};

const CurrentCycle = (props: CurrentProgressProps) => {

  const getCycleDay = () => {
    if (props.dateStartCycle === "none") {
      return 30;
    }
    const day: number = Number(getCurrentCycleDay(props.dateStartCycle));
    return day;
  }

  const getTitleCycleDay = () => {
    if (props.dateStartCycle === "none") {
      return "Cycle days";
    }
    const day: string = getCurrentCycleDay(props.dateStartCycle);
    if (day === "1")
      return "1 Day";
    return day + " Days";
  }

  return (
    <IonItem class="transparent-center" lines="none">
      <IonLabel position="stacked">
        <h2>{getTitleCycleDay()}</h2>
      </IonLabel>
      <IonLabel position="stacked">
        <p>current cycle</p>
      </IonLabel>
      <IonLabel position="stacked">
        <IonProgressBar
          class="current-progress"
          value={Number(props.lenPeriod) / 100 * 3}
          buffer={getCycleDay() / 100 * 3}
        ></IonProgressBar>
      </IonLabel>
    </IonItem>
  );
}

const ItemProgress = (props: ProgressProps) => {
  const idx: number = props.idx;

  const getLenCycle = () => {
    if (!props.cycles || idx >= props.cycles.length) {
      return "Cycle length";
    }
    return props.cycles[idx].lenCycle + " Days";
  }

  const getLenProgressBar = () => {
    if (!props.cycles || idx >= props.cycles.length) {
      return 30;
    }
    return props.cycles[idx].lenCycle;
  }

  const getLenPeriod = () => {
    if (!props.cycles || idx >= props.cycles.length) {
      return 0;
    }
    return props.cycles[idx].lenPeriod;
  }

  const getDates = () => {
    if (!props.cycles || idx >= props.cycles.length) {
      return "date";
    }

    let date: Date = new Date(props.cycles[idx].startDate);
    date.setDate(date.getDate() + Number(props.cycles[idx].lenCycle));

    return new Date(props.cycles[idx].startDate).toLocaleDateString() + " - " + date.toLocaleDateString();
  }

  return (
    <IonItem class="transparent-center" lines="none">
      <IonLabel position="stacked">
        <h2>{getLenCycle()}</h2>
      </IonLabel>
      <IonLabel position="stacked">
        <p>{getDates()}</p>
      </IonLabel>
      <IonLabel position="stacked">
        <IonProgressBar value={getLenPeriod() / 100 * 3} buffer={getLenProgressBar() / 100 * 3}></IonProgressBar>
      </IonLabel>
    </IonItem>
  );
}

const ListProgress = (props: ListProps) => {
  const numbers = [0, 1, 2, 3, 4];
  const list = numbers.map((idx) =>
    <ItemProgress
      cycles={props.cycles}
      idx={idx}
    />
  );

  return (
    <>{list}</>
  );
}

const TabDetails = (props: MainProps) => {
  useEffect(() => {
    get("cycle-length").then(result => {
      if (result) {
        props.setLenCycle(result);
      }
    });

    get("period-length").then(result => {
      if (result) {
        props.setLenPeriod(result);
      }
    });

    get("current-cycle").then(result => {
      if (result) {
        const cycle: CycleData = result;
        props.setDateStartCycle(cycle.startDate);
      }
    });

    get("cycles").then(result => {
      if (result) {
        props.setCycles(result);
      }
    });

  });

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
              <h1 style={h_style}>{props.lenPeriod} Days</h1>
              <p style={p_style}>Cycle length</p>
              <h1 style={h_style}>{props.lenCycle} Days</h1>
            </IonLabel>
          </div>
        </div>
        <div id="rectangle-bottom">
          <IonList class="transparent-center">

            <CurrentCycle
              dateStartCycle={props.dateStartCycle}
              lenPeriod={props.lenPeriod}
            />

            <ListProgress
              cycles={props.cycles}
            />

          </IonList>
        </div>
      </IonContent>
    </IonPage >
  );
};

export default TabDetails;
