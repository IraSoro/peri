import { describe, it, expect, vi } from "vitest";
import * as mockedIonicCore from "@ionic/core";
import {
  GithubReleaseAsset,
  GithubReleaseInfo,
  downloadLatestRelease,
  homepageURL,
  isNewVersionAvailable,
  openGitHubPage,
} from "../data/AppVersion";
import { configuration } from "../data/AppConfiguration";

describe("Get information about latest release", () => {
  it("There are no new version", async () => {
    // desktop
    vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // mobileweb
    vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // android
    vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        html_url: "https://some-html-url.com",
        tag_name: configuration.app.version,
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

  it("New version available", async () => {
    vi.spyOn(mockedIonicCore, "isPlatform")
      // desktop
      .mockReturnValueOnce(false)
      // mobileweb
      .mockReturnValueOnce(false)
      // android
      .mockReturnValueOnce(true);

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        html_url: "https://some-html-url.com",
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

  it("Web version", async () => {
    // desktop
    vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // mobileweb
    vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);
    // android
    vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);

    globalThis.fetch = vi.fn();

    await expect(isNewVersionAvailable()).resolves.toEqual(false);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("Web version on Android", async () => {
    // desktop
    vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // mobileweb
    vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);
    // android
    vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);

    globalThis.fetch = vi.fn();

    await expect(isNewVersionAvailable()).resolves.toEqual(false);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("Web version on Desktop", async () => {
    vi.spyOn(mockedIonicCore, "isPlatform")
      // desktop
      .mockReturnValueOnce(true)
      // mobileweb
      .mockReturnValueOnce(false)
      // android
      .mockReturnValueOnce(false);

    globalThis.fetch = vi.fn();

    await expect(isNewVersionAvailable()).resolves.toEqual(false);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("Empty assets list", async () => {
    vi.spyOn(mockedIonicCore, "isPlatform")
      // desktop
      .mockReturnValueOnce(false)
      // mobileweb
      .mockReturnValueOnce(false)
      // android
      .mockReturnValueOnce(true);

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        html_url: "https://some-html-url.com",
        tag_name: configuration.app.version,
        draft: false,
        assets: [] satisfies GithubReleaseAsset[],
      } satisfies GithubReleaseInfo),
    });

    await expect(isNewVersionAvailable()).rejects.toThrow(
      "Can't find apk files in assets list",
    );
  });
});

it("Download latest release", async () => {
  // desktop
  vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
  // mobileweb
  vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
  // android
  vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);

  const mockedWindowOpen = vi.spyOn(window, "open");

  globalThis.fetch = vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue({
      html_url: "https://some-html-url.com",
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

  await expect(downloadLatestRelease()).resolves.not.toThrow();
  expect(mockedWindowOpen).toHaveBeenNthCalledWith(
    1,
    "https://some-html-url.com",
    "_system",
    "location=yes",
  );
});

it("Open Github page on desktop", () => {
  vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);
  // @ts-expect-error Mock
  const mockedWindowOpen = vi.spyOn(window, "open").mockReturnValue({
    focus: vi.fn().mockReturnValue(0),
  });

  openGitHubPage();
  expect(mockedWindowOpen).toHaveBeenNthCalledWith(1, homepageURL, "_blank");
});

it("Open Github page on android", () => {
  vi.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
  // @ts-expect-error Mock
  const mockedWindowOpen = vi.spyOn(window, "open").mockReturnValue({});

  openGitHubPage();
  expect(mockedWindowOpen).toHaveBeenNthCalledWith(
    1,
    homepageURL,
    "_system",
    "location=yes",
  );
});
