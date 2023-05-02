import { useState, useEffect } from 'react';
import { get } from "../data/Storage";
import type { Cycle } from '../data/ClassCycle';

const millisecondsInDay = 24 * 60 * 60 * 1000;

export function useCycles() {
    const [cycles, setCycles] = useState<Cycle[]>([]);

    useEffect(() => {
        get("cycles")
            .then(setCycles)
            .catch((err) => console.error(`Can't get start date ${(err as Error).message}`));
    }, []);

    return cycles;
}

export function useLastStartDate(): string {
    const cycles = useCycles();

    if (cycles.length === 0) {
        return "";
    }

    return cycles[0].startDate;
}

export function useDayOfCycle(): string {
    const startDate = useLastStartDate();

    if (!startDate) {
        return "";
    }

    const start = new Date(startDate);
    const currentDate = new Date();

    const diff = new Date(currentDate.getTime() - start.getTime());

    return Math.ceil(diff.getTime() / millisecondsInDay).toString();
}

export function useAverageLengthOfCycle(): number {
    const cycles = useCycles();

    if (cycles.length <= 1) {
        return 0;
    }

    const sum = cycles.reduce((prev, current, idx) => {
        if (idx > 0) {
            return prev + current.cycleLength;
        }
        return 0;
    }, 0);

    return Math.round(sum / (cycles.length - 1));
}

export function useAverageLengthOfPeriod(): number {
    const cycles = useCycles();

    if (cycles.length <= 1) {
        return 0;
    }

    const sum = cycles.reduce((prev, current, idx) => {
        if (idx > 0) {
            return prev + current.periodLength;
        }
        return 0;
    }, 0);

    return Math.round(sum / (cycles.length - 1));
}

export function useLengthOfLastPeriod(): number {
    const cycles = useCycles();

    if (cycles.length === 0) {
        return 0;
    }

    return Number(cycles[0].periodLength);
}



