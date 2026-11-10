/** Thrown by a hook when the widget's manifest lacks the needed permission */
export class PermissionError extends Error {
  permission: string;

  constructor(permission: string) {
    super(`missing permission "${permission}"`);
    this.permission = permission;
  }
}
