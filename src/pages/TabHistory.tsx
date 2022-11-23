import React, { useState, useEffect } from 'react';
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
  getCurrentCycleDay
} from '../data/Сalculations';

const TabHistory: React.FC = () => {
  const [lenCycle, setLenCycle] = useState(0);
  const [lenPeriod, setLenPeriod] = useState(0);
  const [dateStartCycle, setDateStartCycle] = useState("none");
  const [cycles, setCycles] = useState<CycleData[]>();

  useEffect(() => {
    get("cycle-length").then(result => {
      if (result) {
        setLenCycle(result);
      }
    });

    get("period-length").then(result => {
      if (result) {
        setLenPeriod(result);
      }
    });

    get("current-cycle").then(result => {
      if (result) {
        setDateStartCycle(result);
      }
    });

    get("cycles").then(result => {
      if (result) {
        setCycles(result);
      }
    });

  }, []);

  const getCycleDay = () => {
    if (dateStartCycle === "none") {
      return 30;
    }
    const day: number = Number(getCurrentCycleDay(dateStartCycle));
    return day;
  }

  const getTitleCycleDay = () => {
    if (dateStartCycle === "none") {
      return "none";
    }
    const day: string = getCurrentCycleDay(dateStartCycle);
    if (day === "1")
      return "1 Day";
    return day + " Days";
  }

  const getLenCycle = (idx: number) => {
    if (!cycles || idx >= cycles.length) {
      return "none Days";
    }
    return cycles[idx].lenCycle + " Days";
  }

  const getLenProgressBar = (idx: number) => {
    if (!cycles || idx >= cycles.length) {
      return 30;
    }
    return cycles[idx].lenCycle;
  }

  const getLenPeriod = (idx: number) => {
    if (!cycles || idx >= cycles.length) {
      return 0;
    }
    return cycles[idx].lenPeriod;
  }

  const getDates = (idx: number) => {
    if (!cycles || idx >= cycles.length) {
      return "date: none";
    }

    let date: Date = new Date(cycles[idx].lastDate);
    date.setDate(date.getDate() + Number(cycles[idx].lenCycle));

    return cycles[idx].lastDate.toString() + " - " + date.toString();
  }

  return (
    <IonPage>
      <IonContent color="basic" fullscreen>
        <div id="rectangle-top">
          <div id="circle">
            <IonLabel >
              <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-basic-rgb))", textAlign: "center" }}>Period length</p>
              <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-dark-basic-rgb))", textAlign: "center" }}>{lenPeriod} Days</h1>
              <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-basic-rgb))", textAlign: "center" }}>Cycle length</p>
              <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-dark-basic-rgb))", textAlign: "center" }}>{lenCycle} Days</h1>
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
                <IonProgressBar class="current-progress" value={Number(lenPeriod) / 100 * 3} buffer={getCycleDay() / 100 * 3}></IonProgressBar>
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
