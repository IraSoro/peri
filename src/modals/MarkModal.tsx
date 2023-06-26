import { useContext, useRef } from 'react';
import {
    IonButton,
    IonModal,
    IonDatetime,
    IonButtons,
    useIonAlert,
} from '@ionic/react';
import './MarkModal.css';

import { CyclesContext } from '../state/Context';
import {
    useAverageLengthOfPeriod
} from '../state/CycleInformationHooks';

import { format } from 'date-fns'

interface PropsButton {
    period: number;
    setPeriod: (newPeriod: number) => void;
    date: string;
    setDate: (newDate: string) => void;

    closeModal: () => void;
}

const Buttons = (props: PropsButton) => {
    const [confirmAlert] = useIonAlert();

    const { cycles, updateCycles } = useContext(CyclesContext);

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
                                        props.closeModal();
                                    },
                                },
                            ],
                        })
                    } else {
                        if (cycles.length > 0) {
                            const millisecondsInDay = 24 * 60 * 60 * 1000;

                            const startDate = new Date(cycles[0].startDate);
                            const finishDate = new Date(props.date);

                            const diff = new Date(finishDate.getTime() - startDate.getTime());
                            cycles[0].cycleLength = Math.ceil(diff.getTime() / millisecondsInDay);

                            cycles.unshift(
                                {
                                    cycleLength: 0,
                                    periodLength: props.period,
                                    startDate: props.date,
                                }
                            );
                        } else {
                            cycles.unshift(
                                {
                                    cycleLength: 28,
                                    periodLength: props.period,
                                    startDate: props.date,
                                }
                            );
                        }

                        Promise.all([
                            updateCycles([...cycles])
                        ]).then(() => {
                            console.log("All new values are set, setIsOpen(false)");
                            props.closeModal();
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
                    props.closeModal();
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
    const datetimeRef = useRef<null | HTMLIonDatetimeElement>(null);
    const cycles = useContext(CyclesContext).cycles;
    const lengthOfPeriod = useAverageLengthOfPeriod();

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

    function nextPeriodDays() {
        let periodDates = [format(nowDate, 'yyyy-MM-dd')];

        for (let i = 1; i < lengthOfPeriod; ++i) {
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
                                datetimeRef.current?.confirm();
                                props.setIsOpen(false);
                            }}
                        >Save</IonButton>
                    </IonButtons>
                </IonDatetime>
            </IonModal >
        </>
    );
}

export default MarkModal;
