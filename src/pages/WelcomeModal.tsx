import React, { useState, useRef } from 'react';
import {
    IonButton,
    IonContent,
    IonItem,
    IonList,
    IonLabel,
    IonModal,
    IonDatetime,
    IonIcon,
    IonButtons,
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

import { remove, set } from '../data/Storage';
import {
    getInfo,
    InfoCurrentCycle,
    CycleData,
    InfoPhase,
    getPhase
} from '../data/Calculations';

import { calendarClear } from 'ionicons/icons';

interface PropsWelcomeModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
    setInfo: (newDay: InfoCurrentCycle) => void;

    setPhase: (newDay: InfoPhase) => void;
}

interface Day {
    id: number;
    name: string;
}

const cycleDays: Day[] = [
    { id: 14, name: '14', },
    { id: 15, name: '15', },
    { id: 16, name: '16', },
    { id: 17, name: '17', },
    { id: 18, name: '18', },
    { id: 19, name: '19', },
    { id: 20, name: '20', },
    { id: 21, name: '21', },
    { id: 22, name: '22', },
    { id: 23, name: '23', },
    { id: 24, name: '24', },
    { id: 25, name: '25', },
    { id: 26, name: '26', },
    { id: 27, name: '27', },
    { id: 28, name: '28', },
    { id: 29, name: '29', },
    { id: 30, name: '30', },
    { id: 31, name: '31', },
];

const periodDays: Day[] = [
    { id: 1, name: '1', },
    { id: 2, name: '2', },
    { id: 3, name: '3', },
    { id: 4, name: '4', },
    { id: 5, name: '5', },
    { id: 6, name: '6', },
    { id: 7, name: '7', },
    { id: 8, name: '8', },
    { id: 9, name: '9', },
];

const Welcome = (props: PropsWelcomeModal) => {
    const modal = useRef<HTMLIonModalElement>(null);
    const input = useRef<HTMLIonInputElement>(null);
    const datetime = useRef<null | HTMLIonDatetimeElement>(null);

    const [date, setDate] = useState("");

    const [confirmAlert] = useIonAlert();
    const [setting, setSetting] = useState(new CycleData());

    const confirmDate = () => {
        datetime.current?.confirm();
        modal.current?.dismiss(input.current?.value, 'confirm');
    }

    const cancelDate = () => {
        datetime.current?.cancel();
        modal.current?.dismiss(input.current?.value, 'cancel');
    }

    const selectOptions = {
        cssClass: "welcome-select-header",
    };

    const isConstraints = (dateString: string) => {
        const msInDay = 24 * 60 * 60 * 1000;

        const date = new Date(dateString);
        const now = new Date();
        const days_diff = Math.ceil((Number(date) - Number(now)) / msInDay);

        return days_diff <= 0;
    }

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
                            <IonItem lines="full" class="welcome" id="choose-date">
                                <IonLabel class="welcome">Start of last period</IonLabel>
                                <IonIcon slot="end" color="basic" size="small" icon={calendarClear}></IonIcon>
                                <p style={{ color: "var(--ion-color-dark-basic)" }}>{date}</p>
                                <IonModal
                                    class="choose-date-modal"
                                    ref={modal}
                                    trigger="choose-date"
                                >
                                    <IonDatetime
                                        ref={datetime}
                                        color="basic"
                                        presentation="date"
                                        id="datetime"
                                        locale="en-US"
                                        isDateEnabled={isConstraints}
                                        onIonChange={(e) => {
                                            if (e.detail.value) {
                                                setDate(e.detail.value.toString().slice(0, 10));
                                                setting.startDate = e.detail.value.toString().slice(0, 10);
                                                setSetting(setting);
                                            }
                                        }}
                                    >
                                        <IonButtons slot="buttons">
                                            <IonButton class="uppercase" color="basic" onClick={cancelDate}>CANCEL</IonButton>
                                            <IonButton class="uppercase" color="basic" onClick={confirmDate}>OK</IonButton>
                                        </IonButtons>
                                    </IonDatetime>
                                </IonModal>
                            </IonItem>
                            <IonItem lines="full" class="welcome">
                                <IonLabel>Cycle length</IonLabel>
                                <IonSelect
                                    class="welcome"
                                    interfaceOptions={selectOptions}
                                    placeholder=""
                                    onIonChange={(ev) => {
                                        setting.lenCycle = Number(ev.detail.value.id);
                                        setSetting(setting);
                                    }}
                                >
                                    {cycleDays.map((day) => (
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
                                        setting.lenPeriod = Number(ev.detail.value.id);
                                        setSetting(setting);
                                    }}
                                >
                                    {periodDays.map((day) => (
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
                            if (setting.isEmpty()) {
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
                                                set("welcome", true);

                                                remove("cycle-length");
                                                remove("period-length");
                                                remove("current-cycle");
                                                remove("cycles");

                                                props.setInfo(getInfo("none", 0));
                                                props.setPhase(getPhase(new CycleData()));
                                            },
                                        },
                                    ],
                                })
                            } else {
                                confirmAlert({
                                    header: 'Continue?',
                                    cssClass: "header-color",
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
                                                set("welcome", true);

                                                let cycle: CycleData = new CycleData();
                                                cycle.lenPeriod = setting.lenPeriod;
                                                cycle.startDate = setting.startDate;
                                                set("current-cycle", cycle);
                                                set("cycle-length", setting.lenCycle);
                                                set("period-length", setting.lenPeriod);

                                                props.setInfo(getInfo(setting.startDate, setting.lenCycle));
                                                props.setPhase(getPhase(cycle, setting.lenCycle));
                                            },
                                        },
                                    ],
                                })
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
