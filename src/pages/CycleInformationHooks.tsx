import { useState, useEffect } from 'react';
import { get } from "../data/Storage";
import type { Cycle } from '../data/ClassCycle';

const millisecondsInDay = 24 * 60 * 60 * 1000;

// hooks for home tab
export function useDayOfCycle(): string {
    const [startDateString, setStartDateString] = useState("");

    useEffect(() => {
        get("last-start-date")
            .then(setStartDateString)
            .catch((err) => console.error(`Can't get start date ${(err as Error).message}`));
    }, []);

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
    const dayOfCycle = Number(useDayOfCycle());

    useEffect(() => {
        get("middle-cycle-length")
            .then(setCycleLength)
            .catch((err) => console.error(`Can't get cycle length ${(err as Error).message}`));
    }, []);

    if (!cycleLength) {
        return "";
    }

    const lutealPhaseLength = 14;
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
    }, []);

    useEffect(() => {
        get("middle-cycle-length")
            .then(setCycleLength)
            .catch((err) => console.error(`Can't get cycle length ${(err as Error).message}`));
    }, []);

    if (!startDateString || !cycleLength) {
        return { title: "Period in", days: "no info" };
    }

    const dateOfFinish = new Date(startDateString);
    dateOfFinish.setDate(dateOfFinish.getDate() + Number(cycleLength));
    const now = new Date();
    let dayBefore = Math.round((Number(dateOfFinish) - Number(now)) / millisecondsInDay);

    if (dayBefore > 0) {
        return { title: "Period in", days: dayBefore + " Days" };
    }
    if (dayBefore === 0) {
        return { title: "Period", days: "Today" };
    }
    return {
        title: "Delay",
        days: Math.abs(dayBefore) + " Days"
    };
}

// hooks for details tab
export function useAverageLengthOfCycle(): number {
    const [cycleLength, setCycleLength] = useState("");

    useEffect(() => {
        get("middle-cycle-length")
            .then(setCycleLength)
            .catch((err) => console.error(`Can't get middle cycle length ${(err as Error).message}`));
    }, []);

    return Number(cycleLength);
}

export function useAverageLengthOfPeriod(): number {
    const [periodLength, setPeriodLength] = useState("");

    useEffect(() => {
        get("middle-period-length")
            .then(setPeriodLength)
            .catch((err) => console.error(`Can't get period length ${(err as Error).message}`));
    }, []);

    if (!periodLength) {
        return 0;
    }

    return Number(periodLength);
}

export function useLengthOfLastPeriod(): number {
    const [periodLength, setPeriodLength] = useState("");

    useEffect(() => {
        get("last-period-length")
            .then(setPeriodLength)
            .catch((err) => console.error(`Can't get length of last period ${(err as Error).message}`));
    }, []);

    if (!periodLength) {
        return 0;
    }

    return Number(periodLength);
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
    }, []);

    if (!cycles || cycles.length <= idx) {
        const defaultLengthOfCycle = 28;

        return {
            lengthOfCycleNumber: defaultLengthOfCycle,
            lengthOfCycleString: "Cycle length",
            lengthOfPeriod: 0,
            dates: "date"
        };
    }
    const cycleLenNumber: number = cycles[idx].cycleLength;
    const cycleLenString: string = `${cycleLenNumber} Days`;
    const periodLenNumber: number = cycles[idx].periodLength;

    const dateStart: Date = new Date(cycles[idx].startDate);
    const dateFinish: Date = new Date(cycles[idx].startDate);
    dateFinish.setDate(dateFinish.getDate() + cycleLenNumber);
    const dates = `${dateStart.toLocaleDateString()} - ${dateFinish.toLocaleDateString()}`;

    return {
        lengthOfCycleNumber: cycleLenNumber,
        lengthOfCycleString: cycleLenString,
        lengthOfPeriod: periodLenNumber,
        dates: dates,
    };
}

// hooks for MarkModal
export function useLastStartDate(): string {
    const [startDate, setStartDate] = useState("");

    useEffect(() => {
        get("last-start-date")
            .then(setStartDate)
            .catch((err) => console.error(`Can't get start date ${(err as Error).message}`));
    }, []);

    if (!startDate) {
        return "";
    }

    return startDate;
}

export function useCycles() {
    const [cycles, setCycles] = useState<Cycle[]>([]);

    useEffect(() => {
        get("cycles")
            .then(setCycles)
            .catch((err) => console.error(`Can't get start date ${(err as Error).message}`));
    }, []);

    return cycles;
}


