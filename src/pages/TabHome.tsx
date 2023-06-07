import { useEffect, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonModal,
  IonItem,
  IonImg,
  IonLabel,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonButtons,
  IonDatetime,
} from '@ionic/react';
import './TabHome.css';

import Welcome from './WelcomeModal';
import MarkModal from './MarkModal';
import InfoModal from './InfoModal';

import uterus from '../assets/uterus.svg';

import {
  useDayOfCycle,
  useLastStartDate,
  useAverageLengthOfCycle,
} from './CycleInformationHooks';

import { get } from '../data/Storage';
import { calendarClear } from 'ionicons/icons';

import { format } from 'date-fns'

const millisecondsInDay = 24 * 60 * 60 * 1000;

function useOvulationStatus(): string {
  const cycleLength = useAverageLengthOfCycle();
  const dayOfCycle = Number(useDayOfCycle());

  if (!cycleLength || !dayOfCycle) {
    return "";
  }

  const lutealPhaseLength = 14;
  const ovulationDay = Number(cycleLength) - lutealPhaseLength;
  const diffDay = ovulationDay - dayOfCycle;
  if (diffDay === 0) {
    return "today";
  } else if (diffDay < 0) {
    return "finished";
  } else if (diffDay === 1) {
    return "tomorrow"
  }
  return "in " + diffDay + " days";
}

function usePregnancyChance() {
  const ovulationStatus = useOvulationStatus();

  if (!ovulationStatus) {
    return "";
  }

  if (ovulationStatus === "finished") {
    return "low";
  }
  if (["today", "tomorrow"].includes(ovulationStatus)) {
    return "hight";
  }
  return "middle";
}

interface DaysBeforePeriod {
  title: string,
  days: string
}

function useDaysBeforePeriod(): DaysBeforePeriod {
  const startDate = useLastStartDate();
  const cycleLength = useAverageLengthOfCycle();

  if (!startDate || !cycleLength) {
    return { title: "Period in", days: "no info" };
  }

  const dateOfFinish = new Date(startDate);
  dateOfFinish.setDate(dateOfFinish.getDate() + Number(cycleLength));
  const now = new Date();
  let dayBefore = Math.round((Number(dateOfFinish) - Number(now)) / millisecondsInDay);

  if (dayBefore > 0) {
    return { title: "Period in", days: dayBefore + " Days" };
  }
  if (dayBefore === 0) {
    return { title: "Period", days: "Today" };
  }
  return {
    title: "Delay",
    days: Math.abs(dayBefore) + " Days"
  };
}

const MarkPeriodLabel = () => {
  const [isMarkModal, setIsMarkModal] = useState(false);
  const daysBeforePeriod = useDaysBeforePeriod();

  return (
    <div>
      <IonLabel style={{ textAlign: "center" }}>
        <h2>{daysBeforePeriod.title}</h2>
      </IonLabel>
      <IonLabel style={{ textAlign: "center" }} color="dark-basic">
        <h1 style={{ fontWeight: "bold" }}>{daysBeforePeriod.days}</h1>
      </IonLabel>
      <IonButton class="mark-button" onClick={() => {
        setIsMarkModal(true);
      }}
      >
        Mark</IonButton>
      <MarkModal
        isOpen={isMarkModal}
        setIsOpen={setIsMarkModal}
      />
    </div>
  );
}

const TabHome = () => {
  const [isInfoModal, setIsInfoModal] = useState(false);
  const [isWelcomeModal, setIsWelcomeModal] = useState(false);
  const [isCalendarModal, setIsCalendarModal] = useState(false);

  const nowDate = new Date();

  const dayOfCycle = useDayOfCycle();
  const ovulationStatus = useOvulationStatus();
  const pregnancyChance = usePregnancyChance();

  useEffect(() => {
    get("cycles")
      .catch((err) => {
        console.error(`Can't get cycles ${(err as Error).message}`);
        setIsWelcomeModal(true);
      });

  }, []);

  const p_style = {
    fontSize: "10px" as const,
    color: "var(--ion-color-light)" as const
  };

  const h_style = {
    fontWeight: "bold" as const,
    color: "var(--ion-color-light)" as const
  };

  return (
    <IonPage>
      <IonContent color="basic" fullscreen>
        <IonCard class="large-card" color="light">
          <IonCardContent class="align-center">
            <Welcome
              isOpen={isWelcomeModal}
              setIsOpen={setIsWelcomeModal}
            />
            <IonRow>
              <IonCol>
                <IonButton
                  class="calendar-button"
                  fill="outline"
                  onClick={() => setIsCalendarModal(true)}
                >
                  {format(nowDate, 'eee, d MMM yyyy')}
                  <IonIcon slot="end" icon={calendarClear}></IonIcon>
                </IonButton>
                <IonModal
                  id="calendar-modal"
                  isOpen={isCalendarModal}
                >
                  <IonDatetime
                    color="basic"
                    presentation="date"
                    locale="en-GB"
                  >
                    <IonButtons slot="buttons">
                      <IonButton
                        color="basic"
                        onClick={() => {
                          setIsCalendarModal(false);
                        }}
                      >Ok</IonButton>
                    </IonButtons>
                  </IonDatetime>
                </IonModal>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonImg src={uterus} />
              </IonCol>
              <IonCol>
                <MarkPeriodLabel />
              </IonCol>
            </IonRow>
            <IonCard color="basic">
              <IonCardContent>
                <IonItem color="basic" lines="full">
                  <IonLabel>
                    <p style={p_style}>Current cycle day</p>
                    <h1 style={h_style}>{dayOfCycle}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem color="basic" lines="full">
                  <IonLabel>
                    <p style={p_style}>Ovulation</p>
                    <h1 style={h_style}>{ovulationStatus}</h1>
                  </IonLabel>
                </IonItem>
                <IonItem color="basic" lines="none">
                  <IonLabel>
                    <p style={p_style}>Chance of getting pregnant</p>
                    <h1 style={h_style}>{pregnancyChance}</h1>
                  </IonLabel>
                </IonItem>
              </IonCardContent>
            </IonCard>
            <IonButton onClick={() => setIsInfoModal(true)} class="info-button">learn more about the current state</IonButton>
            <InfoModal
              isOpen={isInfoModal}
              setIsOpen={setIsInfoModal}
            />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage >
  );
};

export default TabHome;
