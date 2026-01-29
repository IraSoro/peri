export interface Cycle {
  cycle_length: number;
  period_length: number;
  start_date: Date;
  end_date: Date;
  ovulation_date: number;
}

export interface CycleInfo {
  cycles: Cycle[]
}
