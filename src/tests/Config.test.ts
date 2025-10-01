import * as ionicCore from "@ionic/core";
import { Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

import { describe, it, expect, vi } from "vitest";

import type { Context } from "../data/Storage";
import { exportConfig, importConfig } from "../data/Config";

vi.mock("@capacitor/core", async () => {
  const actual = await vi.importActual("@capacitor/core");
  return {
    ...actual,
    isPlatform: vi.fn(),
  };
});
vi.mock("@capacitor/filesystem", async () => {
  const actual = await vi.importActual("@capacitor/filesystem");
  return {
    ...actual,
    Filesystem: {
      getUri: vi.fn(),
      writeFile: vi.fn(),
    },
  };
});
vi.mock("@capacitor/share", async () => {
  const actual = await vi.importActual("@capacitor/share");
  return {
    ...actual,
    Share: {
      share: vi.fn(),
    },
  };
});

it("importConfig", async () => {
  // @ts-expect-error This is just a mocked `HTMLInputElement` and we don't need
  //                  to implement all methods
  const mockedInputElement = {
    addEventListener: vi.fn().mockImplementationOnce((event, callback) => {
      if (event === "change") {
        // @ts-expect-error `HTMLInputElement` doesn't have `onChangeCallback` method
        //                  and we added it just for testing purposes
        mockedInputElement.onChangeCallback = () => {
          // NOTE: Here we use callback for the sake of mocking, so we don't care about the type of the function
          callback({
            target: {
              files: ["some-file-chosen-by-user.json"],
            },
          });
        };
        return;
      }
    }),
    click: vi.fn().mockImplementationOnce(() => {
      // @ts-expect-error Same reason as above
      // NOTE: eslint ignore with same reason as above
      mockedInputElement.onChangeCallback();
    }),
  } as HTMLInputElement;

  const createElementSpy = vi
    .spyOn(document, "createElement")
    .mockReturnValue(mockedInputElement);
  const appendChildSpy = vi
    .spyOn(document.body, "appendChild")
    .mockReturnValue(mockedInputElement);
  const removeChildSpy = vi
    .spyOn(document.body, "removeChild")
    .mockReturnValue(mockedInputElement);

  let fileReaderOnLoadCallback: EventListener | null = null;
  vi.spyOn(FileReader.prototype, "addEventListener").mockImplementationOnce(
    (event, callback: EventListenerOrEventListenerObject) => {
      if (event === "load") {
        fileReaderOnLoadCallback = callback as EventListener;
      }
      console.log("FileReader addEventListener");
    },
  );
  vi.spyOn(FileReader.prototype, "readAsText").mockImplementationOnce(() => {
    fileReaderOnLoadCallback?.({} as Event);
  });
  vi.spyOn(FileReader.prototype, "result", "get").mockReturnValue(
    `{ "a": 1, "b": 2 }`,
  );

  await expect(importConfig()).resolves.toStrictEqual({
    a: 1,
    b: 2,
  });

  expect(createElementSpy).toHaveBeenCalledWith("input");
  expect(appendChildSpy).toHaveBeenCalledWith(mockedInputElement);
  expect(mockedInputElement.click).toHaveBeenCalled();
  expect(removeChildSpy).toHaveBeenCalledWith(mockedInputElement);
});

describe("exportConfig", () => {
  it("Android", async () => {
    vi.spyOn(ionicCore, "isPlatform")
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    vi.spyOn(Filesystem, "getUri").mockResolvedValueOnce({
      uri: "temporal-uri-to-cache-file",
    });
    vi.spyOn(Filesystem, "writeFile").mockResolvedValueOnce({
      uri: "it-doesn't-matter",
    });
    vi.spyOn(Share, "share").mockResolvedValue({});

    await exportConfig({
      cycles: [
        {
          cycleLength: 28,
          periodLength: 6,
          startDate: "2023-05-31",
        },
      ],
      language: "en",
      theme: "basic",
      isNotificationEnabled: false,
      lastNotificationId: 1,
      maxNumberOfDisplayedCycles: 6,
    } satisfies Context);

    expect(Filesystem.writeFile).toHaveBeenCalled();
    expect(Filesystem.getUri).toHaveBeenCalled();
    expect(Share.share).toHaveBeenCalledWith({
      url: "temporal-uri-to-cache-file",
    });
  });

  it("Web", async () => {
    URL.createObjectURL = vi.fn().mockReturnValue("temporal-config-url");
    URL.revokeObjectURL = vi.fn();

    vi.spyOn(Filesystem, "getUri").mockResolvedValueOnce({
      uri: "some-test-uri",
    });

    // android
    vi.spyOn(ionicCore, "isPlatform").mockReturnValue(false);

    // @ts-expect-error We don't want to implement all methods for `HTMLElement` mock
    const mockedAnchorElement = {
      click: vi.fn(),
    } as HTMLAnchorElement;

    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockReturnValue(mockedAnchorElement);
    const bodyAppendSpy = vi.spyOn(document.body, "append");
    const bodyRemoveChildSpy = vi
      .spyOn(document.body, "removeChild")
      .mockReturnValue({} as HTMLAnchorElement);

    await exportConfig({
      cycles: [
        {
          cycleLength: 28,
          periodLength: 6,
          startDate: "2023-05-31",
        },
      ],
      language: "en",
      theme: "basic",
      isNotificationEnabled: false,
      lastNotificationId: 1,
      maxNumberOfDisplayedCycles: 6,
    } satisfies Context);

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(bodyAppendSpy).toHaveBeenCalledWith(mockedAnchorElement);
    expect(mockedAnchorElement.click).toHaveBeenCalled();
    expect(bodyRemoveChildSpy).toHaveBeenCalledWith(mockedAnchorElement);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("temporal-config-url");
  });
});
