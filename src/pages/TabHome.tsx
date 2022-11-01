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
  IonButton,
} from '@ionic/react';
import './TabHome.css';

const TabHome: React.FC = () => {

  return (
    <IonPage>
      <IonContent color="basic" fullscreen>
        <IonCard color="light">
          <IonCardHeader>
            <IonDatetimeButton color="basic" class="button" datetime="datetime"></IonDatetimeButton>
            <IonModal keepContentsMounted={true}>
              <IonDatetime color="basic" presentation="date" id="datetime" locale="en-US"></IonDatetime>
            </IonModal>
          </IonCardHeader>
          <IonCardContent>
            <IonRow style={{ height: "50%" }}>
              <IonCol>
                <IonImg src='../../assets/3.png' />
              </IonCol>
              <IonCol>
                <div>
                  <IonLabel style={{ textAlign: "center" }}>
                    <h2>Period in</h2>
                  </IonLabel>
                  <IonLabel style={{ textAlign: "center" }} color="dark-basic">
                    <h1 style={{ fontWeight: "bold" }}>7 Days</h1>
                  </IonLabel>
                  <IonButton>Mark</IonButton>
                </div>
              </IonCol>
            </IonRow>
            <IonItem lines="none"></IonItem>
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
