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
    IonCardContent,
} from '@ionic/react';
import './MarkModal.css';

import { set } from "../data/Storage"
import { period_days } from '../data/SelectConst'

import { DatePicker } from '@IraSoro/ionic-datetime-picker'

import {
    useDayOfCycle,
    useCycles,
} from './CycleInformationHooks';

interface PropsButton {
    period: number;
    setPeriod: (newPeriod: number) => void;
    date: string;
    setDate: (newDate: string) => void;

    setIsOpen: (newIsOpen: boolean) => void;
}

const Buttons = (props: PropsButton) => {
    const [confirmAlert] = useIonAlert();

    const lengthOfCycle = Number(useDayOfCycle());
    const cycles = useCycles();

    return (
        <>
            <IonButton
                style={{ float: "right" }}
                color="dark-basic"
                fill="clear"
                onClick={() => {
                    if (!props.date || !props.period) {
                        confirmAlert({
                            subHeader: "You have not entered all the data",
                            buttons: [
                                {
                                    text: 'OK',
                                    cssClass: 'alert-button-confirm',
                                    role: 'confirm',
                                    handler: () => {
                                        props.setIsOpen(false);
                                    },
                                },
                            ],
                        })
                    } else {
                        if (cycles.length > 0) {
                            cycles[0].cycleLength = lengthOfCycle;
                        }
                        cycles.unshift(
                            {
                                cycleLength: 0,
                                periodLength: props.period,
                                startDate: props.date,
                            }
                        );

                        Promise.all([
                            set("cycles", cycles),
                        ]).then(() => {
                            console.log("All new values are set, setIsOpen(false)");
                            props.setIsOpen(false);
                        }).catch((err) => console.error(err));
                    }
                }}
            >
                Ok
            </IonButton>
            <IonButton
                style={{ float: "right" }}
                color="dark-basic"
                fill="clear"
                onClick={() => {
                    props.setIsOpen(false);
                    props.setDate("");
                }}>
                Cancel
            </IonButton>
        </>
    );
};

interface PropsMarkModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

const MarkModal = (props: PropsMarkModal) => {
    const [date, setDate] = useState("");
    const [period, setPeriod] = useState(0);

    const selectOptions = {
        cssClass: "mark-select-header",
    };

    return (
        <IonModal isOpen={props.isOpen} class="mark-modal">
            <IonContent color="light">
                <IonCardContent class="align-center">
                    <IonList class="transparent">
                        <DatePicker date={date} onChange={setDate} color={"basic"} title={"Start of last period"} />
                        <IonItem lines="full" class="transparent">
                            <IonLabel color="basic">Period length</IonLabel>
                            <IonSelect
                                class="mark"
                                interfaceOptions={selectOptions}
                                placeholder=""
                                onIonChange={(ev) => {
                                    setPeriod(Number(ev.detail.value.id));
                                }}
                            >
                                {period_days.map((day) => (
                                    <IonSelectOption key={day.id} value={day}>
                                        {day.name}
                                    </IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                        <Buttons
                            period={period}
                            setPeriod={setPeriod}
                            date={date}
                            setDate={setDate}
                            setIsOpen={props.setIsOpen}
                        />
                    </IonList>
                </IonCardContent>
            </IonContent>
        </IonModal >
    );
}

export default MarkModal;
