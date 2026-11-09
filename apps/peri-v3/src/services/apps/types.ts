import type { ComponentType } from "react";
import type { App } from "@repo/config-schema/config-v2.schema";

export type AppData = App["data"];

export type AppErrorCode =
  "already_registered" | "unknown_app" | "invalid_manifest" | "invalid_data";

export type AppOperationResult =
  { ok: true } | { ok: false; error: { code: AppErrorCode; message: string } };

export interface AppEntry {
  component: ComponentType;
}
