import {
    IonContent,
    IonModal,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
} from '@ionic/react';
import './InfoModal.css';

import { phases } from "../data/PhasesConst";

import {
    useLengthOfLastPeriod,
    useAverageLengthOfCycle,
    useDayOfCycle,
} from './CycleInformationHooks';

interface PropsInfoModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

interface PropsSymptoms {
    symptoms: string[];
}

function getPhase(lengthOfCycle: number, lengthOfPeriod: number, currentDay: number) {
    const lutealPhaseLength = 14;
    const ovulationOnError = 3;

    if (!lengthOfCycle || !currentDay || !lengthOfPeriod) {
        return phases[0];
    }

    const ovulationDay = lengthOfCycle - lutealPhaseLength;

    if (currentDay <= lengthOfPeriod) {
        return phases[1];
    }
    if (currentDay <= (ovulationDay - ovulationOnError)) {
        return phases[2];
    }
    if (currentDay <= ovulationDay) {
        return phases[3];
    }
    return phases[4];
}

const SymptomsList = (props: PropsSymptoms) => {
    const list = props.symptoms.map((item, idx) =>
        <p key={idx}>{item}</p>
    );

    return (
        <>{list}</>
    );
}

const InfoModal = (props: PropsInfoModal) => {
    const lengthOfPeriod = useLengthOfLastPeriod();
    const lengthOfCycle = useAverageLengthOfCycle();
    const currentDay = Number(useDayOfCycle());
    const phase = getPhase(lengthOfCycle, lengthOfPeriod, currentDay);

    return (
        <IonModal isOpen={props.isOpen}>
            <div id="small-rectangle"></div>
            <IonContent className="ion-padding" color="basic">
                <div id="rectangle">
                    <IonCard>
                        <IonCardHeader class="info">
                            {phase.title}
                        </IonCardHeader>
                        <IonCardContent style={{ textAlign: "justify" }}>
                            {phase.description}
                        </IonCardContent>
                    </IonCard>
                </div>
                <div id="small-rectangle"></div>
                <div id="rectangle">
                    <IonCard>
                        <IonCardHeader class="info">
                            Frequent symptoms
                        </IonCardHeader>
                        <IonCardContent style={{ textAlign: "justify" }}>
                            <SymptomsList symptoms={phase.symptoms} />
                        </IonCardContent>
                    </IonCard>
                </div>
                <div id="small-rectangle"></div>
                <IonButton
                    class="ok-modal"
                    onClick={() => props.setIsOpen(false)}>
                    Ok
                </IonButton>
            </IonContent>
        </IonModal>
    );
};

export default InfoModal;
