import React, { useState, useRef } from 'react';
import {
    IonButton,
    IonContent,
    IonItem,
    IonList,
    IonLabel,
    IonModal,
    IonDatetime,
    IonCol,
    IonImg,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonIcon,
    IonButtons,
    useIonAlert,
    IonSelect,
    IonSelectOption,
} from '@ionic/react';
import './WelcomeModal.css';

import { remove, set } from '../data/Storage';
import {
    getInfo,
    InfoCurrentCycle,
    CycleData
} from '../data/Сalculations';

import { calendarClear } from 'ionicons/icons';
import whiteUterus from '../assets/white-uterus.svg';

interface PropsWelcomeModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
    setInfo: (newDay: InfoCurrentCycle) => void;
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

    return (
        <IonModal isOpen={props.isOpen}>
            <IonHeader class="ion-no-border">
                <IonToolbar color="light">
                    <IonTitle color="dark-basic">Hello!</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen color="basic">
                <div id="welcome-rectangle">
                    <IonList class="transparent">
                        <IonCol>
                            <IonLabel
                                style={{ fontWeight: "bold" }}
                                color="dark-basic"
                            >
                                Please enter your details so that you can already make a forecast.
                            </IonLabel>
                        </IonCol>
                        <IonItem class="transparent" id="choose-date">
                            <IonLabel color="basic">Start of last period</IonLabel>
                            <IonIcon slot="end" color="dark" size="small" icon={calendarClear}></IonIcon>
                            <p>{date}</p>
                            <IonModal
                                id="choose-date-modal"
                                ref={modal}
                                trigger="choose-date"
                            >
                                <IonDatetime
                                    ref={datetime}
                                    color="basic"
                                    presentation="date"
                                    id="datetime"
                                    locale="en-US"
                                    onIonChange={(e) => {
                                        if (e.detail.value) {
                                            setDate(e.detail.value.toString().slice(0, 10));
                                            // console.log("date = ", date);
                                            setting.startDate = e.detail.value.toString().slice(0, 10);
                                            setSetting(setting);
                                        }
                                    }}
                                >
                                    <IonButtons slot="buttons">
                                        <IonButton color="basic" onClick={confirmDate}>Confirm</IonButton>
                                    </IonButtons>
                                </IonDatetime>
                            </IonModal>
                        </IonItem>
                        <IonItem class="transparent">
                            <IonLabel color="basic">Cycle length</IonLabel>
                            <IonSelect
                                placeholder="none"
                                onIonChange={(ev) => {
                                    // console.log(ev.detail.value.id);
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
                        <IonItem class="transparent" lines="none">
                            <IonLabel color="basic">Period length</IonLabel>
                            <IonSelect
                                placeholder="none"
                                onIonChange={(ev) => {
                                    // console.log(ev.detail.value.id);
                                    setting.lenPeriod = Number(ev.detail.value.id);
                                    setSetting(setting);
                                    // console.log("set-per", setting);
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
                </div>
                <div id="welcome-rectangle-bottom"></div>
                <IonList class="transparent">
                    <IonCol>
                        <IonLabel color="dark-basic">
                            <h2 style={{ fontWeight: "bold" }}>
                                But also you can just continue by clicking on the button.
                            </h2>
                        </IonLabel>
                    </IonCol>
                    <IonCol>
                        <IonImg class="img-welcome" src={whiteUterus} />
                    </IonCol>
                    <IonCol>
                        <IonButton
                            class="continue-button"
                            onClick={() => {
                                if (setting.isEmpty()) {
                                    confirmAlert({
                                        header: 'Continue?',
                                        subHeader: "You have not entered all the data",
                                        message: 'Forecast will not be generated.',
                                        buttons: [
                                            {
                                                text: 'Cancel',
                                                cssClass: 'alert-button-cancel',
                                                role: 'cancel',
                                                handler: () => {
                                                },
                                            },
                                            {
                                                text: 'OK',
                                                cssClass: 'alert-button-confirm',
                                                role: 'confirm',
                                                handler: () => {
                                                    props.setIsOpen(false);
                                                    set("welcome", true);

                                                    remove("cycle-length");
                                                    remove("period-length");
                                                    remove("current-cycle");
                                                    remove("cycles");

                                                    props.setInfo(getInfo("none", 0));
                                                },
                                            },
                                        ],
                                    })
                                } else {
                                    confirmAlert({
                                        header: 'Continue?',
                                        buttons: [
                                            {
                                                text: 'Cancel',
                                                cssClass: 'alert-button-cancel',
                                                role: 'cancel',
                                                handler: () => {
                                                },
                                            },
                                            {
                                                text: 'OK',
                                                cssClass: 'alert-button-confirm',
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
                </IonList>
            </IonContent>
        </IonModal>
    );
}

export default Welcome;
