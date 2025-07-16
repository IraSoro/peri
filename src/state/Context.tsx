import React from "react";
import type { Cycle } from "../data/Cycle";

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
  maxNumberOfDisplayedCycles: number;
  updateMaxNumberOfDisplayedCycles: (newValue: number) => void;
}

const settingsInit: ISettingsContext = {
  notificationsStatus: false,
  updateNotificationsStatus: (_newStatus) => {},
  maxNumberOfDisplayedCycles: 6,
  updateMaxNumberOfDisplayedCycles: (_newValue: number) => {},
};

export const CyclesContext = React.createContext<ICyclesContext>(cyclesInit);
export const ThemeContext = React.createContext<IThemeContext>(themeInit);
export const SettingsContext =
  React.createContext<ISettingsContext>(settingsInit);
