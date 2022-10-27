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
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default TabHome;
