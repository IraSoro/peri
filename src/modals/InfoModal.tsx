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

import { getPhase } from "../state/CalculationLogics";

const Phase = () => {
  const lengthOfCycle = useAverageLengthOfCycle();
  const lengthOfPeriod = useLengthOfLastPeriod();
  const currentDay = useDayOfCycle();

  const { t } = useTranslation();

  const phase = getPhase(lengthOfCycle, lengthOfPeriod, Number(currentDay));

  return (
    <>
      <div id="rectangle">
        <IonCard>
          <IonCardHeader class="info">{phase.title}</IonCardHeader>
          <IonCardContent style={{ textAlign: "justify" }}>
            {phase.description}
          </IonCardContent>
        </IonCard>
      </div>
      <div id="small-rectangle"></div>
      <div id="rectangle">
        <IonCard>
          <IonCardHeader class="info">{t("Frequent symptoms")}</IonCardHeader>
          <IonCardContent style={{ textAlign: "justify" }}>
            <SymptomsList symptoms={phase.symptoms} />
          </IonCardContent>
        </IonCard>
      </div>
    </>
  );
};

interface PropsSymptoms {
  symptoms: string[];
}

const SymptomsList = (props: PropsSymptoms) => {
  const list = props.symptoms.map((item, idx) => <p key={idx}>{item}</p>);

  return <>{list}</>;
};

interface PropsInfoModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const InfoModal = (props: PropsInfoModal) => {
  const { t } = useTranslation();

  return (
    <>
      <IonButton
        class="info-button"
        onClick={() => props.setIsOpen(true)}
      >
        {t("learn more about the current state")}
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
          <Phase />
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
