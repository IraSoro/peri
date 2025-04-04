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

interface INotificationsContext {
  notificationsStatus: boolean;
  updateNotificationsStatus: (newStatus: boolean) => void;
}

const notificationsStatusInit: INotificationsContext = {
  notificationsStatus: false,
  updateNotificationsStatus: (_newStatus) => {},
};

export const CyclesContext = React.createContext<ICyclesContext>(cyclesInit);
export const ThemeContext = React.createContext<IThemeContext>(themeInit);
export const NotificationEnabledContext =
  React.createContext<INotificationsContext>(notificationsStatusInit);
