import { useContext } from "react";
import { IonContent, IonModal, IonButton, IonCol } from "@ionic/react";
import { useTranslation } from "react-i18next";

import { CyclesContext } from "../state/Context";
import {
  getAverageLengthOfCycle,
  getDayOfCycle,
  getPhase,
  getOvulationStatus,
  getPregnancyChance,
} from "../state/CalculationLogics";

interface PropsInfoModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const InfoModal = (props: PropsInfoModal) => {
  const { t } = useTranslation();
  const cycles = useContext(CyclesContext).cycles;

  const ovulationStatus = getOvulationStatus(cycles);
  const pregnancyChance = getPregnancyChance(cycles);

  const phase = getPhase(cycles);

  return (
    <IonModal
      id="info-modal"
      backdropDismiss={false}
      isOpen={props.isOpen}
    >
      <IonContent
        className="ion-padding"
        color="background"
      >
        <p
          style={{
            fontWeight: "bold",
            fontSize: "25px",
            color: "var(--ion-color-dark-basic)",
            marginBottom: "24px",
          }}
        >
          {`${t("Days", {
            postProcess: "interval",
            count: 1, // NOTE: to indicate which day is in the account, you need to write the day as if in the singular
          })} `}
          {getDayOfCycle(cycles)}/{getAverageLengthOfCycle(cycles)}
        </p>
        <ul>
          <li
            style={{
              fontSize: "16px",
              color: "var(--ion-color-dark)",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                color: "var(--ion-color-dark-basic)",
                fontWeight: "bold",
              }}
            >
              {phase.title}
            </span>
            <span> {t("is current phase of cycle")}</span>
          </li>
          <li
            style={{
              fontSize: "16px",
              color: "var(--ion-color-dark)",
              marginBottom: "20px",
            }}
          >
            <span>{t("Ovulation")}</span>
            <span
              style={{
                color: "var(--ion-color-dark-basic)",
                fontWeight: "bold",
              }}
            >
              {` ${ovulationStatus}`}
            </span>
          </li>
          <li
            style={{
              fontSize: "16px",
              color: "var(--ion-color-dark)",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                color: "var(--ion-color-dark-basic)",
                fontWeight: "bold",
              }}
            >
              {pregnancyChance}
            </span>
            <span> {t("chance of getting pregnant")}</span>
          </li>
        </ul>
        <p
          style={{
            fontWeight: "bold",
            fontSize: "25px",
            color: "var(--ion-color-dark-basic)",
            marginBottom: "24px",
          }}
        >
          {t("Frequent symptoms")}
        </p>
        <ul>
          {phase.symptoms.map((item, idx) => (
            <li
              style={{
                fontSize: "16px",
                color: "var(--ion-color-dark)",
                marginBottom: "20px",
              }}
              key={idx}
            >
              {item}
            </li>
          ))}
        </ul>
        <IonCol>
          <IonButton
            class="main"
            color="dark-basic"
            onClick={() => props.setIsOpen(false)}
          >
            OK
          </IonButton>
        </IonCol>
      </IonContent>
    </IonModal>
  );
};

export default InfoModal;
