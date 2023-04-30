import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonItem,
  IonImg,
  IonLabel,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/react';
import './TabHome.css';

import Welcome from './WelcomeModal';
import MarkModal from './MarkModal';
import InfoModal from './InfoModal';

import uterus from '../assets/uterus.svg';

import {
  useDayOfCycle,
  useOvulationStatus,
  useDaysBeforePeriod
} from './CycleInformationHooks';

import { set, remove } from '../data/Storage';
import type { Cycle } from '../data/ClassCycle';

function getPregnancyChance(ovulationStatus: string) {
  if (!ovulationStatus) {
    return "";
  }

  if (ovulationStatus === "finished") {
    return "low";
  }
  if (["today", "tomorrow"].includes(ovulationStatus)) {
    return "hight";
  }
  return "middle";
}

const TabHome = () => {
  const [isInfoModal, setIsInfoModal] = useState(false);
  const [isWelcomeModal, setIsWelcomeModal] = useState(false);
  const [isMarkModal, setIsMarkModal] = useState(false);

  const dayOfCycle = useDayOfCycle();
  const ovulationStatus = useOvulationStatus();
  const daysBeforePeriod = useDaysBeforePeriod();
  const pregnancyChance = getPregnancyChance(ovulationStatus);

  const cycles: Cycle[] = [
    {
      cycleLength: 30,
      periodLength: 5,
      startDate: "2023-03-13"
    },
    {
      cycleLength: 28,
      periodLength: 3,
      startDate: "2023-02-13"
    },
    {
      cycleLength: 28,
      periodLength: 5,
      startDate: "2023-01-16"
    },
    {
      cycleLength: 30,
      periodLength: 3,
      startDate: "2022-12-17"
    },
    // {
    //   cycle_len: 27,
    //   period_len: 5,
    //   start_date: "2023-11-20"
    // },
  ];
  set("cycles", cycles);
  set("last-start-date", "2023-04-07");
  set("middle-period-length", "5");
  set("middle-cycle-length", "29");
  set("last-period-length", "3");

  // remove("cycles");
  // remove("last-start-date");
  // remove("middle-period-length");
  // remove("middle-cycle-length");
  // remove("last-period-length");


  const p_style = {
    fontSize: "10px" as const,
    color: "var(--ion-color-light)" as const
  };

  const h_style = {
    fontWeight: "bold" as const,
    color: "var(--ion-color-light)" as const
  };

  return (
    <IonPage>
      <IonContent color="basic" fullscreen>
        <IonCard class="large-card" color="light">
          <IonCardContent class="align-center">
            <Welcome
              isOpen={isWelcomeModal}
              setIsOpen={setIsWelcomeModal}
            />
            <IonRow>
              <IonCol>
                <IonDatetimeButton class="calendar-button" color="basic" datetime="datetime">
                </IonDatetimeButton>
              </IonCol>
            </IonRow>
            <IonModal keepContentsMounted={true}>
              <IonDatetime color="basic" presentation="date" id="datetime" locale="en-US"></IonDatetime>
            </IonModal>
            <IonRow>
              <IonCol>
                <IonImg src={uterus} />
              </IonCol>
              <IonCol>
                <div>
                  <IonLabel style={{ textAlign: "center" }}>
                    <h2>{daysBeforePeriod.title}</h2>
                  </IonLabel>
                  <IonLabel style={{ textAlign: "center" }} color="dark-basic">
                    <h1 style={{ fontWeight: "bold" }}>{daysBeforePeriod.days}</h1>
                  </IonLabel>
                  <IonButton class="mark-button" onClick={() => {
                    setIsMarkModal(true);
                  }}
                  >
                    Mark</IonButton>
                  <MarkModal
                    isOpen={isMarkModal}
                    setIsOpen={setIsMarkModal}
                  />
                </div>
              </IonCol>
            </IonRow>
            <IonCard color="basic">
              <IonCardContent>
                <IonItem color="basic" lines="full">
                  <IonLabel>
                    <p style={p_style}>Current cycle day</p>
                    <h1 style={h_style}>{dayOfCycle}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem color="basic" lines="full">
                  <IonLabel>
                    <p style={p_style}>Ovulation</p>
                    <h1 style={h_style}>{ovulationStatus}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem color="basic" lines="none">
                  <IonLabel>
                    <p style={p_style}>Chance of getting pregnant</p>
                    <h1 style={h_style}>{pregnancyChance}</h1>
                  </IonLabel>
                </IonItem>
              </IonCardContent>
            </IonCard>
            <IonButton onClick={() => setIsInfoModal(true)} class="info-button">learn more about the current state</IonButton>
            <InfoModal
              isOpen={isInfoModal}
              setIsOpen={setIsInfoModal}
            />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage >
  );
};

export default TabHome;
