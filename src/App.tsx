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

import type { Cycle } from "./data/ICycle";
import { getMaxStoredCountOfCycles } from "./state/CalculationLogics";
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
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [maxNumberOfDisplayedCycles, setMaxNumberOfDisplayedCycles] =
    useState(6);

  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng).catch((err) => console.error(err));
    },
    [i18n],
  );

  const updateCycles = useCallback(
    async (newCycles: Cycle[]) => {
      try {
        const slicedCycles = newCycles.slice(
          0,
          getMaxStoredCountOfCycles(maxNumberOfDisplayedCycles),
        );
        setCycles(slicedCycles);
        await storage.set.cycles(slicedCycles);

        if (configuration.features.notifications && notificationEnabled) {
          await updateNotifications(newCycles, maxNumberOfDisplayedCycles);
        }
      } catch (err) {
        console.error("Error updating cycles", err);
      }
    },
    [maxNumberOfDisplayedCycles, notificationEnabled],
  );

  const updateTheme = useCallback((newTheme: string) => {
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
  }, []);

  const updateNotifications = async (
    cycles: Cycle[],
    maxDisplayedCycles: number,
  ) => {
    await clearAllDeliveredNotifications();
    await removePendingNotifications();
    await createNotifications(cycles, maxDisplayedCycles);
  };

  const updateNotificationsStatus = useCallback(
    async (newStatus: boolean) => {
      try {
        setNotificationEnabled(newStatus);
        await storage.set.isNotificationEnabled(newStatus);
        console.log(
          `Notification has been switched to ${newStatus ? "on" : "off"}`,
        );

        if (newStatus) {
          await createNotifications(cycles, maxNumberOfDisplayedCycles);
        } else {
          await removePendingNotifications();
        }
      } catch (err) {
        console.error("Error updating notification status", err);
      }
    },
    [cycles, maxNumberOfDisplayedCycles],
  );

  const updateMaxNumberOfDisplayedCycles = useCallback(
    async (newValue: number) => {
      try {
        setMaxNumberOfDisplayedCycles(newValue);
        await storage.set.maxNumberOfDisplayedCycles(newValue);
        console.log(`maxDisplayedCycles has been switched to ${newValue}`);
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

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
      .isNotificationEnabled()
      .then(setNotificationEnabled)
      .catch((err) => {
        console.error(
          `Can't get notifications status ${(err as Error).message}`,
        );
        // Notifications are off by default
        storage.set
          .isNotificationEnabled(false)
          .catch((err) => console.error(err));
      });

    storage.get.lastNotificationId().catch((err) => {
      console.error(`Can't get lastNotificationId ${(err as Error).message}`);
      storage.set.lastNotificationId(0).catch((err) => console.error(err));
    });

    storage.get
      .maxNumberOfDisplayedCycles()
      .then(setMaxNumberOfDisplayedCycles)
      .catch((err) => {
        console.error(`Can't get maxDisplayedCycles ${(err as Error).message}`);
        storage.set
          .maxNumberOfDisplayedCycles(maxNumberOfDisplayedCycles)
          .catch((err) => console.error(err));
      });
  }, [changeLanguage, theme, maxNumberOfDisplayedCycles]);

  useEffect(() => {
    if (!configuration.features.notifications || !notificationEnabled) {
      return;
    }

    requestPermission().catch((err) => {
      console.error("Error request permission notifications", err);
    });
  }, [notificationEnabled]);

  // NOTE: Refresh notifications every time user open the app
  useEffect(() => {
    if (
      !notificationEnabled ||
      cycles.length === 0 ||
      !configuration.features.notifications
    ) {
      return;
    }

    updateNotifications(cycles, maxNumberOfDisplayedCycles).catch((err) => {
      console.error("Error update notifications", err);
    });
  }, [notificationEnabled, cycles, maxNumberOfDisplayedCycles]);

  return (
    <CyclesContext.Provider
      value={{
        cycles,
        updateCycles: (newCycles) => {
          updateCycles(newCycles).catch((err) => console.error(err));
        },
      }}
    >
      <ThemeContext.Provider value={{ theme, updateTheme }}>
        <SettingsContext.Provider
          value={{
            notificationEnabled,
            updateNotificationEnabled: (newStatus) => {
              updateNotificationsStatus(newStatus).catch((err) =>
                console.error(err),
              );
            },
            maxNumberOfDisplayedCycles,
            updateMaxNumberOfDisplayedCycles: (newValue) => {
              updateMaxNumberOfDisplayedCycles(newValue).catch((err) =>
                console.error(err),
              );
            },
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
