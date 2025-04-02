import { useContext } from "react";
import { IonContent, IonModal, IonButton, IonCol, IonText } from "@ionic/react";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../state/Context";

import "./InfoModal.css";

interface PropsHelpModal {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
}

const HelpModal = (props: PropsHelpModal) => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext).theme;

  return (
    <IonModal
      id="info-modal"
      backdropDismiss={false}
      isOpen={props.isOpen}
    >
      <IonContent
        className="ion-padding"
        color={`transparent-${theme}`}
      >
        <div className="info-screen">
          <IonCol>
            <IonText>
              <p className={`info-title-${theme}`}>{t("Contact us")}</p>
              <p>
                {t("If you have any questions or suggestions, write to us at ")}
                <span className={`info-item-${theme}`}>periapp@proton.me</span>
              </p>
              <p>
                {t("You can also create an issue on our ")}
                <a
                  className={`link-${theme}`}
                  href="https://github.com/IraSoro/peri/issues"
                >
                  GitHub
                </a>
              </p>
            </IonText>
          </IonCol>
          <IonCol>
            <IonButton
              className="main"
              color={`dark-${theme}`}
              onClick={() => props.setIsOpen(false)}
            >
              OK
            </IonButton>
          </IonCol>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default HelpModal;
