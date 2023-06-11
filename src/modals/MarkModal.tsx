import { useContext, useRef, useState } from 'react';
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
    useIonViewDidEnter,
} from '@ionic/react';
import './MarkModal.css';

import { period_days } from '../data/SelectConst'

import { DatePicker } from '@IraSoro/ionic-datetime-picker'

import { CyclesContext } from '../state/Context';

import { App } from '@capacitor/app';

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

const MarkModal = () => {
    const [date, setDate] = useState("");
    const [period, setPeriod] = useState(0);

    const modalRef = useRef<HTMLIonModalElement>(null);
    const closeModal = () => {
        modalRef.current?.dismiss();
        setDate("");
    };

    useIonViewDidEnter(() => {
        const backButtonHandler = () => {
            modalRef.current?.dismiss();
        };

        App.addListener('backButton', backButtonHandler);

        return () => {
            App.removeAllListeners();
        };
    });

    const selectOptions = {
        cssClass: "mark-select-header",
    };

    return (
        <>
            <IonButton
                class="mark-button"
                id="open-mark-modal"
            >
                Mark</IonButton>
            <IonModal
                trigger="open-mark-modal"
                class="mark-modal"
                backdropDismiss={false}
                ref={modalRef}
            >
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
                                closeModal={closeModal}
                            />
                        </IonList>
                    </IonCardContent>
                </IonContent>
            </IonModal>
        </>
    );
}

export default MarkModal;
