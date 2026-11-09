import { describe, expect, it } from "vitest";
import { Service as StoreService } from "@/services/store/service";
import { Stub } from "@/services/store/backends/stub";
import { Service } from "./service";
import type { CycleInput } from "./types";

const JAN_1 = "2025-01-01T00:00:00.000Z";
const JAN_29 = "2025-01-29T00:00:00.000Z";
const FEB_26 = "2025-02-26T00:00:00.000Z";

async function setup() {
  const store = new StoreService(new Stub());
  await store.load();
  return { store, service: new Service(store) };
}

function cycle(startDate: string, periodLength = 5): CycleInput {
  return { start_date: startDate, period_length: periodLength };
}

describe("cycles service", () => {
  describe("update", () => {
    it("starts with an empty list", async () => {
      const { service } = await setup();

      expect(service.get()).toEqual([]);
    });

    it("hands the change the current cycles without derived fields", async () => {
      const { service } = await setup();
      await service.update(() => [cycle(JAN_1), cycle(JAN_29)]);
      let seen: CycleInput[] = [];

      await service.update((cycles) => {
        seen = cycles;
        return cycles;
      });

      expect(seen).toEqual([cycle(JAN_1), cycle(JAN_29)]);
    });

    it("stores the only cycle as the open current one", async () => {
      const { service } = await setup();

      const res = await service.update(() => [cycle(JAN_1)]);

      expect(res).toEqual({ ok: true });
      expect(service.get()).toEqual([
        {
          start_date: JAN_1,
          end_date: null,
          period_length: 5,
          cycle_length: null,
        },
      ]);
    });

    it("ends a cycle the day before the next one starts", async () => {
      const { service } = await setup();

      await service.update(() => [cycle(JAN_1, 5), cycle(JAN_29, 4)]);

      expect(service.get()).toEqual([
        {
          start_date: JAN_1,
          end_date: "2025-01-28T00:00:00.000Z",
          period_length: 5,
          cycle_length: 28,
        },
        {
          start_date: JAN_29,
          end_date: null,
          period_length: 4,
          cycle_length: null,
        },
      ]);
    });

    it("sorts cycles oldest first", async () => {
      const { service } = await setup();

      await service.update(() => [cycle(FEB_26), cycle(JAN_1), cycle(JAN_29)]);

      expect(
        service.get().map((c) => {
          return c.start_date;
        }),
      ).toEqual([JAN_1, JAN_29, FEB_26]);
      expect(
        service.get().map((c) => {
          return c.cycle_length;
        }),
      ).toEqual([28, 28, null]);
    });

    it("adds a cycle", async () => {
      const { service } = await setup();
      await service.update(() => [cycle(JAN_1)]);

      await service.update((cycles) => {
        return [...cycles, cycle(JAN_29)];
      });

      expect(service.get()).toHaveLength(2);
      expect(service.get()[0]?.cycle_length).toBe(28);
    });

    it("removes a cycle and reopens the previous one", async () => {
      const { service } = await setup();
      await service.update(() => [cycle(JAN_1), cycle(JAN_29)]);

      await service.update((cycles) => {
        return cycles.filter((c) => {
          return c.start_date !== JAN_29;
        });
      });

      expect(service.get()).toEqual([
        {
          start_date: JAN_1,
          end_date: null,
          period_length: 5,
          cycle_length: null,
        },
      ]);
    });

    it("changes a period length", async () => {
      const { service } = await setup();
      await service.update(() => [cycle(JAN_1, 5), cycle(JAN_29)]);

      await service.update((cycles) => {
        return cycles.map((c) => {
          return c.start_date === JAN_1 ? { ...c, period_length: 7 } : c;
        });
      });

      expect(service.get()[0]).toMatchObject({
        period_length: 7,
        end_date: "2025-01-28T00:00:00.000Z",
        cycle_length: 28,
      });
    });

    it("recomputes neighbours when a cycle moves", async () => {
      const { service } = await setup();
      await service.update(() => [cycle(JAN_1), cycle(JAN_29)]);

      await service.update((cycles) => {
        return cycles.map((c) => {
          return c.start_date === JAN_29
            ? { ...c, start_date: "2025-01-31T00:00:00.000Z" }
            : c;
        });
      });

      expect(service.get()[0]).toMatchObject({
        end_date: "2025-01-30T00:00:00.000Z",
        cycle_length: 30,
      });
    });

    it("normalizes start dates to ISO instants", async () => {
      const { service } = await setup();

      await service.update(() => [cycle("2025-01-01")]);

      expect(service.get()[0]?.start_date).toBe(JAN_1);
    });

    it("bumps the revision once per update", async () => {
      const { store, service } = await setup();
      const revision = store.get().revision;

      await service.update(() => [cycle(JAN_1), cycle(JAN_29)]);

      expect(store.get().revision).toBe(revision + 1);
    });

    it("hands the change a copy, so mutating it cannot corrupt the store", async () => {
      const { service } = await setup();
      await service.update(() => [cycle(JAN_1)]);

      await service.update((cycles) => {
        cycles.push(cycle(JAN_29));
        return [cycle(JAN_1)];
      });

      expect(service.get()).toHaveLength(1);
    });

    it("runs concurrent updates one after another", async () => {
      const { service } = await setup();

      await Promise.all([
        service.update((cycles) => {
          return [...cycles, cycle(JAN_29)];
        }),
        service.update((cycles) => {
          return [...cycles, cycle(JAN_1)];
        }),
        service.update((cycles) => {
          return [...cycles, cycle(FEB_26)];
        }),
      ]);

      expect(
        service.get().map((c) => {
          return c.start_date;
        }),
      ).toEqual([JAN_1, JAN_29, FEB_26]);
    });

    describe("validation", () => {
      it("rejects the same start date twice", async () => {
        const { service } = await setup();

        const res = await service.update(() => [
          cycle(JAN_1),
          cycle("2025-01-01"),
        ]);

        expect(res).toMatchObject({
          ok: false,
          error: { code: "duplicate_cycle" },
        });
        expect(service.get()).toEqual([]);
      });

      it.each([0, -1, 1.5, Number.NaN])(
        "rejects period_length %s",
        async (periodLength) => {
          const { service } = await setup();

          const res = await service.update(() => [cycle(JAN_1, periodLength)]);

          expect(res).toMatchObject({
            ok: false,
            error: { code: "invalid_cycle" },
          });
          expect(service.get()).toEqual([]);
        },
      );

      it("rejects a period longer than the gap to the next cycle", async () => {
        const { service } = await setup();

        const res = await service.update(() => [
          cycle(JAN_1, 29),
          cycle(JAN_29),
        ]);

        expect(res).toMatchObject({
          ok: false,
          error: { code: "overlapping_period" },
        });
        expect(service.get()).toEqual([]);
      });

      it("accepts a period that fills the whole gap", async () => {
        const { service } = await setup();

        const res = await service.update(() => [
          cycle(JAN_1, 28),
          cycle(JAN_29),
        ]);

        expect(res).toEqual({ ok: true });
      });

      it("does not limit the period of the latest cycle", async () => {
        const { service } = await setup();

        const res = await service.update(() => [cycle(JAN_1, 90)]);

        expect(res).toEqual({ ok: true });
      });

      it("rejects a plain date that does not exist", async () => {
        const { service } = await setup();

        const res = await service.update(() => [cycle("2025-02-30")]);

        expect(res).toMatchObject({
          ok: false,
          error: { code: "invalid_cycle" },
        });
      });

      it("rejects items that are not objects", async () => {
        const { service } = await setup();

        const res = await service.update(() => {
          return [null] as unknown as CycleInput[];
        });

        expect(res).toMatchObject({
          ok: false,
          error: { code: "invalid_cycle" },
        });
      });

      it("does not store fields the caller added", async () => {
        const { service } = await setup();

        await service.update(() => {
          return [{ ...cycle(JAN_1), extra: 1 }] as unknown as CycleInput[];
        });

        expect(service.get()[0]).not.toHaveProperty("extra");
      });

      it("rejects a start date that is not a date", async () => {
        const { service } = await setup();

        const res = await service.update(() => [cycle("nope")]);

        expect(res).toMatchObject({
          ok: false,
          error: { code: "invalid_cycle" },
        });
      });

      it("rejects a result that is not an array", async () => {
        const { service } = await setup();

        const res = await service.update(() => {
          return null as unknown as CycleInput[];
        });

        expect(res).toMatchObject({
          ok: false,
          error: { code: "invalid_cycle" },
        });
      });

      it("keeps the old cycles and the revision when rejected", async () => {
        const { store, service } = await setup();
        await service.update(() => [cycle(JAN_1)]);
        const before = store.get();

        await service.update(() => [cycle("nope")]);

        expect(store.get()).toEqual(before);
      });
    });

    it("rejects when the change throws and keeps working", async () => {
      const { service } = await setup();

      await expect(
        service.update(() => {
          throw new Error("boom");
        }),
      ).rejects.toThrow("boom");

      expect(await service.update(() => [cycle(JAN_1)])).toEqual({ ok: true });
    });
  });

  describe("get", () => {
    it("returns a copy, mutating it does not change the store", async () => {
      const { service } = await setup();
      await service.update(() => [cycle(JAN_1)]);

      service.get().push({
        start_date: JAN_29,
        end_date: null,
        period_length: 5,
        cycle_length: null,
      });

      expect(service.get()).toHaveLength(1);
    });
  });
});
