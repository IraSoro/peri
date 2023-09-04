import { useContext, useRef } from "react";
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonModal,
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
import { appVersion } from "../data/AppVersion";
import { CyclesContext } from "../state/Context";
import { useAverageLengthOfCycle } from "../state/CycleInformationHooks";
import {
  getNewCyclesHistory,
  getActiveDates,
  getLastPeriodDays,
} from "../state/CalculationLogics";

import "./Menu.css";

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
    await exportConfig({ cycles, language });
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

interface EditProps {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const CyclesEditor = (props: EditProps) => {
  const { t } = useTranslation();
  const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);

  const { cycles, updateCycles } = useContext(CyclesContext);
  const averLengthOfCycle = useAverageLengthOfCycle();

  const isActiveDates = (dateString: string) => {
    return getActiveDates(dateString, cycles, averLengthOfCycle);
  };

  return (
    <>
      <IonModal
        isOpen={props.isOpen}
        backdropDismiss={false}
      >
        <IonContent
          className="ion-padding"
          color="basic"
        >
          <IonItem
            color="basic"
            lines="none"
          />
          <IonDatetime
            class="edit-modal"
            ref={datetimeRef}
            color="white-basic"
            presentation="date"
            locale={t("locale")}
            size="cover"
            multiple
            firstDayOfWeek={1}
            value={getLastPeriodDays(cycles)}
            isDateEnabled={isActiveDates}
          />

          <IonItem
            color="basic"
            lines="none"
          />

          <IonButton
            class="edit-buttons"
            color="dark-basic"
            fill="solid"
            onClick={() => {
              if (datetimeRef.current?.value) {
                const newCycles = getNewCyclesHistory(
                  [datetimeRef.current.value].flat(),
                );
                updateCycles(newCycles);
              }
              datetimeRef.current?.confirm().catch((err) => console.error(err));
              props.setIsOpen(false);
            }}
          >
            {t("save")}
          </IonButton>
          <IonButton
            class="edit-buttons"
            color="dark-basic"
            fill="outline"
            onClick={() => {
              datetimeRef.current?.cancel().catch((err) => console.error(err));
              props.setIsOpen(false);
            }}
          >
            {t("cancel")}
          </IonButton>
        </IonContent>
      </IonModal>
      <IonItem
        button
        onClick={() => {
          props.setIsOpen(true);
        }}
      >
        <IonIcon
          slot="start"
          icon={createOutline}
        />
        <IonLabel>{t("Edit cycles")}</IonLabel>
      </IonItem>
    </>
  );
};

interface MenuProps {
  contentId: string;
  isEditModal: boolean;
  setIsEditModal: (newIsOpen: boolean) => void;
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
        <CyclesEditor
          isOpen={props.isEditModal}
          setIsOpen={props.setIsEditModal}
        />
      </IonList>
      <IonItem>
        <IonLabel color="medium">
          The Period Tracker App Peri v{appVersion}
        </IonLabel>
      </IonItem>
    </IonMenu>
  );
};
