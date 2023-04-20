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

import { get, set } from "../data/Storage"
import { period_days } from '../data/SelectConst'
import {
    CycleData,
    InfoCurrentCycle,
    getInfo,
    InfoPhase,
    getPhase
} from '../data/Calculations';

import { DatePicker } from '@IraSoro/ionic-datetime-picker'

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

const MarkModal = (props: PropsMarkModal) => {
    const [date, setDate] = useState("");
    const [period, setPeriod] = useState(0);

    const [confirmAlert] = useIonAlert();

    const calculationsCycleLen = (dateNow: string, dateLast: string) => {
        const msInDay = 24 * 60 * 60 * 1000;

        let now: Date = new Date(dateNow);
        let last: Date = new Date(dateLast);

        return Math.round(Math.abs(Number(now) - Number(last)) / msInDay);
    }

    const selectOptions = {
        cssClass: "mark-select-header",
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
                </IonCardContent>
            </IonContent>
        </IonModal >
    );
}

export default MarkModal;
