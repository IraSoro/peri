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
    InfoPhase
} from '../data/Calculations';

interface PropsInfoModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
    info: InfoPhase;
}

interface PropsPhase {
    phase: number;
}

const InfoSymptoms = (props: PropsPhase) => {
    switch (props.phase) {
        case 0: {
            return (
                <p>This section will indicate the symptoms characteristic of this cycle.</p>
            );
        }
        case 1: {
            return (
                <>
                    <p>lack of energy and strength</p>
                    <p>pain</p>
                    <p>weakness and irritability</p>
                    <p>increased appetite</p>
                </>
            );
        }
        case 2: {
            return (
                <>
                    <p>strength and vigor appear</p>
                    <p>endurance increases</p>
                    <p>new ideas and plans appear</p>
                    <p>libido increases</p>
                </>
            );
        }
        case 3: {
            return (
                <>
                    <p>increased sexual desire</p>
                    <p>optimistic mood</p>
                    <p>mild fever</p>
                    <p>lower abdominal pain</p>
                    <p>chest discomfort and bloating</p>
                    <p>characteristic secretions</p>
                </>);
        }
        default: {
            return (
                <>
                    <p>breast tenderness</p>
                    <p>puffiness</p>
                    <p>acne and skin rashes</p>
                    <p>increased appetite</p>
                    <p>diarrhea or constipation</p>
                    <p>irritability and depressed mood</p>
                </>
            );
        }
    }
};

const InfoModal = (props: PropsInfoModal) => {

    return (
        <IonModal isOpen={props.isOpen}>
            <div id="small-rectangle"></div>
            <IonContent className="ion-padding" color="basic">
                <div id="rectangle">
                    <IonCard>
                        <IonCardHeader class="info">
                            {props.info.phaseTitle[0]}
                        </IonCardHeader>
                        <IonCardContent style={{ textAlign: "justify" }}>
                            {props.info.phaseTitle[1]}
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
                            <InfoSymptoms phase={props.info.symptoms} />
                        </IonCardContent>
                    </IonCard>
                </div>
                <div id="small-rectangle"></div>
                <div id="button-rectangle">
                    <IonButton
                        class="ok-modal"
                        onClick={() => props.setIsOpen(false)}>
                        Ok
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default InfoModal;
