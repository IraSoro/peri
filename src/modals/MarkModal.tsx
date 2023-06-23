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

    const tNowDate = nowDate.getTime();
    const tNextCycleFinish = nextCycleFinish.getTime();

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

    function isNextPeriodDay(date: Date) {
        date.setHours(0, 0, 0, 0);
        const tDate = date.getTime();

        if (tDate >= tNowDate && tDate < tNextCycleFinish) {
            return true;
        }

        return false;
    }

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
                    value=""
                    onIonChange={(ev) => {
                        console.log("ev = ", ev.detail.value);
                    }}
                    onIonFocus={() => { }}


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
                        } else if (isNextPeriodDay(date)) {
                            return {
                                textColor: 'var(--ion-color-dark)',
                                backgroundColor: 'var(--ion-color-basic)',
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
                        >OK</IonButton>
                    </IonButtons>
                </IonDatetime>
            </IonModal >
        </>
    );
}

export default MarkModal;
