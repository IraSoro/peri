import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  IonContent,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import TabHome from './pages/TabHome';
import TabHistory from './pages/TabHistory';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonContent>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home">
              <TabHome />
            </Route>
            <Route exact path="/history">
              <TabHistory />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="top" color="basic">
            <IonTabButton tab="home" href="/home">
              <IonLabel>home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="history" href="/history">
              <IonLabel>history</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonContent>

    </IonReactRouter>
  </IonApp>
);

export default App;
