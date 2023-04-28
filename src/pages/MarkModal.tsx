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

import { Cycle } from "../data/ClassCycle"
import {
    useLengthOfLastPeriod,
    useDayOfCycle,
    useLastStartDate,
    useCycles,
} from './CycleInformationHooks';

interface PropsMarkModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

interface PropsButton {
    period: number;
    setPeriod: (newPeriod: number) => void;
    date: string;
    setDate: (newDate: string) => void;

    setIsOpen: (newIsOpen: boolean) => void;
}

export function getNewAverageLengthOfCycle(cycles: Cycle[]) {
    if (!cycles) {
        return 0;
    }

    const sum = cycles.reduce((prev, current) => {
        return prev + current.cycleLength;
    }, 0);

    return Math.round(sum / cycles.length);
}

export function getNewAverageLengthOfPeriod(cycles: Cycle[]) {
    if (!cycles) {
        return 0;
    }

    const sum = cycles.reduce((prev, current) => {
        return prev + current.periodLength;
    }, 0);

    return Math.round(sum / cycles.length);
}

const Buttons = (props: PropsButton) => {
    const [confirmAlert] = useIonAlert();

    const lengthLastPeriod = useLengthOfLastPeriod();
    const lengthOfCycle = Number(useDayOfCycle());
    const lastDateStart = useLastStartDate();
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
                        cycles?.unshift(
                            {
                                cycleLength: lengthOfCycle,
                                periodLength: lengthLastPeriod,
                                startDate: lastDateStart,
                            }
                        );
                        const averageCycle = getNewAverageLengthOfCycle(cycles);
                        const averagePeriod = getNewAverageLengthOfPeriod(cycles);

                        set("cycles", cycles);
                        set("middle-period-length", averagePeriod);
                        set("middle-cycle-length", averageCycle);
                        set("last-start-date", props.date);
                        set("last-period-length", props.period);

                        props.setIsOpen(false);
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
