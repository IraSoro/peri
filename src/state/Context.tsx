import React from "react";
import type { Cycle } from "../data/ClassCycle";

interface CyclesContextI {
  cycles: Cycle[];
  updateCycles: (newCycles: Cycle[]) => void;
}

const cyclesInit: CyclesContextI = {
  cycles: [],
  updateCycles: (_newCycles) => {},
};

interface ThemeContextI {
  theme: string;
  updateTheme: (newTheme: string) => void;
}

const themeInit: ThemeContextI = {
  theme: "basic",
  updateTheme: (_newTheme) => {},
};

export const CyclesContext = React.createContext<CyclesContextI>(cyclesInit);
export const ThemeContext = React.createContext<ThemeContextI>(themeInit);
