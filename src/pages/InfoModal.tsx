import {
    IonContent,
    IonModal,
    IonItem,
    IonLabel,
    IonButton,
    IonTitle,
    IonList,
} from '@ionic/react';
import './InfoModal.css';

import {
    InfoPhase
} from '../data/Сalculations';

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
            return (<p>none</p>);
        }
        case 1: {
            return (<>
                <p>Fatigue</p>
                <p>Irritability</p>
                <p>Weakness</p>
            </>);
        }
        case 2: {
            return (<>
                <p>Increased energy</p>
                <p>Confidence</p>
                <p>Increased libido</p>
            </>);
        }
        default: {
            return (<>
                <p>Increased appetite</p>
                <p>Tiredness</p>
                <p>Acne</p>
                <p>Fatigue</p>
                <p>Oily hair and skin</p>
            </>);
        }
    }
};

const InfoModal = (props: PropsInfoModal) => {

    return (
        <IonModal isOpen={props.isOpen}>
            <div id="small-rectangle"></div>
            <IonContent className="ion-padding" color="basic">
                <div id="rectangle">
                    <IonList class="transparent">
                        <IonItem>
                            <IonTitle color="dark-basic">{props.info.phaseTitle[0]}</IonTitle>
                        </IonItem>
                        <IonItem lines="none">
                            <IonLabel>{props.info.phaseTitle[1]}</IonLabel>
                        </IonItem>
                        <IonItem lines="none">
                            <IonLabel>{props.info.phaseTitle[2]}</IonLabel>
                        </IonItem>
                    </IonList>
                </div>
                <div id="small-rectangle"></div>
                <div id="rectangle">
                    <IonList class="transparent">
                        <IonItem>
                            <IonTitle color="dark-basic">Symptoms</IonTitle>
                        </IonItem>
                        <IonItem lines="none">
                            <IonLabel>
                                <InfoSymptoms phase={props.info.symptoms} />
                            </IonLabel>
                        </IonItem>
                    </IonList>
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
