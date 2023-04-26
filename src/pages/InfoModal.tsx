import {
    IonContent,
    IonModal,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
} from '@ionic/react';
import './InfoModal.css';

import {
    usePhase
} from './CycleInformationHooks';

interface PropsInfoModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

interface PropsSymptoms {
    symptoms: string[];
}

const SymptomsList = (props: PropsSymptoms) => {
    const list = props.symptoms.map((item) =>
        <p>{item}</p>
    );

    return (
        <>{list}</>
    );
}

const InfoModal = (props: PropsInfoModal) => {
    const phase = usePhase();

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
