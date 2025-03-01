import { useContext } from "react";
import { IonContent, IonModal, IonButton, IonCol } from "@ionic/react";
import { useTranslation } from "react-i18next";

import { CyclesContext, ThemeContext } from "../state/Context";
import {
  getAverageLengthOfCycle,
  getDayOfCycle,
  getPhase,
  getOvulationStatus,
  getPregnancyChance,
} from "../state/CalculationLogics";

import "./InfoModal.css";

interface PropsInfoModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

export const InfoModal = (props: PropsInfoModal) => {
  const { t } = useTranslation();
  const cycles = useContext(CyclesContext).cycles;
  const theme = useContext(ThemeContext).theme;

  const lengthOfCycle = getAverageLengthOfCycle(cycles);
  const currentDay = getDayOfCycle(cycles);
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
        color={`transparent-${theme}`}
      >
        <div className="info-screen">
          <p className={`info-title-${theme}`}>
            {`${t("Days", {
              postProcess: "interval",
              count: 1, // NOTE: to indicate which day is in the account, you need to write the day as if in the singular
            })} `}
            {cycles.length === 1 ? (
              currentDay
            ) : (
              <>
                {currentDay}/{lengthOfCycle}
              </>
            )}
          </p>
          <ul>
            <li className={`info-item-${theme}`}>
              <span className={`info-item-${theme}`}>{phase.title}</span>
              <span> {t("is current phase of cycle")}</span>
            </li>
            <li className={`info-item-${theme}`}>
              <span>{t("Ovulation")}</span>
              <span className={`info-item-${theme}`}>
                {` ${ovulationStatus}`}
              </span>
            </li>
            <li className={`info-item-${theme}`}>
              <span className={`info-item-${theme}`}>{pregnancyChance}</span>
              <span> {t("chance of getting pregnant")}</span>
            </li>
          </ul>
          <p className={`info-title-${theme}`}>{t("Frequent symptoms")}</p>
          <ul>
            {phase.symptoms.map((item, idx) => (
              <li
                className={`info-item-${theme}`}
                key={idx}
              >
                {item}
              </li>
            ))}
          </ul>
          <IonCol>
            <IonButton
              className="main"
              color={`dark-${theme}`}
              onClick={() => props.setIsOpen(false)}
            >
              OK
            </IonButton>
          </IonCol>
        </div>
      </IonContent>
    </IonModal>
  );
};
