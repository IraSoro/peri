import type { ManifestBase } from "@repo/config-schema/config-v2.schema";

/** What a community author writes, the host sets `source`, `installed_at` and `verified` */
export type CommunityManifest = Omit<
  ManifestBase,
  "source" | "installed_at" | "verified"
>;

/** What our own code writes, the schema allows no permissions or community-only fields here */
export type InternalManifest = Pick<
  ManifestBase,
  "manifest_version" | "id" | "name" | "version"
>;
