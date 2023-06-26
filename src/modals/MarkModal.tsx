import { useContext, useRef } from 'react';
import {
    IonButton,
    IonModal,
    IonDatetime,
    IonButtons,
} from '@ionic/react';
import './MarkModal.css';

import { CyclesContext } from '../state/Context';
import {
    useAverageLengthOfPeriod
} from '../state/CycleInformationHooks';

import { format } from 'date-fns'

interface PropsMarkModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

const MarkModal = (props: PropsMarkModal) => {
    const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);
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

        for (let i = 0; i < cycles.length; ++i) {
            const cycleStart: Date = new Date(cycles[i].startDate);
            const cycleFinish: Date = new Date(cycles[i].startDate);
            cycleFinish.setDate(cycleFinish.getDate() + cycles[i].periodLength);

            if (date >= cycleStart && date < cycleFinish) {
                return true;
            }
        };

        return false;
    }

    function nextPeriodDays(): string[] {
        let periodDates = [format(nowDate, 'yyyy-MM-dd')];
        let lengthOfNextPeriod = lengthOfPeriod;
        if (lengthOfNextPeriod === 0) {
            const averageLengthOfPeriod = 5;
            lengthOfNextPeriod = averageLengthOfPeriod;
        }

        for (let i = 1; i < lengthOfNextPeriod; ++i) {
            const nextPeriodDay: Date = new Date();
            nextPeriodDay.setHours(0, 0, 0, 0);
            nextPeriodDay.setDate(nextPeriodDay.getDate() + i);
            periodDates.push(format(nextPeriodDay, 'yyyy-MM-dd'));
        }

        return periodDates;
    }

    const isEnabled = (dateString: string) => {
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
                backdropDismiss={false}
                isOpen={props.isOpen}
            >
                <IonDatetime
                    ref={datetimeRef}
                    color="dark-basic"
                    presentation="date"
                    locale="en-GB"
                    size="cover"
                    preferWheel={false}
                    multiple={true}
                    firstDayOfWeek={1}
                    showDefaultButtons={true}
                    isDateEnabled={isEnabled}
                    showDefaultTitle={true}
                    value={nextPeriodDays()}

                    titleSelectedDatesFormatter={((selectedDates: string[]) => {
                        if (selectedDates.length === 0) {
                            return "select date range";
                        }

                        selectedDates.sort();
                        const startPeriod = new Date(selectedDates[0]);
                        const finishPeriod = new Date(selectedDates[selectedDates.length - 1]);
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
