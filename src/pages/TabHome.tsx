import {
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import './TabHome.css';

const TabHome: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonLabel>Home page</IonLabel>
      </IonContent>
    </IonPage>
  );
};

export default TabHome;
