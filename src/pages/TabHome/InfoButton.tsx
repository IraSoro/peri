import { IonIcon, IonLabel } from "@ionic/react";
import { getPregnancyChance } from "../../state/CalculationLogics";
import { useContext } from "react";
import { CyclesContext, ThemeContext } from "../../state/Context";
import { useTranslation } from "react-i18next";
import { chevronForwardOutline } from "ionicons/icons";

interface InfoButtonProps {
  setIsInfoModal: (newIsOpen: boolean) => void;
}

const InfoButton = (props: InfoButtonProps) => {
  const { t } = useTranslation();

  const cycles = useContext(CyclesContext).cycles;
  const theme = useContext(ThemeContext).theme;

  const pregnancyChance = getPregnancyChance(cycles);
  if (cycles.length === 0) {
    return <p style={{ marginBottom: "20px", height: "22px" }}></p>;
  }
  return (
    <IonLabel
      onClick={() => props.setIsInfoModal(true)}
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <p
        style={{
          fontSize: "14px",
          color: "var(--ion-color-medium)",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: `var(--ion-color-text-${theme})`,
            marginRight: "3px",
          }}
        >
          {pregnancyChance}
        </span>
        - {t("chance of getting pregnant")}
        <IonIcon
          color={`dark-${theme}`}
          style={{ fontSize: "22px", marginLeft: "5px" }}
          icon={chevronForwardOutline}
        />
      </p>
    </IonLabel>
  );
};

export default InfoButton