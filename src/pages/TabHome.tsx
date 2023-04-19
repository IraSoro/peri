import React, { useState, useEffect } from 'react';
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

import { get } from '../data/Storage';
import {
  getInfo,
  InfoCurrentCycle,
  CycleData,
  MainProps,
  InfoPhase,
  phases,
  getPhase,
} from '../data/Calculations';

const TabHome = (props: MainProps) => {
  const [isInfoModal, setIsInfoModal] = useState(false);
  const [isWelcomeModal, setIsWelcomeModal] = useState(false);
  const [isMarkModal, setIsMarkModal] = useState(false);

  const [info, setInfo] = useState<InfoCurrentCycle>(
    {
      cycleDay: "none",
      ovulationDay: "none",
      pregnantChance: "none",
      periodIn: "none",
      periodInTitle: "Period in",
    });

  const [phase, setPhase] = useState<InfoPhase>({ phaseTitle: phases[0], symptoms: 0 });

  useEffect(() => {
    get("welcome").then(result => {
      if (!result) {
        setIsWelcomeModal(true);
      }
    });

    get("current-cycle").then(resultData => {
      if (resultData) {
        get("cycle-length").then(resultLen => {
          const cycle: CycleData = resultData;
          setInfo(getInfo(cycle.startDate, resultLen));
          setPhase(getPhase(cycle, resultLen));
        });
      }
    });

  }, []);

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
              setInfo={setInfo}
              setPhase={setPhase}
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
                    <h2>{info.periodInTitle}</h2>
                  </IonLabel>
                  <IonLabel style={{ textAlign: "center" }} color="dark-basic">
                    <h1 style={{ fontWeight: "bold" }}>{info.periodIn}</h1>
                  </IonLabel>
                  <IonButton class="mark-button" onClick={() => {
                    setIsMarkModal(true);
                  }}
                  >
                    Mark</IonButton>
                  <MarkModal
                    isOpen={isMarkModal}
                    setIsOpen={setIsMarkModal}
                    setInfo={setInfo}

                    lenCycle={props.lenCycle}
                    setLenCycle={props.setLenCycle}
                    lenPeriod={props.lenPeriod}
                    setLenPeriod={props.setLenPeriod}
                    dateStartCycle={props.dateStartCycle}
                    setDateStartCycle={props.setDateStartCycle}
                    cycles={props.cycles}
                    setCycles={props.setCycles}

                    setPhase={setPhase}
                  />
                </div>
              </IonCol>
            </IonRow>
            <IonCard color="basic">
              <IonCardContent>
                <IonItem color="basic" lines="full">
                  <IonLabel>
                    <p style={p_style}>Current cycle day</p>
                    <h1 style={h_style}>{info.cycleDay}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem color="basic" lines="full">
                  <IonLabel>
                    <p style={p_style}>Ovulation</p>
                    <h1 style={h_style}>{info.ovulationDay}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem color="basic" lines="none">
                  <IonLabel>
                    <p style={p_style}>Chance of getting pregnant</p>
                    <h1 style={h_style}>{info.pregnantChance}</h1>
                  </IonLabel>
                </IonItem>
              </IonCardContent>
            </IonCard>
            <IonButton onClick={() => setIsInfoModal(true)} class="info-button">learn more about the current state</IonButton>
            <InfoModal
              isOpen={isInfoModal}
              setIsOpen={setIsInfoModal}
              info={phase}
            />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage >
  );
};

export default TabHome;
