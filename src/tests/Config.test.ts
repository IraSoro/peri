import * as mockedIonicCore from "@ionic/core";
import * as mockedCapacitorFilesystem from "@capacitor/filesystem";
import * as mockedCapacitorShare from "@capacitor/share";

import type { Context } from "../data/Storage";
import { exportConfig, importConfig } from "../data/Config";

test("importConfig", async () => {
  // @ts-expect-error This is just a mocked `HTMLInputElement` and we don't need
  //                  to implement all methods
  const mockedInputElement = {
    addEventListener: jest.fn().mockImplementationOnce((event, callback) => {
      if (event === "change") {
        // @ts-expect-error `HTMLInputElement` doesn't have `onChangeCallback` method
        //                  and we added it just for testing purposes
        mockedInputElement.onChangeCallback = () => {
          // NOTE: Here we use callback for the sake of mocking, so we don't care about the type of the function
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          callback({
            target: {
              files: ["some-file-chosen-by-user.json"],
            },
          });
        };
        return;
      }
    }),
    click: jest.fn().mockImplementationOnce(() => {
      // @ts-expect-error Same reason as above
      // NOTE: eslint ignore with same reason as above
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      mockedInputElement.onChangeCallback();
    }),
  } as HTMLInputElement;

  const createElementSpy = jest
    .spyOn(document, "createElement")
    .mockReturnValue(mockedInputElement);
  const appendChildSpy = jest
    .spyOn(document.body, "appendChild")
    .mockImplementation();
  const removeChildSpy = jest
    .spyOn(document.body, "removeChild")
    .mockImplementation();

  let fileReaderOnLoadCallback: EventListener | null = null;
  jest
    .spyOn(FileReader.prototype, "addEventListener")
    .mockImplementationOnce(
      (event, callback: EventListenerOrEventListenerObject) => {
        if (event === "load") {
          fileReaderOnLoadCallback = callback as EventListener;
        }
        console.log("FileReader addEventListener");
      },
    );
  jest.spyOn(FileReader.prototype, "readAsText").mockImplementationOnce(() => {
    fileReaderOnLoadCallback?.({} as Event);
  });
  jest
    .spyOn(FileReader.prototype, "result", "get")
    .mockReturnValue(`{ "a": 1, "b": 2 }`);

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
  test("Android", async () => {
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValue(true);

    // @ts-expect-error TS doesn't let me redefine readonly `Filesystem`
    mockedCapacitorFilesystem.Filesystem = {
      writeFile: jest
        .fn()
        .mockResolvedValueOnce({} as mockedCapacitorFilesystem.WriteFileResult),
      getUri: jest.fn().mockResolvedValueOnce({
        uri: "temporal-uri-to-cache-file",
      } as mockedCapacitorFilesystem.GetUriResult),
    };

    // @ts-expect-error TS doesn't let me redefine readonly `Share`
    mockedCapacitorShare.Share = {
      share: jest
        .fn()
        .mockResolvedValueOnce({} as mockedCapacitorShare.ShareResult),
    };

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
    } satisfies Context);

    expect(mockedCapacitorFilesystem.Filesystem.writeFile).toHaveBeenCalled();
    expect(mockedCapacitorFilesystem.Filesystem.getUri).toHaveBeenCalled();
    expect(mockedCapacitorShare.Share.share).toHaveBeenCalledWith({
      url: "temporal-uri-to-cache-file",
    });
  });

  test("Web", async () => {
    URL.createObjectURL = jest.fn().mockReturnValue("temporal-config-url");
    URL.revokeObjectURL = jest.fn();

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
    } satisfies Context);

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(bodyAppendSpy).toHaveBeenCalledWith(mockedAnchorElement);
    expect(mockedAnchorElement.click).toHaveBeenCalled();
    expect(bodyRemoveChildSpy).toHaveBeenCalledWith(mockedAnchorElement);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("temporal-config-url");
  });
});
