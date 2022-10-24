import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel
} from '@ionic/react';
import './TabHistory.css';

const TabHistory: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 2</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonLabel>History page</IonLabel>
      </IonContent>
    </IonPage>
  );
};

export default TabHistory;
