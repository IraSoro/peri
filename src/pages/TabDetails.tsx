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
  MainProps,
  getLenCycle,
  getLenProgressBar,
  getLenPeriod,
  getDates,
  getCycleDay,
  getTitleCycleDay
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
  const title: string = getTitleCycleDay(props.dateStartCycle);
  const days: number = getCycleDay(props.dateStartCycle);

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
          value={Number(props.lenPeriod) / 100 * 3}
          buffer={days / 100 * 3}
        ></IonProgressBar>
      </IonLabel>
    </IonItem>
  );
}

const ItemProgress = (props: ProgressProps) => {
  const cycle_len: string = getLenCycle(props.idx, props.cycles);
  const progressbar_len: number = getLenProgressBar(props.idx, props.cycles);
  const period_len: number = getLenPeriod(props.idx, props.cycles);
  const dates: string = getDates(props.idx, props.cycles);

  return (
    <IonItem class="transparent-center" lines="none">
      <IonLabel position="stacked">
        <h2>{cycle_len}</h2>
      </IonLabel>
      <IonLabel position="stacked">
        <p>{dates}</p>
      </IonLabel>
      <IonLabel position="stacked">
        <IonProgressBar value={period_len / 100 * 3} buffer={progressbar_len / 100 * 3}></IonProgressBar>
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
