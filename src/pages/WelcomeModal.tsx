// import { useState } from 'react';
import {
    IonButton,
    IonContent,
    IonItem,
    IonList,
    IonLabel,
    IonModal,
    IonInput,
    IonDatetimeButton,
    IonDatetime,
    IonCol,
    IonImg,
    IonTitle,
    IonToolbar,
    IonHeader,
} from '@ionic/react';
import './WelcomeModal.css';

import { set } from '../data/Storage';

interface PropsWelcomeModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

const Welcome = (props: PropsWelcomeModal) => {
    return (
        <IonModal isOpen={props.isOpen}>
            <IonHeader class="ion-no-border">
                <IonToolbar color="light">
                    <IonTitle color="dark-basic">Hello!</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen color="basic">
                <div id="welcome-rectangle">
                    <IonList class="transparent-list">
                        <IonCol>
                            <IonLabel
                                style={{ fontWeight: "bold" }}
                                color="dark-basic"
                            >
                                Please enter your details so that you can already make a forecast.
                            </IonLabel>
                        </IonCol>
                        <IonItem color="light">
                            <IonLabel>Cycle length</IonLabel>
                            <IonInput
                                type="number"
                                placeholder="none"
                                min="14"
                                max="99"
                            >
                            </IonInput>
                        </IonItem>
                        <IonItem color="light">
                            <IonLabel>Period length</IonLabel>
                            <IonInput
                                type="number"
                                placeholder="none"
                                min="1"
                                max="9"
                            >
                            </IonInput>
                        </IonItem>
                        <IonItem lines="none" color="light">
                            <IonLabel>Start of last period</IonLabel>
                            <IonDatetimeButton datetime="datetime">
                            </IonDatetimeButton>
                            <IonModal keepContentsMounted={true}>
                                <IonDatetime
                                    color="basic"
                                    presentation="date"
                                    id="datetime"
                                    locale="en-US"
                                >
                                </IonDatetime>
                            </IonModal>
                        </IonItem>
                    </IonList>
                </div>
                <div id="welcome-rectangle-bottom"></div>
                <IonList class="transparent-list">
                    <IonCol>
                        <IonLabel color="dark-basic">
                            <h2 style={{ fontWeight: "bold" }}>
                                But also you can just continue by clicking on the button.
                            </h2>
                        </IonLabel>
                    </IonCol>
                    <IonCol>
                        <IonImg class="img-welcome" src='../../assets/white-uterus.svg' />
                    </IonCol>
                    <IonCol>
                        <IonButton
                            class="continue-button"
                            onClick={() => {
                                props.setIsOpen(false);
                                set("welcome", true);
                            }}
                        >
                            Continue
                        </IonButton>
                    </IonCol>
                </IonList>
            </IonContent>
        </IonModal>
    );
}

export default Welcome;
