import {
  IonContent,
  IonPage,
  IonLabel,
  IonProgressBar,
} from '@ionic/react';
import './TabHistory.css';


const TabHistory: React.FC = () => {

  return (
    <IonPage>
      <IonContent color="light" fullscreen>
        <div id="rectangle">
          <div id="circle">
            <IonLabel >
              <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-basic-rgb))", textAlign: "center" }}>Period length</p>
              <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-dark-basic-rgb))", textAlign: "center" }}>5 Days</h1>
              <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-basic-rgb))", textAlign: "center" }}>Cycle length</p>
              <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-dark-basic-rgb))", textAlign: "center" }}>25 Days</h1>
            </IonLabel>
          </div>
        </div>
        {/* <div id="rectangle-angle"></div> */}
        <IonLabel style={{ fontSize: "12px" }}>12 Seb - Current</IonLabel>
        <IonProgressBar value={.05 * 3} buffer={.25 * 3}></IonProgressBar>

        <IonLabel style={{ fontSize: "12px" }}>12 Aug - 1 Seb</IonLabel>
        <IonProgressBar value={.05 * 3} buffer={.26 * 3}></IonProgressBar>

        <IonLabel style={{ fontSize: "12px" }}>12 July - 1 Aug</IonLabel>
        <IonProgressBar value={.04 * 3} buffer={.23 * 3}></IonProgressBar>
      </IonContent>
    </IonPage>
  );
};

export default TabHistory;
