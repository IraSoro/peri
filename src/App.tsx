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
import { maxOfCycles } from "./state/CalculationLogics";
import { CyclesContext, ThemeContext, SettingsContext } from "./state/Context";
import { Menu } from "./modals/Menu";
import { isNewVersionAvailable } from "./data/AppVersion";
import { configuration } from "./data/AppConfiguration";

import {
  requestPermission,
  clearAllDeliveredNotifications,
  removePendingNotifications,
  createNotifications,
} from "./utils/notifications";

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

interface AppProps {
  theme?: string;
}

const App = (props: AppProps) => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [theme, setTheme] = useState(props.theme ?? "basic");

  const { t, i18n } = useTranslation();
  const [needUpdate, setNeedUpdate] = useState(false);
  const [notificationsStatus, setNotificationsStatus] = useState(false);
  const [maxDisplayedCycles, setMaxDisplayedCycles] = useState(6);

  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng).catch((err) => console.error(err));
    },
    [i18n],
  );

  function updateCycles(newCycles: Cycle[]) {
    const slicedCycles = newCycles.slice(0, maxOfCycles);
    setCycles(slicedCycles);
    storage.set.cycles(slicedCycles).catch((err) => console.error(err));

    if (configuration.features.notifications && notificationsStatus) {
      clearAllDeliveredNotifications().catch((err) => {
        console.error("Error removing delivered notifications", err);
      });
      removePendingNotifications()
        .then(() => {
          createNotifications(cycles).catch((err) => {
            console.error("Error creating notifications", err);
          });
        })
        .catch((err) => {
          console.error("Error removing pending notifications", err);
        });
    }
  }

  function updateTheme(newTheme: string) {
    if (newTheme === "light") {
      newTheme = "basic";
    }
    setTheme(newTheme);
    storage.set.theme(newTheme).catch((err) => console.error(err));
    const metaStatusBarColorAndroid = document.querySelector(
      "meta[name=theme-color]",
    );
    if (metaStatusBarColorAndroid) {
      metaStatusBarColorAndroid.setAttribute(
        "content",
        newTheme === "basic" ? "#eae7ff" : "#1f1f1f",
      );
    }
    const metaStatusBarColorIOS = document.querySelector(
      "meta[name=apple-mobile-web-app-status-bar-style]",
    );
    if (metaStatusBarColorIOS) {
      metaStatusBarColorIOS.setAttribute(
        "content",
        newTheme === "basic" ? "default" : "black",
      );
    }
  }

  function updateNotificationsStatus(newStatus: boolean) {
    setNotificationsStatus(newStatus);
    storage.set
      .notifications(newStatus)
      .then(() => {
        console.log(
          `Notification has been switched to ${newStatus ? "on" : "off"}`,
        );
        if (newStatus) {
          createNotifications(cycles).catch((err) => {
            console.error("Error creating notifications", err);
          });
          return;
        }
        removePendingNotifications().catch((err) => {
          console.error("Error removing pending notifications", err);
        });
      })
      .catch((err) => console.error(err));
  }

  function updateMaxDisplayedCycles(newValue: number) {
    setMaxDisplayedCycles(newValue);
  }

  useEffect(() => {
    if (!configuration.features.useCustomVersionUpdate) {
      return;
    }

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

    storage.get
      .notifications()
      .then(setNotificationsStatus)
      .catch((err) => {
        console.error(
          `Can't get notifications status ${(err as Error).message}`,
        );
        // Notifications are off by default
        storage.set.notifications(false).catch((err) => console.error(err));
      });
  }, [changeLanguage, theme]);

  useEffect(() => {
    if (!configuration.features.notifications || !notificationsStatus) {
      return;
    }

    requestPermission().catch((err) => {
      console.error("Error request permission notifications", err);
    });
  }, [notificationsStatus]);

  return (
    <CyclesContext.Provider value={{ cycles, updateCycles }}>
      <ThemeContext.Provider value={{ theme, updateTheme }}>
        <SettingsContext.Provider
          value={{
            notificationsStatus,
            updateNotificationsStatus,
            maxDisplayedCycles,
            updateMaxDisplayedCycles,
          }}
        >
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
                      href="#"
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
        </SettingsContext.Provider>
      </ThemeContext.Provider>
    </CyclesContext.Provider>
  );
};

export default App;
