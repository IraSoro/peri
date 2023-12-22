import { useContext, useEffect, useState } from "react";
import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonSelect,
  IonSelectOption,
  useIonAlert,
} from "@ionic/react";
import {
  arrowDownOutline,
  cloudDownloadOutline,
  cloudUploadOutline,
  globeOutline,
  colorFilterOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { storage } from "../data/Storage";
import { exportConfig, importConfig } from "../data/Config";
import {
  appVersion,
  downloadLatestRelease,
  isNewVersionAvailable,
} from "../data/AppVersion";
import { CyclesContext, ThemeContext } from "../state/Context";
import {
  changeTranslation,
  getCurrentTranslation,
  supportedLanguages,
} from "../utils/translation";
import { changeDateTimeLocale } from "../utils/datetime";

const LanguageSwitcher = () => {
  const { t } = useTranslation();

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
      />
      <IonLabel>{t("Language")}</IonLabel>
      <IonSelect
        value={getCurrentTranslation()}
        interface="popover"
        onIonChange={(event) => {
          changeLanguage(event.target.value as string).catch((err) => {
            console.error(err);
          });
        }}
      >
        {languages}
      </IonSelect>
    </IonItem>
  );
};

const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const { theme, updateTheme } = useContext(ThemeContext);

  const themesList = [];
  for (const item of ["basic", "pink"]) {
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
        icon={colorFilterOutline}
      />

      <IonLabel>{t("Theme")}</IonLabel>
      <IonSelect
        value={theme}
        interface="popover"
        onIonChange={(event) => updateTheme(event.target.value as string)}
      >
        {themesList}
      </IonSelect>
    </IonItem>
  );
};

const Importer = () => {
  const { t } = useTranslation();
  const [confirmAlert] = useIonAlert();
  const updateCycles = useContext(CyclesContext).updateCycles;

  const onImportClick = async () => {
    console.log("Import config");
    const config = await importConfig();
    await storage.set.cycles(config.cycles);
    updateCycles(config.cycles);
    await confirmAlert({
      header: t("Configuration has been imported"),
      cssClass: "header-color",
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
      />
      <IonLabel>{t("Import config")}</IonLabel>
    </IonItem>
  );
};

const Exporter = () => {
  const { t } = useTranslation();

  const onExportClick = async () => {
    const cycles = await storage.get.cycles();
    const language = await storage.get.language();
    const theme = await storage.get.theme();
    await exportConfig({ cycles, language, theme });
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
      />
      <IonLabel>{t("Export config")}</IonLabel>
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
    <IonMenu contentId={props.contentId}>
      <IonList lines="none">
        <IonItem lines="full">
          <IonLabel color={`dark-${theme}`}>{t("Preferences")}</IonLabel>
        </IonItem>
        <LanguageSwitcher />
        <ThemeSwitcher />
        <IonItem lines="full">
          <IonLabel color={`dark-${theme}`}>{t("Edit")}</IonLabel>
        </IonItem>
        <Importer />
        <Exporter />
        {needUpdate && (
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
      <IonItem>
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
          {appVersion}
        </IonLabel>
      </IonItem>
    </IonMenu>
  );
};
