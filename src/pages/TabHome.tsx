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
                  <IonButton class="align" color="opposite">Mark</IonButton>
                </IonRow>
              </IonCol>
            </IonRow>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage >
  );
};

export default TabHome;
