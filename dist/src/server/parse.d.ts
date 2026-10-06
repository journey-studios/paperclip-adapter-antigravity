export declare function estimateAgyModelCostUsd(model: string | null | undefined, usage: UsageSummary | null | undefined): number | null;
import type { UsageSummary } from "@paperclipai/adapter-utils";
export declare const AGY_SUCCESS_STATUS = "SUCCESS";
export interface AgyToolInvocation {
    stepIndex: number;
    name: string;
    parameters: Record<string, unknown> | null;
    output: string | null;
    durationSeconds: number | null;
    completed: boolean;
    isError: boolean;
}
export interface AgyDeniedAction {
    action: string;
    displayName: string | null;
}
export interface ParsedAgyOutput {
    sessionId: string | null;
    conversationId: string | null;
    model: string;
    status: string | null;
    response: string | null;
    costUsd: number | null;
    usage: UsageSummary | null;
    usageBasis: "per_run" | null;
    thinkingTokens: number | null;
    numTurns: number | null;
    durationSeconds: number | null;
    summary: string;
    resultJson: Record<string, unknown> | null;
    resultEvent: Record<string, unknown> | null;
    /** True only when the terminal result reports a failure; tool step errors do not set it. */
    isError: boolean;
    /** Terminal failure message from the result event; never a mid-run tool error. */
    errorMessage: string | null;
    /** First tool step error, kept as a message fallback when no result event arrives. */
    toolErrorMessage: string | null;
    /** Tool actions agy auto-denied because headless mode cannot prompt for permission. */
    deniedActions: AgyDeniedAction[];
    tools: AgyToolInvocation[];
    availableTools: string[];
    permissionMode: string | null;
    assistantText: string;
    malformedLines: number;
}
export type AgyParsedStream = ParsedAgyOutput;
export declare function parseAgyUsage(rawUsage: unknown): {
    usage: UsageSummary;
    thinkingTokens: number | null;
} | null;
export declare function parseAgyJsonl(stdout: string): ParsedAgyOutput;
export declare function isAgySuccessResult(parsed: ParsedAgyOutput): boolean;
export declare function describeAgyDeniedActions(deniedActions: AgyDeniedAction[]): string;
export interface AgyRunOutcome {
    failed: boolean;
    errorMessage: string | null;
    permissionDenied: boolean;
}
/**
 * Decide whether a run failed from agy's terminal result, not from intermediate
 * tool step errors: agents routinely hit a tool error and recover. Without a
 * result event (crash or kill), fall back to the exit code and first tool error.
 */
export declare function resolveAgyRunOutcome(parsed: ParsedAgyOutput, exitCode: number | null): AgyRunOutcome;
/**
 * The non-JSON lines of agy's stdout: CLI banners and errors printed around the
 * stream-json events. Error heuristics scan only these (plus stderr and the
 * terminal error), never the JSON events, which carry the agent's own
 * transcript and tool output: an agent auditing logs quotes "401" or
 * "unauthenticated" constantly.
 */
export declare function extractAgyDiagnosticText(stdout: string | null | undefined): string;
export declare const AUTH_PATTERNS: RegExp[];
export declare const QUOTA_PATTERNS: RegExp[];
export declare const TRANSIENT_PATTERNS: RegExp[];
export declare const SESSION_UNRECOVERABLE_PATTERNS: RegExp[];
export declare function detectAgyAuthRequired(input: {
    stdout?: string | null;
    stderr?: string | null;
    parsed?: ParsedAgyOutput | null;
}): {
    requiresAuth: boolean;
};
export declare function detectAgyQuotaExhausted(input: {
    stdout?: string | null;
    stderr?: string | null;
    parsed?: ParsedAgyOutput | null;
}): boolean;
export declare function isAgyTransientNetworkError(stdout?: string | null, stderr?: string | null): boolean;
export declare function isAgySessionUnrecoverableError(stdout?: string | null, stderr?: string | null): boolean;
export declare function isAgyUnknownSessionError(input: {
    stdout?: string | null;
    stderr?: string | null;
    errorMessage?: string | null;
}): boolean;
export declare function describeAgyFailure(parsed: ParsedAgyOutput): string | null;
//# sourceMappingURL=parse.d.ts.map