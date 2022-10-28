import React from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonItem,
  IonImg,
  IonLabel,
  IonRow,
  IonCol,
  IonTitle,
  IonButton,
} from '@ionic/react';
import './TabHome.css';

const TabHome: React.FC = () => {

  return (
    <IonPage>
      <IonContent color="basic" fullscreen>
        <IonCard color="light">
          <IonCardHeader>
            <IonItem lines="none">
              <IonDatetimeButton color="basic" class="button" datetime="datetime"></IonDatetimeButton>
            </IonItem>
            <IonModal keepContentsMounted={true}>
              <IonDatetime color="basic" presentation="date" id="datetime" locale="es-ES"></IonDatetime>
            </IonModal>
          </IonCardHeader>
          <IonCardContent>
            <IonRow>
              <IonCol no-padding>
                <IonImg src='../../assets/3.png' />
              </IonCol>
              <IonCol no-padding>
                <IonRow>
                  <IonLabel class="align"><h2>Period in</h2></IonLabel>
                </IonRow>
                <IonRow>
                  <IonTitle size="large" color="dark-basic">7 Days</IonTitle>
                </IonRow>
                <IonRow>
                  <IonButton class="align">Mark</IonButton>
                </IonRow>
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
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage >
  );
};

export default TabHome;
