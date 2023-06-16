import { useContext } from 'react';
import {
    IonButton,
    IonModal,
    IonButtons,
    IonDatetime,
    IonIcon,
} from '@ionic/react';
import './CalendarModal.css';

import { calendarClear } from 'ionicons/icons';

import { format } from 'date-fns'
import { CyclesContext } from '../state/Context';

import {
    useAverageLengthOfCycle,
    useAverageLengthOfPeriod,
} from '../state/CycleInformationHooks';

interface PropsCalendarModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

const CalendarModal = (props: PropsCalendarModal) => {
    const nowDate = new Date();

    const cycles = useContext(CyclesContext).cycles;
    const lengthOfCycle = useAverageLengthOfCycle();
    const lengthOfPeriod = useAverageLengthOfPeriod();

    function isPeriodDay(date: Date) {

        for (let i = 0; i < cycles.length; ++i) {
            const cycleStart: Date = new Date(cycles[i].startDate);
            const cycleFinish: Date = new Date(cycles[i].startDate);
            cycleFinish.setDate(cycleFinish.getDate() + cycles[i].periodLength);

            if (date >= cycleStart && date < cycleFinish) {
                return true;
            }
        };

        const nextCycleStart: Date = new Date(cycles[0].startDate);
        nextCycleStart.setDate(nextCycleStart.getDate() + lengthOfCycle);
        const nextCycleFinish: Date = new Date(cycles[0].startDate);
        nextCycleFinish.setDate(nextCycleFinish.getDate() + lengthOfCycle + lengthOfPeriod);
        if (date > nowDate && date >= nextCycleStart && date < nextCycleFinish) {
            return true
        }

        return false;
    }

    return (
        <>
            <IonButton
                class="calendar-button"
                fill="outline"
                onClick={() => props.setIsOpen(true)}
            >
                {format(nowDate, 'eee, d MMM yyyy')}
                <IonIcon slot="end" icon={calendarClear}></IonIcon>
            </IonButton>
            <IonModal
                id="calendar-modal"
                backdropDismiss={false}
                isOpen={props.isOpen}
            >
                <IonDatetime
                    color="basic"
                    presentation="date"
                    locale="en-GB"
                    size="cover"
                    firstDayOfWeek={1}
                    isDateEnabled={(dateString: string) => {
                        const date = new Date(dateString);
                        return (format(date, 'yyyy-MM-dd') <= format(nowDate, 'yyyy-MM-dd')) ? true : false;
                    }}

                    highlightedDates={(isoString) => {
                        if (cycles.length === 0) {
                            return undefined;
                        }

                        const date = new Date(isoString);

                        if (isPeriodDay(date)) {
                            return {
                                textColor: 'var(--ion-color-light)',
                                backgroundColor: 'var(--ion-color-basic)',
                            };
                        }

                        return undefined;
                    }}
                >
                    <IonButtons slot="buttons">
                        <IonButton
                            color="basic"
                            onClick={() => props.setIsOpen(false)}
                        >Ok</IonButton>
                    </IonButtons>
                </IonDatetime>
            </IonModal>
        </>
    );
}

export default CalendarModal;
