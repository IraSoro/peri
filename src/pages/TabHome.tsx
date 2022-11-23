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
  IonTitle,
  IonList,
} from '@ionic/react';
import './TabHome.css';

import Welcome from './WelcomeModal';

import uterus from '../assets/uterus.svg';

import { get } from '../data/Storage';
import {
  getInfo,
  InfoCurrentCycle
} from '../data/Сalculations';

interface PropsInfoModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const InfoModal = (props: PropsInfoModal) => {
  return (
    <IonModal isOpen={props.isOpen}>
      <div id="small-rectangle"></div>
      <IonContent className="ion-padding" color="basic">
        <div id="rectangle">
          <IonList class="transparent">
            <IonItem>
              <IonTitle color="dark-basic">Luteal phase</IonTitle>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>progesterone levels rise</IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>estrogen levels rise</IonLabel>
            </IonItem>
          </IonList>
        </div>
        <div id="small-rectangle"></div>
        <div id="rectangle">
          <IonList class="transparent">
            <IonItem>
              <IonTitle color="dark-basic">Symptoms</IonTitle>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <p>Increased appetite</p>
                <p>Tiredness</p>
                <p>Acne</p>
                <p>Fatigue</p>
                <p>Oily hair and skin</p>
              </IonLabel>
            </IonItem>
          </IonList>
        </div>
        <div id="small-rectangle"></div>
        <div id="button-rectangle">
          <IonButton
            class="ok-modal"
            onClick={() => props.setIsOpen(false)}>
            Ok
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

const TabHome: React.FC = () => {
  const [isInfoModal, setIsInfoModal] = useState(false);
  const [isWelcomeModal, setIsWelcomeModal] = useState(false);

  const [info, setInfo] = useState<InfoCurrentCycle>(
    {
      cycleDay: "none",
      ovulationDay: "none",
      pregnantChance: "none",
      periodIn: "none",
      periodInTitle: "Period in",
    });

  useEffect(() => {
    get("welcome").then(result => {
      // if (!result) {
      setIsWelcomeModal(true);
      // }
    });

    get("current-cycle").then(resultDate => {
      if (resultDate) {
        get("cycle-length").then(resultLen => {
          setInfo(getInfo(resultDate, resultLen));
        });
      }
    });



  }, []);

  return (
    <IonPage>
      <IonContent color="basic" fullscreen>
        <IonCard class="large-card" color="light">
          <IonCardContent class="align-center">
            <Welcome
              isOpen={isWelcomeModal}
              setIsOpen={setIsWelcomeModal}
              setInfo={setInfo}
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
                  <IonButton class="mark-button">Mark</IonButton>
                </div>
              </IonCol>
            </IonRow>
            <IonCard color="basic">
              <IonCardContent>
                <IonItem color="basic" lines="full">
                  <IonLabel>
                    <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-light-rgb))" }}>Current cycle day</p>
                    <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-light-rgb))" }}>{info.cycleDay}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem color="basic" lines="full">
                  <IonLabel>
                    <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-light-rgb))" }}>Ovulation</p>
                    <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-light-rgb))" }}>{info.ovulationDay}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem color="basic" lines="none">
                  <IonLabel>
                    <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-light-rgb))" }}>Chance of getting pregnant</p>
                    <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-light-rgb))" }}>{info.pregnantChance}</h1>
                  </IonLabel>
                </IonItem>
              </IonCardContent>
            </IonCard>
            <IonButton onClick={() => setIsInfoModal(true)} class="info-button">learn more about the current state</IonButton>
            <InfoModal isOpen={isInfoModal} setIsOpen={setIsInfoModal} />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage >
  );
};

export default TabHome;
