import React, { useState } from 'react';
import {
    IonButton,
    IonContent,
    IonItem,
    IonList,
    IonLabel,
    IonModal,
    useIonAlert,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCol,
    IonTitle,
    IonHeader,
    IonToolbar,
} from '@ionic/react';
import './WelcomeModal.css';

import { set } from '../data/Storage';
import { cycle_days, period_days } from '../data/SelectConst'

import { DatePicker } from '@IraSoro/ionic-datetime-picker'
import type { Cycle } from '../data/ClassCycle';


interface PropsWelcomeModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

const Welcome = (props: PropsWelcomeModal) => {
    const [confirmAlert] = useIonAlert();
    const [cycle] = useState<Cycle[]>(
        [
            {
                cycleLength: 0,
                periodLength: 0,
                startDate: "",
            }
        ]
    );

    const selectOptions = {
        cssClass: "welcome-select-header",
    };

    return (
        <IonModal isOpen={props.isOpen}>
            <IonHeader class="ion-no-border">
                <IonToolbar color="basic">
                    <IonTitle color="light">Welcome to Peri</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen class="gradient">
                <IonCard class="welcome">
                    <IonCardHeader class="welcome">
                        Please enter your details so that you can already make a forecast.
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList>
                            <DatePicker
                                date={cycle[0].startDate}
                                onChange={(newDate: string) => { cycle[0].startDate = newDate }}
                                color={"basic"}
                                title='Start of last period'
                            />
                            <IonItem lines="full" class="welcome">
                                <IonLabel>Cycle length</IonLabel>
                                <IonSelect
                                    class="welcome"
                                    interfaceOptions={selectOptions}
                                    placeholder=""
                                    onIonChange={(ev) => {
                                        cycle[0].cycleLength = Number(ev.detail.value.id);
                                    }}
                                >
                                    {cycle_days.map((day) => (
                                        <IonSelectOption key={day.id} value={day}>
                                            {day.name}
                                        </IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>
                            <IonItem lines="none" class="welcome">
                                <IonLabel>Period length</IonLabel>
                                <IonSelect
                                    class="welcome"
                                    interfaceOptions={selectOptions}
                                    placeholder=""
                                    onIonChange={(ev) => {
                                        cycle[0].periodLength = Number(ev.detail.value.id);
                                    }}
                                >
                                    {period_days.map((day) => (
                                        <IonSelectOption key={day.id} value={day}>
                                            {day.name}
                                        </IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>
                        </IonList>
                    </IonCardContent>
                </IonCard>
                <IonCol>
                    <IonButton
                        class="continue"
                        onClick={() => {
                            if (!cycle[0].cycleLength || !cycle[0].periodLength || !cycle[0].startDate) {
                                confirmAlert({
                                    header: 'Continue?',
                                    cssClass: "header-color",
                                    message: 'Forecast will not be generated.',
                                    buttons: [
                                        {
                                            text: 'CANCEL',
                                            role: 'cancel',
                                        },
                                        {
                                            text: 'OK',
                                            role: 'confirm',
                                            handler: () => {
                                                props.setIsOpen(false);
                                            },
                                        },
                                    ],
                                })
                            } else {
                                set("cycles", cycle);
                                props.setIsOpen(false);
                            }
                        }}
                    >
                        Continue
                    </IonButton>
                </IonCol>
            </IonContent>
        </IonModal>
    );
}

export default Welcome;
