export const PERMISSIONS = ["cycles:read", "predictions:read"] as const;

export type KnownPermission = (typeof PERMISSIONS)[number];

/** Maps a known permission to the part of `T` it unlocks */
export type Grants<T extends object> = Partial<
  Record<KnownPermission, Partial<T>>
>;

/**
 * Merges the parts that the given permissions unlock, `grants` maps a
 * permission to the part it unlocks. Parts of permissions that weren't
 * given are left out
 */
export function grantByPermissions<T extends object>(
  permissions: readonly string[],
  grants: Grants<T>,
): Partial<T> {
  const granted: Partial<T> = {};
  for (const permission of PERMISSIONS) {
    if (permissions.includes(permission)) {
      Object.assign(granted, grants[permission]);
    }
  }
  return granted;
}
