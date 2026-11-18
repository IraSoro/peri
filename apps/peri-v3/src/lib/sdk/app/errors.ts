/** Thrown by a hook when the app's manifest lacks the needed permission */
export class PermissionError extends Error {
  permission: string;

  constructor(permission: string) {
    super(`missing permission "${permission}"`);
    this.permission = permission;
  }
}

/** Thrown by a hook that is called outside of a app */
export class OutsideAppError extends Error {
  constructor() {
    super("this hook can only be used inside a app");
  }
}

/** Thrown by a hook that only internal apps may use */
export class InternalOnlyError extends Error {
  action: string;

  constructor(action: string) {
    super(`only internal apps can ${action}`);
    this.action = action;
  }
}

/**
 * Thrown by an app that has nothing to show yet. The host shows its empty
 * state with the message as the description, and renders the app again once
 * the data changes
 */
export class NoDataError extends Error {}
