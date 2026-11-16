import { createContext } from "react";

export interface AppContextValue {
  source: "internal" | "community";
  permissions: readonly string[];
}

/** Tells the hooks which app calls them, the host provides it around every app */
export const AppContext = createContext<AppContextValue | null>(null);
