/** A sink for fully-formatted progress lines (newline included). */
export type RuntimeProgressSink = (line: string) => void | Promise<void>;
export type RuntimeProgressPhase = "Syncing" | "Restoring" | "Importing git history" | "Exporting git history";
export type RuntimeProgressDirection = "to" | "from";
export type RuntimeProgressTarget = "sandbox" | "ssh";
export type RuntimeStatusPhase = "git_sync" | "config_sync" | "adapter_startup" | "restore" | "export" | "finalize";
export interface RuntimeStatusUpdate {
    phase: RuntimeStatusPhase;
    message: string;
    currentToolName?: string | null;
    lastAssistantSnippet?: string | null;
    lastEventAt?: Date | string | null;
}
export type RuntimeStatusSink = (update: RuntimeStatusUpdate) => void | Promise<void>;
export interface RuntimeProgressReporterOptions {
    sink: RuntimeProgressSink;
    phase: RuntimeProgressPhase;
    /** Optional per-phase label, e.g. "workspace" or an asset key. */
    label?: string;
    direction: RuntimeProgressDirection;
    target: RuntimeProgressTarget;
    /** Emit when the percentage crosses this step. Default 10. */
    stepPercent?: number;
    /** Emit when at least this many ms have elapsed since the last emit. Default 2000. */
    minIntervalMs?: number;
    /** Injectable clock for deterministic tests. Default `Date.now`. */
    now?: () => number;
}
export interface RuntimeProgressReporter {
    /**
     * Report progress. Throttled: only emits on a step crossing or after
     * `minIntervalMs`. When `totalBytes` is known and `doneBytes` reaches it, the
     * terminal 100% line is emitted and the reporter is marked complete.
     */
    report(doneBytes: number, totalBytes: number | null): Promise<void>;
    /**
     * Emit the terminal completion line if it hasn't been emitted yet. Idempotent.
     */
    complete(doneBytes?: number, totalBytes?: number | null): Promise<void>;
    /**
     * Emit a terminal failure line if no terminal line has been emitted yet, so a
     * failed transfer leaves an explicit marker instead of a dangling percentage.
     * Idempotent and mutually exclusive with `complete()`.
     */
    fail(doneBytes?: number, totalBytes?: number | null): Promise<void>;
}
export declare function createRuntimeProgressReporter(options: RuntimeProgressReporterOptions): RuntimeProgressReporter;
//# sourceMappingURL=runtime-progress.d.ts.map