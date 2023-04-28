interface Phase {
    title: string;
    description: string;
    symptoms: string[];
}

export const phases: Phase[] = [
    {
        title: "The menstrual cycle can be divided into 4 phases.",
        description: "When information about your cycle appears, it will be reported which phase you are in.",
        symptoms: ["This section will indicate the symptoms characteristic of this cycle."],
    },
    {
        title: "Menstrual phase",
        description: "This cycle is accompanied by low hormone levels.",
        symptoms: [
            "lack of energy and strength",
            "pain",
            "weakness and irritability",
            "increased appetite",
        ]
    },
    {
        title: "Follicular phase",
        description: "The level of estrogen in this phase rises and reaches a maximum level.",
        symptoms: [
            "strength and vigor appear",
            "endurance increases",
            "new ideas and plans appear",
            "libido increases",
        ]
    },
    {
        title: "Ovulation phase",
        description: "Once estrogen levels peak, they trigger the release of two important ovulation hormones, follicle-stimulating hormone and luteinizing hormone.",
        symptoms: [
            "increased sexual desire",
            "optimistic mood",
            "mild fever",
            "lower abdominal pain",
            "chest discomfort and bloating",
            "characteristic secretions",
        ]
    },
    {
        title: "Luteal phase",
        description: "Levels of the hormones estrogen and progesterone first rise and then drop sharply just before a period. Progesterone reaches its peak in the luteal phase.",
        symptoms: [
            "breast tenderness",
            "puffiness",
            "acne and skin rashes",
            "increased appetite",
            "diarrhea or constipation",
            "irritability and depressed mood",
        ]
    },
];
