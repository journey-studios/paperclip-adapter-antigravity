import type { AdapterExecutionContext, AdapterExecutionResult } from "@paperclipai/adapter-utils";
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
export declare function discoverAgySessionArtifacts(sessionId: string): Promise<string[]>;
export declare function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult>;
//# sourceMappingURL=execute.d.ts.map