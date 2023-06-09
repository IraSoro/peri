import { set, remove } from '../data/Storage';
import type { Cycle } from '../data/ClassCycle';


export function testEmptyArray() {
  remove("cycles");
}

export function testSingleItem() {
  const cycles: Cycle[] = [
    {
      cycleLength: 28,
      periodLength: 6,
      startDate: "2023-05-31"
    },
  ];

  set("cycles", cycles);
}

export function testHalfOfArray() {
  const cycles: Cycle[] = [
    {
      cycleLength: 0,
      periodLength: 6,
      startDate: "2023-05-31"
    },
    {
      cycleLength: 28,
      periodLength: 6,
      startDate: "2023-05-03"
    },
    {
      cycleLength: 26,
      periodLength: 5,
      startDate: "2023-04-07"
    },
    {
      cycleLength: 25,
      periodLength: 6,
      startDate: "2023-03-13"
    },
  ];

  set("cycles", cycles);
}

export function testFullArray() {
  const cycles: Cycle[] = [
    {
      cycleLength: 0,
      periodLength: 6,
      startDate: "2023-05-31"
    },
    {
      cycleLength: 28,
      periodLength: 6,
      startDate: "2023-05-03"
    },
    {
      cycleLength: 26,
      periodLength: 5,
      startDate: "2023-04-07"
    },
    {
      cycleLength: 25,
      periodLength: 6,
      startDate: "2023-03-13"
    },
    {
      cycleLength: 28,
      periodLength: 5,
      startDate: "2023-02-13"
    },
    {
      cycleLength: 28,
      periodLength: 5,
      startDate: "2023-01-16"
    },
    {
      cycleLength: 30,
      periodLength: 6,
      startDate: "2022-12-17"
    },
  ];

  set("cycles", cycles);
}

export function testDelayOfFullArray() {
  const cycles: Cycle[] = [
    {
      cycleLength: 0,
      periodLength: 6,
      startDate: "2023-05-03"
    },
    {
      cycleLength: 26,
      periodLength: 5,
      startDate: "2023-04-07"
    },
    {
      cycleLength: 25,
      periodLength: 6,
      startDate: "2023-03-13"
    },
    {
      cycleLength: 28,
      periodLength: 5,
      startDate: "2023-02-13"
    },
    {
      cycleLength: 28,
      periodLength: 5,
      startDate: "2023-01-16"
    },
    {
      cycleLength: 30,
      periodLength: 6,
      startDate: "2022-12-17"
    },
  ];

  set("cycles", cycles);
}

export function testDelaySingleItem() {
  const cycles: Cycle[] = [
    {
      cycleLength: 28,
      periodLength: 6,
      startDate: "2023-05-03"
    },
  ];

  set("cycles", cycles);
}

