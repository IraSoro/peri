import React from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import './TabHome.css';

const TabHome: React.FC = () => {

  return (
    <IonPage>
      <IonContent color="basic" fullscreen>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>Date:</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default TabHome;
