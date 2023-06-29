import { useContext, useRef } from 'react';
import {
    IonButton,
    IonContent,
    IonLabel,
    IonModal,
    useIonAlert,
    IonCol,
    IonTitle,
    IonHeader,
    IonToolbar,
    IonIcon,
    IonDatetime,
} from '@ionic/react';
import { cloudDownloadOutline } from 'ionicons/icons';
import './WelcomeModal.css';

import type { Cycle } from '../data/ClassCycle';
import { importConfig } from '../data/Config';
import { storage } from '../data/Storage';

import { CyclesContext } from '../state/Context';


interface PropsWelcomeModal {
    isOpen: boolean;
    setIsOpen: (newIsOpen: boolean) => void;
}

const Welcome = (props: PropsWelcomeModal) => {
    const refDatetime = useRef<null | HTMLIonDatetimeElement>(null);
    const [confirmAlert] = useIonAlert();
    const cycle: Cycle[] =
        [
            {
                cycleLength: 28,
                periodLength: 0,
                startDate: "",
            }
        ];

    const updateCycles = useContext(CyclesContext).updateCycles;

    return (
        <IonModal
            isOpen={props.isOpen}
            backdropDismiss={false}
        >
            <IonHeader class="ion-no-border">
                <IonToolbar color="basic">
                    <IonTitle color="light">Welcome to Peri</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen color="basic">
                <IonCol>
                    <IonLabel class="welcome" color="dark-basic">
                        Please mark the days of your last period.
                    </IonLabel>
                </IonCol>
                <IonDatetime
                    class="welcome"
                    ref={refDatetime}
                    color="basic"
                    presentation="date"
                    locale="en-GB"
                    size="cover"
                    multiple
                    firstDayOfWeek={1}
                />
                <IonCol>
                    <IonButton
                        class="welcome"
                        color="dark-basic"
                        onClick={() => {
                            if (refDatetime.current?.value) {
                                const days = [refDatetime.current.value].flat().sort();
                                cycle[0].periodLength = days.length;
                                cycle[0].startDate = days[0];

                                updateCycles(cycle);
                                props.setIsOpen(false);
                            } else {
                                confirmAlert({
                                    header: 'Continue?',
                                    cssClass: "header-color",
                                    message: 'Forecast will not be generated.',
                                    buttons: [
                                        {
                                            text: 'CANCEL',
                                            role: 'cancel',
                                        },
                                        {
                                            text: 'OK',
                                            role: 'confirm',
                                            handler: () => {
                                                props.setIsOpen(false);
                                            },
                                        },
                                    ],
                                })
                            }
                        }}
                    >
                        continue
                    </IonButton>
                </IonCol>
                <IonCol>
                    <IonLabel color="dark-basic">or</IonLabel>
                </IonCol>
                <IonCol>
                    <IonButton
                        class="welcome"
                        color="dark-basic"
                        onClick={() => {
                            importConfig()
                                .then((config) => {
                                    storage.set.cycles(config.cycles)
                                        .then(() => {
                                            updateCycles(config.cycles);
                                            confirmAlert({
                                                header: "Configuration has been imported",
                                                cssClass: "header-color",
                                                buttons: [{
                                                    text: "OK",
                                                    role: "confirm",
                                                    handler: () => {
                                                        props.setIsOpen(false);
                                                    },
                                                }],
                                            });
                                        })
                                        .catch((err) => {
                                            console.error(err);
                                        });
                                })
                                .catch((err) => {
                                    console.error(err);
                                });
                        }}
                    >
                        <IonIcon slot="start" icon={cloudDownloadOutline} />
                        Import data
                    </IonButton>
                </IonCol>
            </IonContent>
        </IonModal>
    );
}

export default Welcome;
