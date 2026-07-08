export interface Cycle {
  cycle_length: number;
  period_length: number;
  start_date: Date;
  cycle_end_date: Date;
  period_end_date: Date;
  ovulation_date: Date;
}

export interface CycleInfo {
  cycles: Cycle[];
}
