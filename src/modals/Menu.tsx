import { useContext, useEffect, useState } from "react";
import {
  IonAlert,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonSelect,
  IonSelectOption,
  IonText,
  IonToggle,
  useIonAlert,
} from "@ionic/react";
import {
  arrowDownOutline,
  cloudDownloadOutline,
  cloudUploadOutline,
  globeOutline,
  colorFillOutline,
  logoGithub,
  notificationsOutline,
  serverOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { storage } from "../data/Storage";
import { configuration } from "../data/AppConfiguration";
import { exportConfig, importConfig } from "../data/Config";
import {
  downloadLatestRelease,
  isNewVersionAvailable,
  openGitHubPage,
} from "../data/AppVersion";
import { CyclesContext, SettingsContext, ThemeContext } from "../state/Context";
import {
  changeTranslation,
  getCurrentTranslation,
  supportedLanguages,
} from "../utils/translation";
import { changeDateTimeLocale } from "../utils/datetime";

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext).theme;

  const changeLanguage = async (language: string) => {
    await changeTranslation(language);
    changeDateTimeLocale(language);
    await storage.set.language(language);

    console.log(`Application language has been changed to ${language}`);
  };

  const languages = [];
  for (const [code, language] of supportedLanguages) {
    languages.push(
      <IonSelectOption
        key={code}
        value={code}
      >
        {language}
      </IonSelectOption>,
    );
  }

  return (
    <IonItem>
      <IonIcon
        slot="start"
        icon={globeOutline}
        color={`text-${theme}`}
      />
      <IonSelect
        className={theme}
        value={getCurrentTranslation()}
        justify="space-between"
        interface="popover"
        interfaceOptions={{
          cssClass: theme,
        }}
        onIonChange={(event) => {
          changeLanguage(event.target.value as string).catch((err) => {
            console.error(err);
          });
        }}
      >
        <div slot="label">
          <IonText color={`text-${theme}`}>{t("Language")}</IonText>
        </div>
        {languages}
      </IonSelect>
    </IonItem>
  );
};

const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const { theme, updateTheme } = useContext(ThemeContext);

  const themesList = [];
  for (const item of ["light", "dark"]) {
    themesList.push(
      <IonSelectOption
        key={item}
        value={item}
      >
        {item}
      </IonSelectOption>,
    );
  }

  return (
    <IonItem>
      <IonIcon
        slot="start"
        icon={colorFillOutline}
        color={`text-${theme}`}
      />

      <IonSelect
        className={theme}
        value={theme === "basic" ? "light" : theme}
        interface="popover"
        justify="space-between"
        interfaceOptions={{
          cssClass: theme,
        }}
        onIonChange={(event) => updateTheme(event.target.value as string)}
      >
        <div slot="label">
          <IonText color={`text-${theme}`}>{t("Theme")}</IonText>
        </div>
        {themesList}
      </IonSelect>
    </IonItem>
  );
};

const CycleCountSelector = () => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { maxNumberOfDisplayedCycles, updateMaxNumberOfDisplayedCycles } =
    useContext(SettingsContext);

  const [selectedCount, setSelectedCount] = useState(6);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    setSelectedCount(maxNumberOfDisplayedCycles);
  }, [maxNumberOfDisplayedCycles]);

  const countList = [];
  for (const item of [6, 12, 24]) {
    countList.push(
      <IonSelectOption
        key={item}
        value={item}
      >
        {item}
      </IonSelectOption>,
    );
  }

  return (
    <IonItem>
      <IonIcon
        slot="start"
        icon={serverOutline}
        color={`text-${theme}`}
      />

      <IonSelect
        className={theme}
        value={selectedCount}
        interface="popover"
        justify="space-between"
        interfaceOptions={{
          cssClass: theme,
        }}
        onIonChange={(event) => {
          setPendingCount(Number(event.target.value));
          setIsAlertOpen(true);

          // NOTE: Reset value to selectedCount to prevent flickering:
          // the browser shows the new value first, but React replaces it with the old one before confirmation in IonAlert.
          event.target.value = selectedCount;
        }}
      >
        <div slot="label">
          <IonText
            color={`text-${theme}`}
          >{`${t("Stored cycles count")} (β)`}</IonText>
        </div>
        {countList}
      </IonSelect>
      <IonAlert
        isOpen={isAlertOpen}
        header={t("Confirm selection")}
        subHeader={t(
          "Are you sure you want to change the number of stored cycles?",
        )}
        message={t("Reducing the number will permanently remove some cycles.")}
        buttons={[
          {
            text: t("cancel"),
            role: "cancel",
            handler: () => {
              setPendingCount(null);
            },
          },
          {
            text: "OK",
            role: "confirm",
            handler: () => {
              if (pendingCount !== null) {
                setSelectedCount(pendingCount);
                updateMaxNumberOfDisplayedCycles(pendingCount);
              }
            },
          },
        ]}
        onDidDismiss={() => setIsAlertOpen(false)}
      ></IonAlert>
    </IonItem>
  );
};

const NotificationToggle = () => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { notificationsStatus, updateNotificationsStatus } =
    useContext(SettingsContext);

  return (
    <IonItem>
      <IonIcon
        slot="start"
        icon={notificationsOutline}
        color={`text-${theme}`}
      />
      <IonToggle
        color={`dark-${theme}`}
        checked={notificationsStatus}
        onIonChange={() => {
          updateNotificationsStatus(!notificationsStatus);
        }}
      >
        <IonText color={`text-${theme}`}>{`${t("Notifications")} (β)`}</IonText>
      </IonToggle>
    </IonItem>
  );
};

const Importer = () => {
  const { t } = useTranslation();
  const [confirmAlert] = useIonAlert();

  const updateCycles = useContext(CyclesContext).updateCycles;
  const updateTheme = useContext(ThemeContext).updateTheme;
  const theme = useContext(ThemeContext).theme;

  const onImportClick = async () => {
    console.log("Import config");
    const config = await importConfig();
    await storage.set.cycles(config.cycles);
    await storage.set.theme(config.theme);
    await storage.set.language(config.language);
    updateCycles(config.cycles);
    updateTheme(config.theme);
    changeDateTimeLocale(config.language);
    await changeTranslation(config.language);
    await confirmAlert({
      header: t("Configuration has been imported"),
      cssClass: `${theme}`,
      buttons: [
        {
          text: "OK",
          role: "confirm",
        },
      ],
    });
  };

  return (
    <IonItem
      button
      onClick={() => {
        onImportClick().catch((err) => console.error(err));
      }}
    >
      <IonIcon
        slot="start"
        icon={cloudDownloadOutline}
        color={`text-${theme}`}
      />
      <IonLabel color={`text-${theme}`}>{t("Import config")}</IonLabel>
    </IonItem>
  );
};

const Exporter = () => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext).theme;

  const onExportClick = async () => {
    const cycles = await storage.get.cycles();
    const language = await storage.get.language();
    const theme = await storage.get.theme();
    const notifications = await storage.get.notifications();
    const lastNotificationId = await storage.get.lastNotificationId();
    const maxNumberOfDisplayedCycles =
      await storage.get.maxNumberOfDisplayedCycles();
    await exportConfig({
      cycles,
      language,
      theme,
      notifications,
      lastNotificationId,
      maxNumberOfDisplayedCycles,
    });
  };

  return (
    <IonItem
      button
      onClick={() => {
        onExportClick().catch((err) => console.error(err));
      }}
    >
      <IonIcon
        slot="start"
        icon={cloudUploadOutline}
        color={`text-${theme}`}
      />
      <IonLabel color={`text-${theme}`}>{t("Export config")}</IonLabel>
    </IonItem>
  );
};

interface MenuProps {
  contentId: string;
}

export const Menu = (props: MenuProps) => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext).theme;
  const [needUpdate, setNeedUpdate] = useState(false);

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

  return (
    <IonMenu
      contentId={props.contentId}
      className={theme}
    >
      <IonList lines="none">
        <IonItem lines="full">
          <IonLabel color={`dark-${theme}`}>{t("Preferences")}</IonLabel>
        </IonItem>
        <LanguageSwitcher />
        <ThemeSwitcher />
        <CycleCountSelector />
        {configuration.features.notifications && <NotificationToggle />}
        <IonItem lines="full">
          <IonLabel color={`dark-${theme}`}>{t("Edit")}</IonLabel>
        </IonItem>
        <Importer />
        <Exporter />
        {configuration.features.useCustomVersionUpdate && needUpdate && (
          <IonItem
            button
            onClick={() => {
              downloadLatestRelease().catch((err) => {
                console.error(err);
              });
            }}
          >
            <IonIcon
              slot="start"
              color={`opposite-${theme}`}
              icon={arrowDownOutline}
            />
            <IonLabel color={`opposite-${theme}`}>
              {t("Download latest version")}
            </IonLabel>
          </IonItem>
        )}
      </IonList>
      <IonList
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <IonChip
          outline
          color={`text-${theme}`}
          onClick={() => openGitHubPage()}
        >
          <IonIcon
            icon={logoGithub}
            color={`text-${theme}`}
          />
          <IonLabel>{t("We are on GitHub")}</IonLabel>
        </IonChip>
        <IonItem
          color="none"
          lines="none"
          style={{ width: "100%" }}
        >
          <IonLabel
            style={{ fontSize: "13px" }}
            color="medium"
          >
            Peri - The Period Tracker App
          </IonLabel>
          <IonLabel
            style={{ fontSize: "13px" }}
            color="medium"
            slot="end"
          >
            {configuration.app.version}
          </IonLabel>
        </IonItem>
      </IonList>
    </IonMenu>
  );
};
