import { Temporal } from "temporal-polyfill";
import type { Cycle } from "@repo/config-schema/config-v2.schema";
import { service as store } from "@/services/store/service";
import type { Service as StoreService } from "@/services/store/service";
import { formatInstant } from "@/lib/utils/dates";
import type {
  CycleErrorCode,
  CycleInput,
  CycleOperationResult,
  ValidateOperation,
} from "./types";
import {
  hasNoOverlappingPeriods,
  hasUniqueStartDates,
  hasValidDates,
  hasValidPeriodLengths,
  isList,
} from "./validate";

class CycleError extends Error {
  code: CycleErrorCode;

  constructor(code: CycleErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export class Service {
  #store: StoreService;
  #validations: ValidateOperation[];

  constructor(store: StoreService) {
    this.#store = store;
    this.#validations = [
      isList,
      hasValidDates,
      hasValidPeriodLengths,
      hasUniqueStartDates,
      hasNoOverlappingPeriods,
    ];
  }

  get(): Cycle[] {
    return this.#store.get().cycles;
  }

  async update(
    change: (cycles: CycleInput[]) => CycleInput[],
  ): Promise<CycleOperationResult> {
    let res;
    try {
      res = await this.#store.update((config) => {
        const inputs = config.cycles.map((cycle) => {
          return {
            start_date: cycle.start_date,
            period_length: cycle.period_length,
          };
        });
        const cycles = this.#validate(change(inputs));
        return { ...config, cycles: this.#buildCycles(cycles) };
      });
    } catch (err) {
      if (err instanceof CycleError) {
        return { ok: false, error: { code: err.code, message: err.message } };
      }
      throw err;
    }
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "invalid_cycle", message: res.error.message },
      };
    }

    return { ok: true };
  }

  #validate(value: unknown): CycleInput[] {
    let data = value;
    for (const validation of this.#validations) {
      const res = validation(data);
      if (!res.ok) {
        throw new CycleError(res.error.code, res.error.message);
      }
      data = res.data;
    }
    return data as CycleInput[];
  }

  /**
   * Turns validated inputs into full cycles. The caller owns `start_date` and
   * `period_length`, everything else comes from the order of the cycles:
   * - sorted oldest first
   * - a cycle ends the day before the next one starts, `cycle_length` is the
   *   number of days between the two starts
   * - the latest cycle stays open (`end_date` and `cycle_length` are null),
   *   which the schema requires of the current cycle only
   *
   * Example: starts Jan 1 and Jan 29 -> Jan 1 ends Jan 28 with a length of 28
   * days, Jan 29 stays open. Days are counted in UTC
   */
  #buildCycles(inputs: CycleInput[]): Cycle[] {
    const sorted = [...inputs].sort((a, b) => {
      return Temporal.Instant.compare(a.start_date, b.start_date);
    });
    return sorted.map((input, index) => {
      const following = sorted[index + 1];
      if (!following) {
        return {
          start_date: input.start_date,
          end_date: null,
          period_length: input.period_length,
          cycle_length: null,
        };
      }
      const start = Temporal.Instant.from(input.start_date).toZonedDateTimeISO(
        "UTC",
      );
      const nextStart = Temporal.Instant.from(
        following.start_date,
      ).toZonedDateTimeISO("UTC");
      return {
        start_date: input.start_date,
        end_date: formatInstant(nextStart.subtract({ days: 1 }).toInstant()),
        period_length: input.period_length,
        cycle_length: start.until(nextStart, { largestUnit: "days" }).days,
      };
    });
  }
}

const start = performance.now();
console.info("[cycles] starting");

export const service = new Service(store);

console.info(`[cycles] ready in ${(performance.now() - start).toFixed(1)}ms`);
