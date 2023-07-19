import { isPlatform } from "@ionic/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

import { Context } from "./Storage";

export type Config = Context & { version: number };

const configVersion = 1;
const configFilename = "peri.json";

export async function importConfig(): Promise<Config> {
  return new Promise<Config>((resolve, reject) => {
    const fileInputElement: HTMLInputElement = document.createElement("input");
    fileInputElement.type = "file";
    fileInputElement.accept = "application/json";
    fileInputElement.multiple = false;

    const fileReader = new FileReader();

    fileReader.addEventListener("load", () => {
      const config: Config | null = JSON.parse(
        fileReader.result as string,
      ) as Config | null;
      if (!config) {
        reject("User imported empty config");
      } else {
        resolve(config);
      }
    });

    fileInputElement.addEventListener("change", (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject("User didn't choose any file to import");
      } else {
        fileReader.readAsText(file);
      }
    });
    fileInputElement.addEventListener("cancel", () => {
      reject("Config import has been canceled by user");
    });

    document.body.appendChild(fileInputElement);
    fileInputElement.click();
    document.body.removeChild(fileInputElement);
  });
}

async function exportConfigAndroid(config: Config): Promise<void> {
  await Filesystem.writeFile({
    data: JSON.stringify(config),
    path: configFilename,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });

  const uriResult = await Filesystem.getUri({
    path: configFilename,
    directory: Directory.Cache,
  });

  await Share.share({
    url: uriResult.uri,
  });
}

function exportConfigWeb(config: Config): Promise<void> {
  // NOTE: This function is made of promises for the sole purpose of keeping
  //       the API consistent with the Android version
  return new Promise((resolve) => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(config, null, 2)], {
        type: "application/json",
      }),
    );

    const anchorElement: HTMLAnchorElement = document.createElement("a");
    anchorElement.download = configFilename;
    anchorElement.href = url;

    document.body.append(anchorElement);
    anchorElement.click();
    document.body.removeChild(anchorElement);
    URL.revokeObjectURL(url);

    resolve();
  });
}

export function exportConfig(ctx: Context): Promise<void> {
  const config = {
    version: configVersion,
    ...ctx,
  } satisfies Config;

  if (isPlatform("android")) {
    return exportConfigAndroid(config);
  }

  return exportConfigWeb(config);
}
