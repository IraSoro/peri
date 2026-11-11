import type {
  AlgorithmEntry,
  AlgorithmInput,
  AlgorithmOutput,
} from "@/services/algorithms/types";

export type { AlgorithmInput, AlgorithmOutput };

export type CommunityAlgorithmInput = Partial<AlgorithmInput>;

export interface CommunityAlgorithm {
  run(
    input: CommunityAlgorithmInput,
  ): AlgorithmOutput | Promise<AlgorithmOutput>;
}

export type InternalAlgorithm = AlgorithmEntry;
