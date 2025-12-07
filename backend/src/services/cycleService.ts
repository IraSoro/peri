import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Cycle {
  cycleLength: number;
  periodLength: number;
  startDate: string;
}

export async function getAllCycles(): Promise<Cycle[]> {
  const records = await prisma.cycle.findMany({
    orderBy: { startDate: 'desc' }
  });

  return records.map(record => ({
    cycleLength: record.cycleLength,
    periodLength: record.periodLength,
    startDate: record.startDate
  }));
}

export async function saveCycles(cycles: Cycle[]): Promise<number> {
  await prisma.$transaction(async (tx) => {
    // 全削除
    await tx.cycle.deleteMany();

    // 新規追加
    if (cycles.length > 0) {
      await tx.cycle.createMany({
        data: cycles.map(cycle => ({
          cycleLength: cycle.cycleLength,
          periodLength: cycle.periodLength,
          startDate: cycle.startDate
        }))
      });
    }
  });

  return cycles.length;
}
