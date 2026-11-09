type StoreErrorCode = "invalid_config" | "invalid_migration";

export type StoreOperationResult =
  | { ok: true }
  | { ok: false; error: { code: StoreErrorCode; message: string } };

export type MigrateErrorCode = "invalid_migration";

export type MigrateOperationResult =
  | { ok: true; data: unknown }
  | { ok: false; error: { code: MigrateErrorCode; message: string } };

export type MigrateOperation = (data: unknown) => MigrateOperationResult;

export type StoreListener = () => void;

export interface StoreBackend {
  read(): Promise<unknown>;
  write(data: unknown): Promise<void>;
}
