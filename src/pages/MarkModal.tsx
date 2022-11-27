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
} from '@ionic/react';
import './MarkModal.css';

import { calendarClear } from 'ionicons/icons';
import { get, set } from "../data/Storage"
import {
    CycleData,
    InfoCurrentCycle,
    getInfo,
    InfoPhase,
    getPhase
} from '../data/Сalculations';

interface PropsMarkModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
    setInfo: (newDay: InfoCurrentCycle) => void;

    lenCycle: number;
    setLenCycle: (newIsOpen: number) => void;

    lenPeriod: number;
    setLenPeriod: (newIsOpen: number) => void;

    dateStartCycle: string;
    setDateStartCycle: (newDateStartCycle: string) => void;

    cycles?: CycleData[];
    setCycles: (newCycles: CycleData[]) => void;

    setPhase: (newPhase: InfoPhase) => void;
}

interface Day {
    id: number;
    name: string;
}

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

const MarkModal = (props: PropsMarkModal) => {
    const modal = useRef<HTMLIonModalElement>(null);
    const input = useRef<HTMLIonInputElement>(null);
    const datetime = useRef<null | HTMLIonDatetimeElement>(null);

    const [date, setDate] = useState("");
    const [period, setPeriod] = useState(0);

    const [confirmAlert] = useIonAlert();

    const confirmDate = () => {
        datetime.current?.confirm();
        modal.current?.dismiss(input.current?.value, 'confirm');
    }

    const calculationsCycleLen = (dateNow: string, dateLast: string) => {
        const msInDay = 24 * 60 * 60 * 1000;

        let now: Date = new Date(dateNow);
        let last: Date = new Date(dateLast);

        return Math.round(Math.abs(Number(now) - Number(last)) / msInDay);
    }

    return (
        <IonModal isOpen={props.isOpen} class="mark-modal">
            <IonContent color="light">
                <IonList class="transparent">
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
                        <IonLabel color="basic">Period length</IonLabel>
                        <IonSelect
                            placeholder="none"
                            onIonChange={(ev) => {
                                setPeriod(Number(ev.detail.value.id));
                            }}
                        >
                            {periodDays.map((day) => (
                                <IonSelectOption key={day.id} value={day}>
                                    {day.name}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>
                    <IonButton
                        style={{ float: "right" }}
                        color="dark-basic"
                        fill="clear"
                        onClick={() => {
                            if (!date || !period) {
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
                                props.setIsOpen(false);
                                get("current-cycle").then(resultCur => {
                                    if (resultCur) {
                                        get("cycles").then(resultArr => {
                                            resultCur.lenCycle = calculationsCycleLen(date, resultCur.startDate);
                                            if (resultArr) {
                                                resultArr.unshift(resultCur);
                                                set("cycles", resultArr);
                                                props.setCycles(resultArr);

                                                let countCycle: number = 0;
                                                let countPeriod: number = 0;
                                                for (var idx in resultArr) {
                                                    countCycle += resultArr[idx].lenCycle;
                                                    countPeriod += resultArr[idx].lenPeriod;
                                                }
                                                set("cycle-length", Math.trunc(countCycle / resultArr.length));
                                                props.setLenCycle(Math.trunc(countCycle / resultArr.length));
                                                set("period-length", Math.trunc(countPeriod / resultArr.length));
                                                props.setLenPeriod(Math.trunc(countPeriod / resultArr.length));
                                            } else {
                                                let cycles: CycleData[] = [];
                                                cycles.push(resultCur);
                                                set("cycles", cycles);
                                                props.setCycles(cycles);

                                                set("cycle-length", resultCur.lenCycle);
                                                props.setLenCycle(resultCur.lenCycle);
                                                set("period-length", resultCur.lenPeriod);
                                                props.setLenPeriod(resultCur.lenPeriod);
                                            }
                                            let currentCycle: CycleData = new CycleData();
                                            currentCycle.lenPeriod = period;
                                            currentCycle.startDate = date;
                                            set("current-cycle", currentCycle);
                                            props.setDateStartCycle(date);

                                            get("cycle-length").then(resultLenCycle => {
                                                props.setInfo(getInfo(date, resultLenCycle));

                                                props.setPhase(getPhase(currentCycle, resultLenCycle));
                                            });
                                        });

                                    } else {
                                        let currentCycle: CycleData = new CycleData();
                                        currentCycle.lenPeriod = period;
                                        currentCycle.startDate = date;

                                        set("current-cycle", currentCycle);
                                        props.setDateStartCycle(date);

                                        props.setInfo(getInfo(date));
                                        props.setPhase(getPhase(currentCycle));
                                    }
                                    setDate("");
                                })
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
                            setDate("");
                        }}>
                        Cancel
                    </IonButton>
                </IonList>
            </IonContent>
        </IonModal >
    );
}

export default MarkModal;
