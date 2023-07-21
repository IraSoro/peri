import { useContext } from "react";
import {
  IonContent,
  IonPage,
  IonLabel,
  IonProgressBar,
  IonItem,
  IonList,
  IonButton,
  IonIcon,
  useIonAlert,
} from "@ionic/react";
import { cloudDownloadOutline, cloudUploadOutline } from "ionicons/icons";
import "./TabDetails.css";

import {
  useDayOfCycle,
  useLengthOfLastPeriod,
  useAverageLengthOfCycle,
  useAverageLengthOfPeriod,
  useLastStartDate,
} from "../state/CycleInformationHooks";
import { useTranslation } from "react-i18next";
import { CyclesContext } from "../state/Context";
import { exportConfig, importConfig } from "../data/Config";
import { storage } from "../data/Storage";

function useTitleLastCycle() {
  const dayOfCycle = useDayOfCycle();
  const { t } = useTranslation();

  if (!dayOfCycle) {
    return "";
  }

  if (dayOfCycle === "1") {
    return `1 ${t("detailsTab.currentDay")}`;
  }
  return `${dayOfCycle} ${t("detailsTab.currentDays")}`;
}

function useProgressBarBuffer() {
  const dayOfCycle = useDayOfCycle();
  const defaultLengthOfCycle = 28;

  if (!dayOfCycle) {
    return defaultLengthOfCycle;
  }
  return Number(dayOfCycle);
}

interface InfoOneCycle {
  lengthOfCycleString: string;
  lengthOfCycleNumber: number;
  lengthOfPeriod: number;
  dates: string;
}

export function useInfoForOneCycle(idx: number): InfoOneCycle {
  const cycles = useContext(CyclesContext).cycles;
  const { t } = useTranslation();

  if (!cycles || cycles.length <= idx) {
    const defaultLengthOfCycle = 28;

    return {
      lengthOfCycleNumber: defaultLengthOfCycle,
      lengthOfCycleString: t("detailsTab.cycleLen"),
      lengthOfPeriod: 0,
      dates: t("detailsTab.date"),
    };
  }
  const cycleLenNumber: number = cycles[idx].cycleLength;
  let cycleLenString: string;
  if (
    cycleLenNumber > 20 &&
    cycleLenNumber % 10 > 0 &&
    cycleLenNumber % 10 < 5
  ) {
    cycleLenString = `${cycleLenNumber} ${t("detailsTab.daysLess5")}`;
  } else {
    cycleLenString = `${cycleLenNumber} ${t("detailsTab.days")}`;
  }

  const periodLenNumber: number = cycles[idx].periodLength;

  const dateStart: Date = new Date(cycles[idx].startDate);
  const dateFinish: Date = new Date(cycles[idx].startDate);
  dateFinish.setDate(dateFinish.getDate() + cycleLenNumber - 1);
  const dates = `${dateStart.toLocaleDateString()} - ${dateFinish.toLocaleDateString()}`;

  return {
    lengthOfCycleNumber: cycleLenNumber,
    lengthOfCycleString: cycleLenString,
    lengthOfPeriod: periodLenNumber,
    dates: dates,
  };
}

const CurrentCycle = () => {
  const title = useTitleLastCycle();
  const startDate = useLastStartDate();
  const lengthOfPeriod = useLengthOfLastPeriod();
  const progressBarBuffer = useProgressBarBuffer();

  const { t } = useTranslation();

  return (
    <IonItem
      class="transparent-center"
      lines="none"
    >
      <IonLabel position="stacked">
        {title ? (
          <h2>{`${t("detailsTab.currentCycle")}: ${title}`}</h2>
        ) : (
          <h2>{t("detailsTab.currentCycle")}</h2>
        )}
      </IonLabel>
      <IonLabel position="stacked">
        {startDate ? (
          <p>{`${t("detailsTab.startedDate")} ${new Date(
            startDate,
          ).toLocaleDateString()}`}</p>
        ) : (
          <p>{t("detailsTab.startedDate")}</p>
        )}
      </IonLabel>
      <IonLabel position="stacked">
        <IonProgressBar
          class="current-progress"
          value={(lengthOfPeriod / 100) * 3}
          buffer={(progressBarBuffer / 100) * 3}
        ></IonProgressBar>
      </IonLabel>
    </IonItem>
  );
};

interface IdxProps {
  idx: number;
}

const ItemProgress = (props: IdxProps) => {
  const info = useInfoForOneCycle(props.idx);

  return (
    <IonItem
      class="transparent-center"
      lines="none"
    >
      <IonLabel position="stacked">
        <h2>{info.lengthOfCycleString}</h2>
      </IonLabel>
      <IonLabel position="stacked">
        <p>{info.dates}</p>
      </IonLabel>
      <IonLabel position="stacked">
        <IonProgressBar
          value={(info.lengthOfPeriod / 100) * 3}
          buffer={(info.lengthOfCycleNumber / 100) * 3}
        ></IonProgressBar>
      </IonLabel>
    </IonItem>
  );
};

const ListProgress = () => {
  const numbers = [1, 2, 3, 4, 5];
  const list = numbers.map((idx) => (
    <ItemProgress
      key={idx}
      idx={idx}
    />
  ));

  return <>{list}</>;
};

const TabDetails = () => {
  const { t } = useTranslation();

  const [confirmAlert] = useIonAlert();

  const averageLengthOfCycle = useAverageLengthOfCycle();
  const averageLengthOfPeriod = useAverageLengthOfPeriod();
  let lengthOfCycle: string;
  let lengthOfPeriod: string;

  if (
    averageLengthOfCycle >= 20 &&
    averageLengthOfCycle % 10 < 5 &&
    averageLengthOfCycle % 10 > 0
  ) {
    lengthOfCycle = `${averageLengthOfCycle} ${t("detailsTab.daysLess5")}`;
  } else {
    lengthOfCycle = `${averageLengthOfCycle} ${t("detailsTab.days")}`;
  }

  if (averageLengthOfPeriod < 5 && averageLengthOfPeriod > 0) {
    lengthOfPeriod = `${averageLengthOfPeriod} ${t("detailsTab.daysLess5")}`;
  } else {
    lengthOfPeriod = `${averageLengthOfPeriod} ${t("detailsTab.days")}`;
  }

  const updateCycles = useContext(CyclesContext).updateCycles;

  const p_style = {
    fontSize: "10px" as const,
    color: "var(--ion-color-basic)" as const,
    textAlign: "center" as const,
  };

  const h_style = {
    fontWeight: "bold" as const,
    color: "var(--ion-color-dark-basic)" as const,
    textAlign: "center" as const,
  };

  return (
    <IonPage>
      <IonContent
        color="basic"
        fullscreen
      >
        <div id="rectangle-top">
          <div id="circle">
            <IonLabel>
              <p style={p_style}>{t("detailsTab.periodLen")}</p>
              <h1 style={h_style}>{lengthOfPeriod}</h1>
              <p style={p_style}>{t("detailsTab.cycleLen")}</p>
              <h1 style={h_style}>{lengthOfCycle}</h1>
            </IonLabel>
          </div>
        </div>
        <div>
          <IonButton
            color="dark-basic"
            onClick={() => {
              importConfig()
                .then((config) => {
                  storage.set
                    .cycles(config.cycles)
                    .then(() => {
                      updateCycles(config.cycles);

                      confirmAlert({
                        header: "Configuration has been imported",
                        cssClass: "header-color",
                        buttons: [
                          {
                            text: "OK",
                            role: "confirm",
                          },
                        ],
                      }).catch((err) => console.error(err));
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                })
                .catch((err) => {
                  console.error(err);
                });
            }}
          >
            <IonIcon
              slot="start"
              icon={cloudDownloadOutline}
            />
            {t("detailsTab.import")}
          </IonButton>
          <IonButton
            color="dark-basic"
            disabled={averageLengthOfCycle === 0}
            onClick={() => {
              storage.get
                .cycles()
                .then((cycles) => {
                  exportConfig({ cycles }).catch((err) => {
                    console.error(err);
                  });
                })
                .catch((err) => {
                  console.error(err);
                });
            }}
          >
            <IonIcon
              slot="start"
              icon={cloudUploadOutline}
            />
            {t("detailsTab.export")}
          </IonButton>
        </div>
        <div id="rectangle-bottom">
          <IonList class="transparent-center">
            <CurrentCycle />
            <ListProgress />
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TabDetails;
