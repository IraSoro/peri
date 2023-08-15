import { useContext } from "react";
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
  cloudDownloadOutline,
  cloudUploadOutline,
  createOutline,
  globeOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { storage } from "../data/Storage";
import { exportConfig, importConfig } from "../data/Config";
import { CyclesContext } from "../state/Context";

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  type LanguageCode = string;
  type Language = string;
  const supportedLanguages = new Map<LanguageCode, Language>([
    ["en", "english"],
    ["ru", "русский"],
  ]);

  const changeLanguage = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    await storage.set.language(languageCode);
  };

  const languages = [];
  for (const [code, language] of supportedLanguages.entries()) {
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
      <IonLabel color="dark">{t("Language")}</IonLabel>
      <IonSelect
        value={i18n.language}
        placeholder={supportedLanguages.get(i18n.language)}
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
      header: "Configuration has been imported",
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
    await exportConfig({ cycles });
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

const CyclesEditor = () => {
  const { t } = useTranslation();

  return (
    <IonItem
      button
      onClick={() => {
        console.log("Click on CyclesEditor");
      }}
    >
      <IonIcon
        slot="start"
        icon={createOutline}
      />
      <IonLabel>{t("Edit Cycles")}</IonLabel>
    </IonItem>
  );
};

interface MenuProps {
  contentId: string;
}

export const Menu = (props: MenuProps) => {
  const { t } = useTranslation();

  return (
    <IonMenu
      contentId={props.contentId}
      side="end"
    >
      <IonList lines="none">
        <IonItem lines="full">
          <IonLabel color="primary">{t("Preferences")}</IonLabel>
        </IonItem>
        <LanguageSwitcher />
        <IonItem lines="full">
          <IonLabel color="primary">{t("Edit")}</IonLabel>
        </IonItem>
        <Importer />
        <Exporter />
        <CyclesEditor />
      </IonList>
    </IonMenu>
  );
};
