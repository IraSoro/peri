import React, { useState, useEffect } from 'react';
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

import { get } from '../data/Storage';
import {
    CycleData,
} from '../data/Сalculations';

interface PropsInfoModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

const infoPhase: string[][] = [
    ["none phase", "none progesterone levels", "none estrogen levels"],
    ["Menstrual phase", "low progesterone levels", "low estrogen levels"],
    ["Follicular phase", "progesterone levels rise", "estrogen levels rise"],
    ["Ovulation phase", "high progesterone levels", "high estrogen levels"],
    ["Luteal phase", "progesterone levels drop", "estrogen levels drop"],
    ["Luteal phase", "progesterone levels rise", "estrogen levels rise"],
    ["Luteal phase", "progesterone levels drop", "estrogen levels drop"],
];

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
    const [phase, setPhase] = useState(infoPhase[0]);
    const [symptoms, setSymptoms] = useState(0);

    const getCurrentCycleDay = (date: string) => {
        const msInDay = 24 * 60 * 60 * 1000;

        let date1: Date = new Date(date);
        let now: Date = new Date();
        let currentDay = Math.ceil(Math.abs(Number(now) - Number(date1)) / msInDay);

        return currentDay;
    }

    const setPhaseAndSymptoms = (data: CycleData, lenCycle: number = 28) => {
        const currentDay: number = getCurrentCycleDay(data.startDate);
        const lenPeriod: number = data.lenPeriod;
        const lutealPhase: number = (lenCycle - 14) / 3;
        if (currentDay <= lenPeriod) {
            console.log("1");
            setPhase(infoPhase[1]);
            setSymptoms(1);
        } else if (currentDay < 12) {
            console.log("2");
            setPhase(infoPhase[2]);
            setSymptoms(1);
        } else if (currentDay >= 12 && currentDay <= 15) {
            console.log("3");
            setPhase(infoPhase[3]);
            setSymptoms(2);
        } else if (currentDay <= (14 + lutealPhase)) {
            console.log("4");
            setPhase(infoPhase[4]);
            setSymptoms(3);
        } else if (currentDay <= (14 + lutealPhase * 2)) {
            console.log("5");
            setPhase(infoPhase[5]);
            setSymptoms(3);
        } else {
            console.log("6");
            setPhase(infoPhase[6]);
            setSymptoms(3);
        }
    };

    useEffect(() => {
        get("current-cycle").then(resultCur => {
            if (resultCur) {
                get("cycle-length").then(resultLen => {
                    if (resultLen) {
                        setPhaseAndSymptoms(resultCur, resultLen)
                    } else {
                        setPhaseAndSymptoms(resultCur);
                    }
                })
            }
        });
    }, []);

    return (
        <IonModal isOpen={props.isOpen}>
            <div id="small-rectangle"></div>
            <IonContent className="ion-padding" color="basic">
                <div id="rectangle">
                    <IonList class="transparent">
                        <IonItem>
                            <IonTitle color="dark-basic">{phase[0]}</IonTitle>
                        </IonItem>
                        <IonItem lines="none">
                            <IonLabel>{phase[1]}</IonLabel>
                        </IonItem>
                        <IonItem lines="none">
                            <IonLabel>{phase[2]}</IonLabel>
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
                                <InfoSymptoms phase={symptoms} />
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
