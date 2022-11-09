import {
  IonContent,
  IonPage,
  IonLabel,
  IonProgressBar,
  IonItem,
  IonList,
} from '@ionic/react';
import './TabHistory.css';


const TabHistory: React.FC = () => {

  return (
    <IonPage>
      <IonContent color="basic" fullscreen>
        <div id="rectangle-top">
          <div id="circle">
            <IonLabel >
              <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-basic-rgb))", textAlign: "center" }}>Period length</p>
              <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-dark-basic-rgb))", textAlign: "center" }}>5 Days</h1>
              <p style={{ fontSize: "10px", color: "rgb(var(--ion-color-basic-rgb))", textAlign: "center" }}>Cycle length</p>
              <h1 style={{ fontWeight: "bold", color: "rgb(var(--ion-color-dark-basic-rgb))", textAlign: "center" }}>25 Days</h1>
            </IonLabel>
          </div>
        </div>
        <div id="rectangle-bottom">
          <IonList class="transparent-center">
            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>7 Days</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>Current cycle</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar class="current-progress" value={.05 * 3} buffer={.08 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>26 Days</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>12 Aug - 1 Sept</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar value={.05 * 3} buffer={.26 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>23 Days</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>12 July - 1 Aug</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar value={.04 * 3} buffer={.23 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>26 Days</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>12 June - 1 July</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar value={.05 * 3} buffer={.26 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>23 Days</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>12 May - 1 June</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar value={.04 * 3} buffer={.23 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

            <IonItem class="transparent-center" lines="none">
              <IonLabel position="stacked">
                <h2>23 Days</h2>
              </IonLabel>
              <IonLabel position="stacked">
                <p>12 May - 1 June</p>
              </IonLabel>
              <IonLabel position="stacked">
                <IonProgressBar value={.04 * 3} buffer={.23 * 3}></IonProgressBar>
              </IonLabel>
            </IonItem>

          </IonList>
        </div>
      </IonContent>
    </IonPage >
  );
};

export default TabHistory;
