import { isPlatform } from "@ionic/core";

export const appVersion = "v2.3.5";

export interface GithubReleaseAsset {
  content_type: string;
  browser_download_url: string;
  // NOTE: Other fields are not significant
  //       You can see all fields with the following command:
  //       `curl https://api.github.com/repos/IraSoro/peri/releases/latest`
}

export interface GithubReleaseInfo {
  tag_name: string;
  draft: boolean;
  assets: GithubReleaseAsset[];
  // NOTE: Other fields are not significant
  //       You can see all fields with the following command:
  //       `curl https://api.github.com/repos/IraSoro/peri/releases/latest`
}

export interface LatestReleaseInfo {
  version: string;
  androidApkUrl: string;
}

async function getLatestReleaseInfo(): Promise<LatestReleaseInfo> {
  const newVersionInfo = {
    version: appVersion,
    androidApkUrl: "",
  } satisfies LatestReleaseInfo;

  const response = await fetch(
    "https://api.github.com/repos/IraSoro/peri/releases/latest",
  );

  const githubReleaseInfo = (await response.json()) as GithubReleaseInfo;

  const apkUrls = githubReleaseInfo.assets.filter((asset) => {
    return asset.content_type === "application/vnd.android.package-archive";
  });

  if (!apkUrls.length) {
    throw new Error("Can't find apk files in assets list");
  }

  newVersionInfo.version = githubReleaseInfo.tag_name;
  newVersionInfo.androidApkUrl = apkUrls[0].browser_download_url;

  return newVersionInfo;
}

export async function isNewVersionAvailable(): Promise<boolean> {
  if (
    isPlatform("desktop") ||
    isPlatform("mobileweb") ||
    !isPlatform("android")
  ) {
    return false;
  }

  return (await getLatestReleaseInfo()).version > appVersion;
}

export async function downloadLatestRelease() {
  const latestRelease = await getLatestReleaseInfo();

  const anchorElement: HTMLAnchorElement = document.createElement("a");
  anchorElement.download = `peri-${latestRelease.version}.apk`;
  anchorElement.href = "#";
  anchorElement.onclick = () => {
    window.open(latestRelease.androidApkUrl, "_system", "location=yes");
    return false;
  };

  document.body.append(anchorElement);
  anchorElement.click();
  document.body.removeChild(anchorElement);
}
