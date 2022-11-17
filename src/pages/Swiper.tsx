import {
    IonContent,
    IonPage,
    IonButton,
    IonText,
    IonLabel,
    IonInput,
    IonItem,
    IonDatetime,
    IonModal,
    IonDatetimeButton,
    IonCol,
    IonList,
    IonImg,
} from '@ionic/react';

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";

import "swiper/css";
import "swiper/css/pagination";

import './Swiper.css';

const SwiperStart: React.FC = () => (
    <IonPage>
        <IonContent>
            <Swiper
                modules={[Pagination]}
                autoplay={true}
                keyboard={true}
                pagination={true}
                scrollbar={true}
                zoom={true}>
                <SwiperSlide>
                    <IonContent fullscreen color="basic">
                        <div id="swiper-rectangle">
                            <IonList class="transparent-list">
                                <IonText color="dark-basic">Please enter your details so that you can already make a forecast.</IonText>
                                <IonItem color="light">
                                    <IonLabel>Cycle length</IonLabel>
                                    <IonInput type="number" placeholder="none" min="14" max="99"></IonInput>
                                </IonItem>
                                <IonItem color="light">
                                    <IonLabel>Period length</IonLabel>
                                    <IonInput type="number" placeholder="none" min="1" max="9"></IonInput>
                                </IonItem>
                                <IonItem lines="none" color="light">
                                    <IonLabel>Start of last period</IonLabel>
                                    <IonDatetimeButton datetime="datetime">
                                    </IonDatetimeButton>
                                    <IonModal keepContentsMounted={true}>
                                        <IonDatetime color="basic" presentation="date" id="datetime" locale="en-US"></IonDatetime>
                                    </IonModal>
                                </IonItem>
                            </IonList>
                        </div>
                        <div id="swiper-rectangle-bottom">
                            <IonList class="transparent-list">
                                <IonText color="dark-basic">But also you can just continue by clicking on the button.</IonText>
                                <IonCol>
                                    <IonImg class="img-swiper" src='../../assets/uterus.svg' />
                                </IonCol>
                                <IonCol>
                                    <IonButton class="continue-button" href="/home">Continue</IonButton>
                                </IonCol>
                            </IonList>
                        </div>
                    </IonContent>
                </SwiperSlide>
            </Swiper>
        </IonContent>
    </IonPage>
);

export default SwiperStart;
