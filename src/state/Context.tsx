import React from 'react';
import type { Cycle } from '../data/ClassCycle';

interface CyclesContextI {
    cycles: Cycle[],
    updateCycles: (newCycles: Cycle[]) => void
}

const cyclesInit: CyclesContextI = {
    cycles: [],
    updateCycles: (newCycles) => { }
}

export const CyclesContext = React.createContext<CyclesContextI>(cyclesInit);
