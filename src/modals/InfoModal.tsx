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

  const { t } = useTranslation();
  const phases = {
    non: {
      title: t("The menstrual cycle can be divided into 4 phases."),
      description: t(
        "When information about your cycle appears, it will be reported which phase you are in.",
      ),
      symptoms: [
        t(
          "This section will indicate the symptoms characteristic of this cycle.",
        ),
      ],
    },
    menstrual: {
      title: t("Menstrual phase"),
      description: t("This cycle is accompanied by low hormone levels."),
      symptoms: [
        t("lack of energy and strength"),
        t("pain"),
        t("weakness and irritability"),
        t("increased appetite"),
      ],
    },
    follicular: {
      title: t("Follicular phase"),
      description: t(
        "The level of estrogen in this phase rises and reaches a maximum level.",
      ),
      symptoms: [
        t("strength and vigor appear"),
        t("endurance increases"),
        t("new ideas and plans appear"),
        t("libido increases"),
      ],
    },
    ovulation: {
      title: t("Ovulation phase"),
      description: t(
        "Once estrogen levels peak, they trigger the release of two important ovulation hormones, follicle-stimulating hormone and luteinizing hormone.",
      ),
      symptoms: [
        t("increased sexual desire"),
        t("optimistic mood"),
        t("mild fever"),
        t("lower abdominal pain"),
        t("chest discomfort and bloating"),
        t("characteristic secretions"),
      ],
    },
    luteal: {
      title: t("Luteal phase"),
      description: t(
        "Levels of the hormones estrogen and progesterone first rise and then drop sharply just before a period. Progesterone reaches its peak in the luteal phase.",
      ),
      symptoms: [
        t("breast tenderness"),
        t("puffiness"),
        t("acne and skin rashes"),
        t("increased appetite"),
        t("diarrhea or constipation"),
        t("irritability and depressed mood"),
      ],
    },
  };

  if (!lengthOfCycle || !currentDay || !lengthOfPeriod) {
    return phases.non;
  }

  const ovulationDay = lengthOfCycle - lutealPhaseLength;

  if (currentDay <= lengthOfPeriod) {
    return phases.menstrual;
  }
  if (currentDay <= ovulationDay - ovulationOnError) {
    return phases.follicular;
  }
  if (currentDay <= ovulationDay) {
    return phases.ovulation;
  }
  return phases.luteal;
}

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
  const phase = usePhase();
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
              <IonCardHeader class="info">
                {t("Frequent symptoms")}
              </IonCardHeader>
              <IonCardContent style={{ textAlign: "justify" }}>
                <SymptomsList symptoms={phase.symptoms} />
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
