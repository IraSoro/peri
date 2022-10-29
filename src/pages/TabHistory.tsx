import {
  IonContent,
  IonPage,
} from '@ionic/react';
import './TabHistory.css';

const TabHistory: React.FC = () => {
  return (
    <IonPage>
      <IonContent color="light" fullscreen>
        <div id="rectangle"></div>
        <div id="circle"></div>
        <div id="rectangle-angle"></div>
      </IonContent>
    </IonPage>
  );
};

export default TabHistory;
