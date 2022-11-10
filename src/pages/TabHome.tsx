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
  IonHeader,
  IonToolbar,
  IonButtons,
} from '@ionic/react';
import './TabHome.css';

interface PropsModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}


const InfoModal = (props: PropsModal) => {
  return (
    <IonModal isOpen={props.isOpen}>
      <IonHeader class="ion-no-border">
        <IonToolbar color="basic">
          <IonButtons slot="end">
            <IonButton color="light" onClick={() => props.setIsOpen(false)}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" color="basic">
        <div id="rectangle"></div>
        <div id="small-rectangle"></div>
        <div id="rectangle"></div>
      </IonContent>
    </IonModal>
  );
};

const TabHome: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <IonPage>
      <IonContent color="basic" fullscreen>
        <IonCard class="large-card" color="light">
          <IonCardContent class="align-center">
            <IonRow>
              <IonCol>
                <IonDatetimeButton color="basic" class="button" datetime="datetime">
                </IonDatetimeButton>
              </IonCol>
            </IonRow>
            <IonModal keepContentsMounted={true}>
              <IonDatetime color="basic" presentation="date" id="datetime" locale="en-US"></IonDatetime>
            </IonModal>
            <IonRow>
              <IonCol>
                <IonImg src='../../assets/uterus.svg' />
              </IonCol>
              <IonCol>
                <div>
                  <IonLabel style={{ textAlign: "center" }}>
                    <h2>Period in</h2>
                  </IonLabel>
                  <IonLabel style={{ textAlign: "center" }} color="dark-basic">
                    <h1 style={{ fontWeight: "bold" }}>7 Days</h1>
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
                    <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-light-rgb))" }}>19</h1>
                  </IonLabel>
                </IonItem>
                <IonItem color="basic" lines="full">
                  <IonLabel>
                    <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-light-rgb))" }}>Ovulation</p>
                    <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-light-rgb))" }}>was</h1>
                  </IonLabel>
                </IonItem>
                <IonItem color="basic" lines="none">
                  <IonLabel>
                    <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-light-rgb))" }}>Chance of getting pregnant</p>
                    <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-light-rgb))" }}>low</h1>
                  </IonLabel>
                </IonItem>
              </IonCardContent>
            </IonCard>
            <IonButton onClick={() => setIsOpen(true)} class="info-button">learn more about the current state</IonButton>
            <InfoModal isOpen={isOpen} setIsOpen={setIsOpen} />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage >
  );
};

export default TabHome;
