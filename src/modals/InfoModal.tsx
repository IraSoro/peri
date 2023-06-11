import { useRef } from 'react';
import {
    IonContent,
    IonModal,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
    useIonViewDidEnter,
} from '@ionic/react';
import './InfoModal.css';

import { App } from '@capacitor/app';

import { phases } from "../data/PhasesConst";

import {
    useLengthOfLastPeriod,
    useAverageLengthOfCycle,
    useDayOfCycle,
} from '../state/CycleInformationHooks';
import { useHistory } from 'react-router';

function usePhase() {
    const lutealPhaseLength = 14;
    const ovulationOnError = 3;

    const lengthOfPeriod = useLengthOfLastPeriod();
    const lengthOfCycle = useAverageLengthOfCycle();
    const currentDay = Number(useDayOfCycle());

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

interface PropsSymptoms {
    symptoms: string[];
}

const SymptomsList = (props: PropsSymptoms) => {
    const list = props.symptoms.map((item, idx) =>
        <p key={idx}>{item}</p>
    );

    return (
        <>{list}</>
    );
}

const InfoModal = () => {
    const phase = usePhase();

    const history = useHistory();
    const modalRef = useRef<HTMLIonModalElement>(null);

    useIonViewDidEnter(() => {
        const backButtonHandler = () => {
            modalRef.current?.dismiss();
            history.push('/home');
        };

        App.addListener('backButton', backButtonHandler);

        return () => {
            App.removeAllListeners();
        };
    });

    return (
        <>
            <IonButton
                id="open-info-modal"
                class="info-button">
                learn more about the current state
            </IonButton>
            <IonModal
                backdropDismiss={false}
                trigger="open-info-modal"
                ref={modalRef}
            >
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
                        onClick={() => modalRef.current?.dismiss()}
                    >
                        Ok
                    </IonButton>
                </IonContent>
            </IonModal>
        </>
    );
};

export default InfoModal;
