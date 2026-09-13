import type { ExhibitionAnalysisInput } from "./types";
import type { CuratorEngineResult } from "./analyze";

/**
 * Future LLM hook. Keys must never live in the Vite client.
 * Until a server route exists, this always returns null and the
 * rule-based engine remains the default.
 */
export async function evaluateWithLlm(
  _input: ExhibitionAnalysisInput,
): Promise<CuratorEngineResult | null> {
  return null;
}

export const curatorEngineMode: "rules" | "llm" = "rules";
