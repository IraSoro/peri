import * as mockedIonicCore from "@ionic/core";
import {
  GithubReleaseAsset,
  GithubReleaseInfo,
  appVersion,
  downloadLatestRelease,
  isNewVersionAvailable,
} from "../data/AppVersion";

describe("Get information about latest release", () => {
  test("There are no new version", async () => {
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValue(true);

    globalThis.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        tag_name: appVersion,
        draft: false,
        assets: [
          {
            content_type: "application/vnd.android.package-archive",
            browser_download_url: "https://some-url-to-apk-file.com",
          },
        ] satisfies GithubReleaseAsset[],
      } satisfies GithubReleaseInfo),
    });
    await expect(isNewVersionAvailable()).resolves.toEqual(false);
  });

  test("New version available", async () => {
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValue(true);

    globalThis.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        tag_name: "v999.999.999",
        draft: false,
        assets: [
          {
            content_type: "application/vnd.android.package-archive",
            browser_download_url: "https://some-url-to-apk-file.com",
          },
        ] satisfies GithubReleaseAsset[],
      } satisfies GithubReleaseInfo),
    });
    await expect(isNewVersionAvailable()).resolves.toEqual(true);
  });

  test("Web version", async () => {
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValue(false);

    globalThis.fetch = jest.fn();

    await expect(isNewVersionAvailable()).resolves.toEqual(false);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("Empty assets list", async () => {
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValue(true);

    globalThis.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        tag_name: appVersion,
        draft: false,
        assets: [] satisfies GithubReleaseAsset[],
      } satisfies GithubReleaseInfo),
    });

    await expect(isNewVersionAvailable()).rejects.toThrow(
      "Can't find apk files in assets list",
    );
  });
});

test("Download latest release", async () => {
  jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValue(true);

  globalThis.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue({
      tag_name: "v999.999.999",
      draft: false,
      assets: [
        {
          content_type: "application/vnd.android.package-archive",
          browser_download_url: "https://some-url-to-apk-file.com",
        },
      ] satisfies GithubReleaseAsset[],
    } satisfies GithubReleaseInfo),
  });

  // @ts-expect-error We don't want to implement all methods for `HTMLElement` mock
  const mockedAnchorElement = {
    click: jest.fn(),
  } as HTMLAnchorElement;

  const createElementSpy = jest
    .spyOn(document, "createElement")
    .mockReturnValue(mockedAnchorElement);

  const bodyAppendSpy = jest.spyOn(document.body, "append");

  const bodyRemoveChildSpy = jest
    .spyOn(document.body, "removeChild")
    .mockReturnValue({} as HTMLAnchorElement);

  await expect(downloadLatestRelease()).resolves.not.toThrow();
  expect(createElementSpy).toHaveBeenCalledWith("a");
  expect(bodyAppendSpy).toHaveBeenCalledWith(mockedAnchorElement);
  expect(mockedAnchorElement.click).toHaveBeenCalled();
  expect(bodyRemoveChildSpy).toHaveBeenCalledWith(mockedAnchorElement);
});
