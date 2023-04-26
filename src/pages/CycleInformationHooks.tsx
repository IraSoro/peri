import { useState, useEffect } from 'react';
import { get } from "../data/Storage";
import { Cycle } from "../data/ClassCycle"

const millisecondsInDay = 24 * 60 * 60 * 1000;
const defaultLengthOfCycle = 28;
const lutealPhaseLength = 14;
const ovulationOnError = 3;

function useMiddleCycleLength(): number {
    const [cycleLength, setCycleLength] = useState("");

    useEffect(() => {
        get("middle-cycle-length")
            .then(setCycleLength)
            .catch((err) => console.error(`Can't get cycle length ${(err as Error).message}`));
    }, [cycleLength]);

    if (!cycleLength) {
        return 0;
    }
    return Number(cycleLength);
}

// hooks for home tab
export function useDayOfCycleString(): string {
    const [startDateString, setStartDateString] = useState("");

    useEffect(() => {
        get("last-start-date")
            .then(setStartDateString)
            .catch((err) => console.error(`Can't get start date ${(err as Error).message}`));
    }, [startDateString]);

    if (!startDateString) {
        return "";
    }

    const start = new Date(startDateString);
    const currentDate = new Date();
    const diff = new Date(currentDate.getTime() - start.getTime());

    return Math.ceil(diff.getTime() / millisecondsInDay).toString();
}

export function useDayOfCycleNumber(): number {
    const [startDateString, setStartDateString] = useState("");

    useEffect(() => {
        get("last-start-date")
            .then(setStartDateString)
            .catch((err) => console.error(`Can't get start date ${(err as Error).message}`));
    }, [startDateString]);

    if (!startDateString) {
        return 0;
    }

    const start = new Date(startDateString);
    const currentDate = new Date();
    const diff = new Date(currentDate.getTime() - start.getTime());

    return Math.ceil(diff.getTime() / millisecondsInDay);
}

export function useOvulationStatus(): string {
    const [cycleLength, setCycleLength] = useState("");
    const dayOfCycle = useDayOfCycleNumber();

    useEffect(() => {
        get("middle-cycle-length")
            .then(setCycleLength)
            .catch((err) => console.error(`Can't get cycle length ${(err as Error).message}`));
    }, [cycleLength]);

    if (!cycleLength) {
        return "";
    }

    const ovulationDay = Number(cycleLength) - lutealPhaseLength;
    const diffDay = ovulationDay - dayOfCycle;
    if (diffDay === 0) {
        return "today";
    } else if (diffDay < 0) {
        return "finished";
    } else if (diffDay === 1) {
        return "tomorrow"
    }
    return "in " + diffDay + " days";
}

export function usePregnancyChance(): string {
    const ovulationStatus = useOvulationStatus();

    if (!ovulationStatus) {
        return "";
    }

    if (ovulationStatus === "finished") {
        return "low";
    }
    if (["today", "tomorrow"].includes(ovulationStatus)) {
        return "hight";
    }
    return "middle";
}


interface DaysBeforePeriod {
    title: string,
    days: string
}

export function useDaysBeforePeriod(): DaysBeforePeriod {
    const [startDateString, setStartDateString] = useState("");
    const [cycleLength, setCycleLength] = useState("");

    useEffect(() => {
        get("last-start-date")
            .then(setStartDateString)
            .catch((err) => console.error(`Can't get start date ${(err as Error).message}`));

        get("middle-cycle-length")
            .then(setCycleLength)
            .catch((err) => console.error(`Can't get cycle length ${(err as Error).message}`));
    }, [startDateString, cycleLength]);

    if (!startDateString || !cycleLength) {
        return { title: "Period in", days: "no info" };
    }

    const dateOfFinish = new Date(startDateString);
    dateOfFinish.setDate(dateOfFinish.getDate() + Number(cycleLength));
    const now: Date = new Date();
    let dayBefore = Math.round((Number(dateOfFinish) - Number(now)) / millisecondsInDay);

    if (dayBefore > 0) {
        const days: string = dayBefore + " Days"
        return { title: "Period in", days: days };
    }
    if (dayBefore === 0) {
        return { title: "Period", days: "Today" };
    }
    const days: string = Math.abs(dayBefore) + " Days";
    return { title: "Delay", days: days };
}

// hooks for details tab
export function useMiddleLengthOfCycleNumber(): number {
    const [cycleLength, setCycleLength] = useState("");

    useEffect(() => {
        get("middle-cycle-length")
            .then(setCycleLength)
            .catch((err) => console.error(`Can't get cycle length ${(err as Error).message}`));
    }, [cycleLength]);

    if (!cycleLength) {
        return 0;
    }
    return Number(cycleLength);
}

export function useMiddleLengthOfCycleString(): string {
    const lengthOfCycle = useMiddleLengthOfCycleNumber();

    if (!lengthOfCycle) {
        return "0 Days";
    }
    return `${lengthOfCycle} Days`;
}

function useMiddleLengthOfPeriodNumber(): number {
    const [periodLength, setPeriodLength] = useState("");

    useEffect(() => {
        get("middle-period-length")
            .then(setPeriodLength)
            .catch((err) => console.error(`Can't get period length ${(err as Error).message}`));
    }, [periodLength]);

    if (!periodLength) {
        return 0;
    }

    return Number(periodLength);
}

export function useMiddleLengthOfPeriodString(): string {
    const lengthOfPeriod = useMiddleLengthOfPeriodNumber();

    if (!lengthOfPeriod) {
        return "0 Days";
    }

    return `${lengthOfPeriod} Days`;
}

export function useDaysOfCurrentCycleForProgressbar(): string {
    const dayOfCycle = useDayOfCycleString();

    if (!dayOfCycle) {
        return "Cycle days"
    }

    if (dayOfCycle === "1") {
        return "1 Day";
    }
    return `${dayOfCycle} Days`;
}

export function useLastLengthOfLastPeriodNumber(): number {
    const [periodLength, setPeriodLength] = useState("");

    useEffect(() => {
        get("last-period-length")
            .then(setPeriodLength)
            .catch((err) => console.error(`Can't get length of last period ${(err as Error).message}`));
    }, [periodLength]);

    if (!periodLength) {
        return 0;
    }

    return Number(periodLength);
}

export function useLastLengthOfLastCyclesNumber(): number {
    const lengthOfCycle = useDayOfCycleNumber();

    if (!lengthOfCycle) {
        return defaultLengthOfCycle;
    }

    return lengthOfCycle;
}

interface InfoOneCycle {
    lengthOfCycleString: string;
    lengthOfCycleNumber: number;
    lengthOfPeriod: number;
    dates: string;
}

export function useInfoForOneCycle(idx: number): InfoOneCycle {
    const [cycles, setCycles] = useState<Cycle[]>();

    useEffect(() => {
        get("cycles")
            .then(setCycles)
            .catch((err) => console.error(`Can't get cycles ${(err as Error).message}`));
    }, [cycles]);

    if (!cycles || cycles.length <= idx) {
        return {
            lengthOfCycleNumber: defaultLengthOfCycle,
            lengthOfCycleString: "Cycle length",
            lengthOfPeriod: 0,
            dates: "date"
        };
    }
    const cycleLenNumber: number = cycles[idx].cycle_len;
    const cycleLenString: string = `${cycleLenNumber} Days`;
    const periodLenNumber: number = cycles[idx].period_len;

    const dateStart: Date = new Date(cycles[idx].start_date);
    const dateFinish: Date = new Date(cycles[idx].start_date);
    dateFinish.setDate(dateFinish.getDate() + cycleLenNumber);
    const dates = `${dateStart.toLocaleDateString()} - ${dateFinish.toLocaleDateString()}`;

    return {
        lengthOfCycleNumber: cycleLenNumber,
        lengthOfCycleString: cycleLenString,
        lengthOfPeriod: periodLenNumber,
        dates: dates,
    };
}

// hooks for the infoModal

interface Phase {
    title: string;
    description: string;
    symptoms: string[];
}

const phases: Phase[] = [
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

export function usePhase(): Phase {
    const lengthOfPeriod = useLastLengthOfLastPeriodNumber();
    const lengthOfCycle = useMiddleCycleLength();
    const currentDay = useDayOfCycleNumber();

    if (!lengthOfCycle || !currentDay || !lengthOfPeriod) {
        return phases[0];
    }

    const ovulationDay = lengthOfCycle - lutealPhaseLength;

    if (currentDay <= lengthOfPeriod) {
        return phases[1];
    }
    if (currentDay <= (ovulationDay - ovulationOnError)) {
        return phases[2];
    }
    if (currentDay <= ovulationDay) {
        return phases[3];
    }
    return phases[4];
}

