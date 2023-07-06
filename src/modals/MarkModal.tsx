import { useContext, useRef, useState } from 'react';
import {
    IonButton,
    IonModal,
    IonDatetime,
    IonButtons,
} from '@ionic/react';
import { format } from 'date-fns'
import './MarkModal.css';

import { CyclesContext } from '../state/Context';
import {
    useAverageLengthOfPeriod
} from '../state/CycleInformationHooks';

interface PropsMarkModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

const MarkModal = (props: PropsMarkModal) => {
    const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);
    const [disableSave, setDisableSave] = useState(true);

    const { cycles, updateCycles } = useContext(CyclesContext);
    const lengthOfPeriod = useAverageLengthOfPeriod();
    let markPeriodDays: string[] = [];

    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);

    const nextCycleFinish: Date = new Date();
    nextCycleFinish.setDate(nowDate.getDate() + lengthOfPeriod);
    nextCycleFinish.setHours(0, 0, 0, 0);

    function isLastPeriodDay(date: Date) {
        date.setHours(0, 0, 0, 0);

        return cycles.some((cycle) => {
            const startOfCycle = new Date(cycle.startDate);
            startOfCycle.setHours(0, 0, 0, 0);
            const endOfCycle = new Date(cycle.startDate);
            endOfCycle.setHours(0, 0, 0, 0);
            endOfCycle.setDate(endOfCycle.getDate() + cycle.periodLength);
            return date >= startOfCycle && date < endOfCycle;
        });
    }

    function nextPeriodDays() {
        const periodDates: string[] = [];
        if (cycles.length !== 0) {
            const endOfCurrentCycle = new Date(cycles[0].startDate);
            endOfCurrentCycle.setDate(endOfCurrentCycle.getDate() + cycles[0].periodLength);
            endOfCurrentCycle.setHours(0, 0, 0, 0);
            if (endOfCurrentCycle >= nowDate) {
                return undefined;
            }
        }

        for (let day = 0; day < (lengthOfPeriod || 5); day++) {
            const periodDay = new Date(nowDate);
            periodDay.setHours(0, 0, 0, 0);
            periodDay.setDate(periodDay.getDate() + day);

            periodDates.push(format(periodDay, "yyyy-MM-dd"));
        }

        return periodDates;
    }

    const isActiveDates = (dateString: string) => {
        if (cycles.length === 0) {
            return true;
        }
        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);

        const lastCycleFinish: Date = new Date(cycles[0].startDate);
        lastCycleFinish.setDate(lastCycleFinish.getDate() + cycles[0].periodLength);
        lastCycleFinish.setHours(0, 0, 0, 0);

        return date.getTime() > lastCycleFinish.getTime();
    };

    return (
        <>
            <IonButton
                class="mark-button"
                color="dark-basic"
                onClick={() => props.setIsOpen(true)}
            >
                Mark</IonButton>
            <IonModal
                class="mark-modal"
                isOpen={props.isOpen}
                backdropDismiss={false}
            >
                <IonDatetime
                    ref={datetimeRef}
                    color="dark-basic"
                    presentation="date"
                    locale="en-GB"
                    size="cover"
                    multiple
                    firstDayOfWeek={1}
                    showDefaultButtons
                    isDateEnabled={isActiveDates}
                    showDefaultTitle
                    value={nextPeriodDays()}

                    titleSelectedDatesFormatter={((selectedDates: string[]) => {
                        if (selectedDates.length === 0) {
                            setDisableSave(true);
                            return "select date range";
                        }

                        setDisableSave(false);
                        selectedDates.sort();
                        const startPeriod = new Date(selectedDates[0]);
                        const finishPeriod = new Date(selectedDates.at(-1) ?? 0);
                        markPeriodDays = selectedDates;

                        return `${format(startPeriod, "d MMM")} - ${format(finishPeriod, "d MMM")}`;
                    })}

                    highlightedDates={(isoString) => {
                        if (cycles.length === 0) {
                            return undefined;
                        }

                        const date = new Date(isoString);

                        if (isLastPeriodDay(date)) {
                            return {
                                textColor: 'var(--ion-color-light)',
                                backgroundColor: 'var(--ion-color-dark-basic)',
                            };
                        }

                        return undefined;
                    }}
                >
                    <IonButtons slot="buttons">
                        <IonButton
                            color="basic"
                            onClick={() => {
                                datetimeRef.current?.cancel();
                                props.setIsOpen(false);
                            }}
                        >Cancel</IonButton>
                        <IonButton
                            color="basic"
                            disabled={disableSave}
                            onClick={() => {
                                if (cycles.length > 0) {
                                    const millisecondsInDay = 24 * 60 * 60 * 1000;

                                    const startDate = new Date(cycles[0].startDate);
                                    const finishDate = new Date(markPeriodDays[0]);

                                    const diff = new Date(finishDate.getTime() - startDate.getTime());
                                    cycles[0].cycleLength = Math.ceil(diff.getTime() / millisecondsInDay);

                                    cycles.unshift(
                                        {
                                            cycleLength: 0,
                                            periodLength: markPeriodDays.length,
                                            startDate: markPeriodDays[0],
                                        }
                                    );
                                } else {
                                    cycles.unshift(
                                        {
                                            cycleLength: 28,
                                            periodLength: markPeriodDays.length,
                                            startDate: markPeriodDays[0],
                                        }
                                    );
                                }

                                Promise.all([
                                    updateCycles([...cycles])
                                ]).then(() => {
                                    console.log("All new values are set, setIsOpen(false)");
                                    datetimeRef.current?.confirm();
                                    props.setIsOpen(false);
                                }).catch((err) => console.error(err));
                            }}
                        >Save</IonButton>
                    </IonButtons>
                </IonDatetime>
            </IonModal >
        </>
    );
}

export default MarkModal;
