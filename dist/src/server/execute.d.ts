import type { AdapterExecutionContext, AdapterExecutionResult, AdapterRuntimeMcpServer } from "@paperclipai/adapter-utils";
import { type ParsedAgyOutput } from "./parse.js";
/**
 * Work around google-antigravity/antigravity-cli#1048.
 *
 * On resume, agy can finish the current turn successfully and then attach a
 * quota error copied from an older turn to the terminal result. A genuine
 * current-turn quota failure emits an error_message step and does not complete
 * an assistant response. Keep the guard deliberately strict so real 429s are
 * never converted into success.
 */
export declare function isHistoricalQuotaResumeResult(input: {
    resumedSession: boolean;
    parsed: ParsedAgyOutput;
    exitCode: number | null;
    stderr: string;
}): boolean;
/**
 * Detect whether a model ID already includes a reasoning effort tier suffix.
 * agy rejects --model plus --effort together when the model already specifies effort.
 */
export declare function modelHasEffortSuffix(model: string): boolean;
/**
 * Set agy's --print-timeout slightly below Paperclip's timeoutSec so agy exits cleanly
 * and emits a result event before being terminated mid-stream.
 */
export declare function resolveAgyPrintTimeoutSec(timeoutSec: number): number;
export declare function buildAgyMcpConfig(servers: AdapterRuntimeMcpServer[], existingConfig?: unknown): Record<string, unknown>;
export declare function discoverAgySessionArtifacts(sessionId: string): Promise<string[]>;
export declare function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult>;
//# sourceMappingURL=execute.d.ts.map