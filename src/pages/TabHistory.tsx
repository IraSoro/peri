import {
  IonContent,
  IonPage,
  IonLabel,
} from '@ionic/react';
import './TabHistory.css';

const TabHistory: React.FC = () => {
  return (
    <IonPage>
      <IonContent color="light" fullscreen>
        <div id="rectangle"></div>
        <div id="circle">
          <IonLabel >
            <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-basic-rgb))", textAlign: "center" }}>Period length</p>
            <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-dark-basic-rgb))", textAlign: "center" }}>5 Days</h1>
            <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-basic-rgb))", textAlign: "center" }}>Cycle length</p>
            <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-dark-basic-rgb))", textAlign: "center" }}>25 Days</h1>
          </IonLabel>
        </div>
        <div id="rectangle-angle"></div>
      </IonContent>
    </IonPage>
  );
};

export default TabHistory;
