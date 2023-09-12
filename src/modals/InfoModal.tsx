import { useContext } from "react";
import {
  IonContent,
  IonModal,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
} from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslation } from "react-i18next";
import "./InfoModal.css";

import { CyclesContext } from "../state/Context";
import {
  getLengthOfLastPeriod,
  getAverageLengthOfCycle,
  getDayOfCycle,
  getPhase,
} from "../state/CalculationLogics";

import { Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";

const Phase = () => {
  const cycles = useContext(CyclesContext).cycles;

  const lengthOfCycle = getAverageLengthOfCycle(cycles);
  const lengthOfPeriod = getLengthOfLastPeriod(cycles);
  const currentDay = getDayOfCycle(cycles);

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
  return (
    <IonModal
      id="info-modal"
      backdropDismiss={false}
      isOpen={props.isOpen}
    >
      <Swiper
        modules={[Pagination]}
        pagination={true}
      >
        <SwiperSlide key={1}>
          <IonContent
            fullscreen
            color="dark-basic"
          >
            <IonButton onClick={() => props.setIsOpen(false)}></IonButton>
            Slide 1
          </IonContent>
        </SwiperSlide>
        <SwiperSlide key={2}>
          <IonContent
            fullscreen
            color="medium"
          >
            Slide 2
          </IonContent>
        </SwiperSlide>
        <SwiperSlide key={3}>
          <IonContent
            fullscreen
            color="basic"
          >
            Slide 3
          </IonContent>
        </SwiperSlide>
      </Swiper>
    </IonModal>
  );
};

export default InfoModal;
