import {
  IonContent,
  IonModal,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import "./InfoModal.css";

import {
  useLengthOfLastPeriod,
  useAverageLengthOfCycle,
  useDayOfCycle,
} from "../state/CycleInformationHooks";

function usePhase() {
  const lutealPhaseLength = 14;
  const ovulationOnError = 3;

  const lengthOfPeriod = useLengthOfLastPeriod();
  const lengthOfCycle = useAverageLengthOfCycle();
  const currentDay = Number(useDayOfCycle());

  if (!lengthOfCycle || !currentDay || !lengthOfPeriod) {
    return "non";
  }

  const ovulationDay = lengthOfCycle - lutealPhaseLength;

  if (currentDay <= lengthOfPeriod) {
    return "menstrual";
  }
  if (currentDay <= ovulationDay - ovulationOnError) {
    return "follicular";
  }
  if (currentDay <= ovulationDay) {
    return "ovulation";
  }
  return "luteal";
}

interface PropsSymptoms {
  countSymptoms: string;
  phase: string;
}

const SymptomsList = (props: PropsSymptoms) => {
  const { t } = useTranslation();
  const list = [];

  for (let i = 0; i < Number(props.countSymptoms); ++i) {
    list.push(
      <p key={i}>{t(`infoModal.phases.${props.phase}.symptoms.${i}`)}</p>,
    );
  }

  return <>{list}</>;
};

interface PropsInfoModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const InfoModal = (props: PropsInfoModal) => {
  const phase = usePhase();
  const { t } = useTranslation();

  return (
    <>
      <IonButton
        class="info-button"
        onClick={() => props.setIsOpen(true)}
      >
        {t("infoModal.title")}
      </IonButton>
      <IonModal
        id="info-modal"
        backdropDismiss={false}
        isOpen={props.isOpen}
      >
        <div id="small-rectangle"></div>
        <IonContent
          className="ion-padding"
          color="basic"
        >
          <div id="rectangle">
            <IonCard>
              <IonCardHeader class="info">
                {t(`infoModal.phases.${phase}.title`)}
              </IonCardHeader>
              <IonCardContent style={{ textAlign: "justify" }}>
                {t(`infoModal.phases.${phase}.description`)}
              </IonCardContent>
            </IonCard>
          </div>
          <div id="small-rectangle"></div>
          <div id="rectangle">
            <IonCard>
              <IonCardHeader class="info">
                {t("infoModal.frequentSymptoms")}
              </IonCardHeader>
              <IonCardContent style={{ textAlign: "justify" }}>
                <SymptomsList
                  countSymptoms={t(`infoModal.phases.${phase}.countSymptoms`)}
                  phase={phase}
                />
              </IonCardContent>
            </IonCard>
          </div>
          <div id="small-rectangle"></div>
          <IonButton
            class="ok-modal"
            color="dark-basic"
            onClick={() => props.setIsOpen(false)}
          >
            Ok
          </IonButton>
        </IonContent>
      </IonModal>
    </>
  );
};

export default InfoModal;
