import { useEffect, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonItem,
  IonImg,
  IonLabel,
  IonRow,
  IonCol,
} from '@ionic/react';
import './TabHome.css';

import Welcome from '../modals/WelcomeModal';
import MarkModal from '../modals/MarkModal';
import InfoModal from '../modals/InfoModal';
import CalendarModal from '../modals/CalendarModal';

import uterus from '../assets/uterus.svg';

import {
  useDayOfCycle,
  useLastStartDate,
  useAverageLengthOfCycle,
} from '../state/CycleInformationHooks';

import { get } from '../data/Storage';

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

const TabHome = () => {
  const [isWelcomeModal, setIsWelcomeModal] = useState(false);

  const dayOfCycle = useDayOfCycle();
  const ovulationStatus = useOvulationStatus();
  const pregnancyChance = usePregnancyChance();
  const daysBeforePeriod = useDaysBeforePeriod();

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
                <CalendarModal />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonImg src={uterus} />
              </IonCol>
              <IonCol>
                <div>
                  <IonLabel style={{ textAlign: "center" }}>
                    <h2>{daysBeforePeriod.title}</h2>
                  </IonLabel>
                  <IonLabel style={{ textAlign: "center" }} color="dark-basic">
                    <h1 style={{ fontWeight: "bold" }}>{daysBeforePeriod.days}</h1>
                  </IonLabel>
                  <MarkModal />
                </div>
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
            <InfoModal />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage >
  );
};

export default TabHome;
