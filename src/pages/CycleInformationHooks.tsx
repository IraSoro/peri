import { useState, useEffect } from 'react';
import { get } from "../data/Storage";

const millisecondsInDay = 24 * 60 * 60 * 1000;

export function useDayOfCycle(): string {
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

export function useOvulationStatus(): string {
    const [cycleLength, setCycleLength] = useState("");
    const dayOfCycle = useDayOfCycle();

    useEffect(() => {
        get("cycle-length")
            .then(setCycleLength)
            .catch((err) => console.error(`Can't get cycle length ${(err as Error).message}`));
    }, [cycleLength]);

    if (!cycleLength) {
        return "";
    }

    const ovulationDay = Number(cycleLength) - 14; // константа
    const diffDay = ovulationDay - Number(dayOfCycle);
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

        get("cycle-length")
            .then(setCycleLength)
            .catch((err) => console.error(`Can't get cycle length ${(err as Error).message}`));
    }, [startDateString, cycleLength]);

    if (!startDateString || !cycleLength) {
        return { title: "Period in", days: "No info" };
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

