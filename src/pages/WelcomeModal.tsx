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

import { remove, set } from '../data/Storage';
import { cycle_days, period_days } from '../data/SelectConst'
// import {
    // getInfo,
    // InfoCurrentCycle,
    // CycleData,
    // InfoPhase,
    // getPhase
// } from '../data/Calculations';
// import { Cycle } from "../data/ClassCycle";

import { DatePicker } from '@IraSoro/ionic-datetime-picker'


interface PropsWelcomeModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

const Welcome = (props: PropsWelcomeModal) => {
    const [confirmAlert] = useIonAlert();
// const [setting/*, setSetting*/] = useState(new Cycle());

    const selectOptions = {
        cssClass: "welcome-select-header",
    };

    // const isConstraints = (dateString: string) => {
    //     const msInDay = 24 * 60 * 60 * 1000;

    //     const date = new Date(dateString);
    //     const now = new Date();
    //     const days_diff = Math.ceil((Number(date) - Number(now)) / msInDay);
    //     const is_today = Math.ceil(Number(date) / msInDay) === Math.ceil(Number(now) / msInDay);

    //     return days_diff <= 0 || is_today;
    // }

    return (
        <IonModal isOpen={props.isOpen}>
            <IonHeader class="ion-no-border">
                <IonToolbar color="basic">
                    <IonTitle color="light">Welcome to Peri</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen class="gradient">
                {/* <IonCard class="welcome">
                    <IonCardHeader class="welcome">
                        Please enter your details so that you can already make a forecast.
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList>
                            <DatePicker
                                date={setting.start_date}
                                onChange={(newDate: string) => { setting.start_date = newDate }}
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
                                        setting.cycle_len = Number(ev.detail.value.id);
                                        // setSetting(setting);
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
                                        setting.period_len = Number(ev.detail.value.id);
                                        // setSetting(setting);
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
                </IonCard> */}
                <IonCol>
                    <IonButton
                        class="continue"
                        onClick={() => {
                            if (false/*setting.isEmpty()*/) {
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

                                                // remove("cycle-length");
                                                // remove("period-length");
                                                // remove("current-cycle");
                                                // remove("cycles");

                                                // props.setInfo(getInfo("none", 0));
                                                // props.setPhase(getPhase(new CycleData()));
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

                                                // let cycle: CycleData = new CycleData();
                                                // cycle.lenPeriod = setting.lenPeriod;
                                                // cycle.startDate = setting.startDate;
                                                // set("current-cycle", cycle);
                                                // set("cycle-length", setting.lenCycle);
                                                // set("period-length", setting.lenPeriod);

                                                // props.setInfo(getInfo(setting.startDate, setting.lenCycle));
                                                // props.setPhase(getPhase(cycle, setting.lenCycle));
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
