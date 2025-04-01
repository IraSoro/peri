import React from "react";
import type { Cycle } from "../data/ClassCycle";

interface ICyclesContext {
  cycles: Cycle[];
  updateCycles: (newCycles: Cycle[]) => void;
}

const cyclesInit: ICyclesContext = {
  cycles: [],
  updateCycles: (_newCycles) => {},
};

interface IThemeContext {
  theme: string;
  updateTheme: (newTheme: string) => void;
}

const themeInit: IThemeContext = {
  theme: "basic",
  updateTheme: (_newTheme) => {},
};

interface ISettingsContext {
  notificationsStatus: boolean;
  updateNotificationsStatus: (newStatus: boolean) => void;
  maxDisplayedCycles: number;
  updateMaxDisplayedCycles: (newValue: number) => void;
}

const settingsInit: ISettingsContext = {
  notificationsStatus: false,
  updateNotificationsStatus: (_newStatus) => {},
  maxDisplayedCycles: 6,
  updateMaxDisplayedCycles: (_newValue: number) => {},
};

export const CyclesContext = React.createContext<ICyclesContext>(cyclesInit);
export const ThemeContext = React.createContext<IThemeContext>(themeInit);
export const SettingsContext =
  React.createContext<ISettingsContext>(settingsInit);
