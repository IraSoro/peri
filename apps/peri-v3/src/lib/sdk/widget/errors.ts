/** Thrown by a hook when the widget's manifest lacks the needed permission */
export class PermissionError extends Error {
  permission: string;

  constructor(permission: string) {
    super(`missing permission "${permission}"`);
    this.permission = permission;
  }
}

/** Thrown by a hook that is called outside of a widget */
export class OutsideWidgetError extends Error {
  constructor() {
    super("this hook can only be used inside a widget");
  }
}

/** Thrown by a hook that only internal widgets may use */
export class InternalOnlyError extends Error {
  action: string;

  constructor(action: string) {
    super(`only internal widgets can ${action}`);
    this.action = action;
  }
}
