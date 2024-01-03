import { useCallback, useContext, useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  IonHeader,
  IonContent,
  IonMenuButton,
  IonIcon,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { menuOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import TabHome from "./pages/TabHome";
import TabDetails from "./pages/TabDetails";
import "./App.css";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

import { storage } from "./data/Storage";

import type { Cycle } from "./data/ClassCycle";
import { CyclesContext, ThemeContext } from "./state/Context";
import { Menu } from "./modals/Menu";
import { isNewVersionAvailable } from "./data/AppVersion";

setupIonicReact();

const Badge = () => {
  const theme = useContext(ThemeContext).theme;
  // NOTE: Ionic's badge can't be empty and need some text in it,
  //       that's why I decided to write my own badge component
  return (
    <div
      style={{
        position: "fixed",
        left: 42,
        top: 0,
        backgroundColor: `var(--ion-color-opposite-${theme})`,
        minWidth: 10,
        minHeight: 10,
        borderRadius: 10,
      }}
    />
  );
};

const App: React.FC = () => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [theme, setTheme] = useState("basic");

  const { t, i18n } = useTranslation();
  const [needUpdate, setNeedUpdate] = useState(false);

  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng).catch((err) => console.error(err));
    },
    [i18n],
  );

  function updateCycles(newCycles: Cycle[]) {
    const maxOfCycles = 7;
    setCycles(newCycles.slice(0, maxOfCycles));
    storage.set.cycles(newCycles).catch((err) => console.error(err));
  }

  function updateTheme(newTheme: string) {
    setTheme(newTheme);
    storage.set.theme(newTheme).catch((err) => console.error(err));
  }

  useEffect(() => {
    isNewVersionAvailable()
      .then((newVersionAvailable) => {
        if (!newVersionAvailable) {
          return;
        }
        setNeedUpdate(true);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    storage.get
      .cycles()
      .then(setCycles)
      .catch((err) =>
        console.error(`Can't get cycles ${(err as Error).message}`),
      );

    storage.get
      .language()
      .then((res) => {
        changeLanguage(res);
      })
      .catch((err) =>
        console.error(`Can't get language ${(err as Error).message}`),
      );

    storage.get
      .theme()
      .then(setTheme)
      .catch((err) => {
        console.error(`Can't get theme ${(err as Error).message}`);
        storage.set.theme(theme).catch((err) => console.error(err));
      });
  }, [changeLanguage, theme]);

  return (
    <CyclesContext.Provider value={{ cycles, updateCycles }}>
      <ThemeContext.Provider value={{ theme, updateTheme }}>
        <IonApp>
          <Menu contentId="main-content" />
          <IonReactRouter>
            <IonHeader
              class="ion-no-border"
              style={{
                backgroundColor: `var(--ion-color-background-${theme})`,
              }}
            >
              <div
                id="top-space"
                className={theme}
                style={{
                  background: `var(--ion-color-transparent-${theme})`,
                }}
              />
            </IonHeader>

            <IonContent
              id="main-content"
              color={`background-${theme}`}
            >
              <IonTabs>
                <IonRouterOutlet>
                  <Route
                    exact
                    path="/peri/"
                  >
                    <TabHome />
                  </Route>

                  <Route
                    exact
                    path="/peri-details/"
                  >
                    <TabDetails />
                  </Route>

                  <Route
                    exact
                    path="/"
                  >
                    <Redirect to="/peri/" />
                  </Route>
                </IonRouterOutlet>

                <IonTabBar
                  className={theme}
                  slot="top"
                  color={`transparent-${theme}`}
                >
                  <IonTabButton
                    tab="menu"
                    style={{
                      background: `var(--ion-color-transparent-${theme})`,
                      border: `var(--ion-color-transparent-${theme})`,
                      maxWidth: "30px",
                      marginLeft: "15px",
                    }}
                  >
                    <IonMenuButton>
                      <IonIcon
                        color={`dark-${theme}`}
                        icon={menuOutline}
                        size="large"
                      />
                      {needUpdate && <Badge />}
                    </IonMenuButton>
                  </IonTabButton>

                  <IonTabButton
                    tab="home"
                    href="/peri/"
                    className={theme}
                    style={{ marginLeft: "auto" }}
                  >
                    <IonLabel>{t("Home")}</IonLabel>
                  </IonTabButton>
                  <IonTabButton
                    tab="details"
                    href="/peri-details/"
                    className={theme}
                    style={{ marginLeft: "15px", marginRight: "20px" }}
                  >
                    <IonLabel>{t("Details")}</IonLabel>
                  </IonTabButton>
                </IonTabBar>
              </IonTabs>
            </IonContent>
          </IonReactRouter>
        </IonApp>
      </ThemeContext.Provider>
    </CyclesContext.Provider>
  );
};

export default App;
