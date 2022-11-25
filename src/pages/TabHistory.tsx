import React, { useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonLabel,
  IonProgressBar,
  IonItem,
  IonList,
} from '@ionic/react';
import './TabHistory.css';

import { get } from '../data/Storage';
import {
  CycleData,
  getCurrentCycleDay,
  MainProps
} from '../data/Сalculations';



const TabHistory = (props: MainProps) => {
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

  const getCycleDay = () => {
    if (props.dateStartCycle === "none") {
      return 30;
    }
    const day: number = Number(getCurrentCycleDay(props.dateStartCycle));
    return day;
  }

  const getTitleCycleDay = () => {
    if (props.dateStartCycle === "none") {
      return "none";
    }
    const day: string = getCurrentCycleDay(props.dateStartCycle);
    if (day === "1")
      return "1 Day";
    return day + " Days";
  }

  const getLenCycle = (idx: number) => {
    if (!props.cycles || idx >= props.cycles.length) {
      return "none Days";
    }
    return props.cycles[idx].lenCycle + " Days";
  }

  const getLenProgressBar = (idx: number) => {
    if (!props.cycles || idx >= props.cycles.length) {
      return 30;
    }
    return props.cycles[idx].lenCycle;
  }

  const getLenPeriod = (idx: number) => {
    if (!props.cycles || idx >= props.cycles.length) {
      return 0;
    }
    return props.cycles[idx].lenPeriod;
  }

  const getDates = (idx: number) => {
    if (!props.cycles || idx >= props.cycles.length) {
      return "date: none";
    }

    let date: Date = new Date(props.cycles[idx].startDate);
    date.setDate(date.getDate() + Number(props.cycles[idx].lenCycle));

    return new Date(props.cycles[idx].startDate).toLocaleDateString() + " - " + date.toLocaleDateString();
  }

  return (
    <IonPage>
      <IonContent color="basic" fullscreen>
        <div id="rectangle-top">
          <div id="circle">
            <IonLabel >
              <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-basic-rgb))", textAlign: "center" }}>Period length</p>
              <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-dark-basic-rgb))", textAlign: "center" }}>{props.lenPeriod} Days</h1>
              <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-basic-rgb))", textAlign: "center" }}>Cycle length</p>
              <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-dark-basic-rgb))", textAlign: "center" }}>{props.lenCycle} Days</h1>
            </IonLabel>
          </div>
        </div>
        <div id="rectangle-bottom">
          <IonList class="transparent-center">
            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>{getTitleCycleDay()}</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>Current cycle</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar class="current-progress" value={Number(props.lenPeriod) / 100 * 3} buffer={getCycleDay() / 100 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>{getLenCycle(0)}</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>{getDates(0)}</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar value={getLenPeriod(0) / 100 * 3} buffer={getLenProgressBar(0) / 100 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>{getLenCycle(1)}</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>{getDates(1)}</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar value={getLenPeriod(1) / 100 * 3} buffer={getLenProgressBar(1) / 100 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>{getLenCycle(2)}</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>{getDates(2)}</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar value={getLenPeriod(2) / 100 * 3} buffer={getLenProgressBar(2) / 100 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>{getLenCycle(3)}</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>{getDates(3)}</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar value={getLenPeriod(3) / 100 * 3} buffer={getLenProgressBar(3) / 100 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>{getLenCycle(4)}</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>{getDates(4)}</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar value={getLenPeriod(4) / 100 * 3} buffer={getLenProgressBar(4) / 100 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

          </IonList>
        </div>
      </IonContent>
    </IonPage >
  );
};

export default TabHistory;
