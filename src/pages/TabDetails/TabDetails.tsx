import { useContext } from "react";
import { IonContent, IonPage, IonList } from "@ionic/react";
import { useTranslation } from "react-i18next";

import { CyclesContext, ThemeContext } from "../../state/Context";

import "./TabDetails.css";
import CurrentCycle from "./CurrentCycle";
import AverageValues from "./AverageValues";
import CycleList from "./CycleList";

const TabDetails = () => {
  const { t } = useTranslation();
  const cycles = useContext(CyclesContext).cycles;
  const theme = useContext(ThemeContext).theme;

  return (
    <IonPage
      style={{ backgroundColor: `var(--ion-color-background-${theme})` }}
    >
      <div
        id="wide-screen"
        className={theme}
      >
        <IonContent
          className="ion-padding"
          color={`transparent-${theme}`}
        >
          <div id="width-details-screen">
            <AverageValues cycles={cycles} />
            <div
              id="progress-block"
              style={{ background: `var(--ion-color-calendar-${theme})` }}
            >
              {cycles.length > 0 ? (
                <IonList>
                  <CurrentCycle />
                  {cycles.length > 1 && <CycleList />}
                </IonList>
              ) : (
                <p className="no-periods">
                  {t("You haven't marked any periods yet")}
                </p>
              )}
            </div>
          </div>
        </IonContent>
      </div>
    </IonPage>
  );
};

export default TabDetails;
