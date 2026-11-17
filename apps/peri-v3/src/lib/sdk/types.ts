import type {
  AlgorithmManifest,
  AppManifest,
} from "@repo/config-schema/config-v2.schema";

/** The host sets `source`, `installed_at` and `verified`, a community author does not write them */
type HostFields = "source" | "installed_at" | "verified";

/** The fields our own code writes, the schema allows no permissions or community-only fields there */
type InternalFields = "manifest_version" | "id" | "name" | "version";

/** What a community author writes for an app */
export type CommunityAppManifest = Omit<AppManifest, HostFields>;

/** What our own code writes for an app */
export type InternalAppManifest = Pick<AppManifest, InternalFields>;

/** What a community author writes for an algorithm, it declares the one type it predicts */
export type CommunityAlgorithmManifest = Omit<AlgorithmManifest, HostFields>;

/** What our own code writes for an algorithm */
export type InternalAlgorithmManifest = Pick<
  AlgorithmManifest,
  InternalFields | "type"
>;

/** The phase of the cycle */
export type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";
