import { useTranslation } from "react-i18next";

export interface Phase {
  title: string;
  description: string;
  symptoms: string[];
}

export function Phases(idx: number): Phase {
  const { t } = useTranslation();

  const phases: Phase[] = [
    {
      title: t("The menstrual cycle can be divided into 4 phases."),
      description: t(
        "When information about your cycle appears, it will be reported which phase you are in.",
      ),
      symptoms: [
        t(
          "This section will indicate the symptoms characteristic of this cycle.",
        ),
      ],
    },
    {
      title: t("Menstrual phase"),
      description: t("This cycle is accompanied by low hormone levels."),
      symptoms: [
        t("lack of energy and strength"),
        t("pain"),
        t("weakness and irritability"),
        t("increased appetite"),
      ],
    },
    {
      title: t("Follicular phase"),
      description: t(
        "The level of estrogen in this phase rises and reaches a maximum level.",
      ),
      symptoms: [
        t("strength and vigor appear"),
        t("endurance increases"),
        t("new ideas and plans appear"),
        t("libido increases"),
      ],
    },
    {
      title: t("Ovulation phase"),
      description: t(
        "Once estrogen levels peak, they trigger the release of two important ovulation hormones, follicle-stimulating hormone and luteinizing hormone.",
      ),
      symptoms: [
        t("increased sexual desire"),
        t("optimistic mood"),
        t("mild fever"),
        t("lower abdominal pain"),
        t("chest discomfort and bloating"),
        t("characteristic secretions"),
      ],
    },
    {
      title: t("Luteal phase"),
      description: t(
        "Levels of the hormones estrogen and progesterone first rise and then drop sharply just before a period. Progesterone reaches its peak in the luteal phase.",
      ),
      symptoms: [
        t("breast tenderness"),
        t("puffiness"),
        t("acne and skin rashes"),
        t("increased appetite"),
        t("diarrhea or constipation"),
        t("irritability and depressed mood"),
      ],
    },
  ];

  if (idx >= phases.length) {
    return phases[0];
  }
  return phases[idx];
}
