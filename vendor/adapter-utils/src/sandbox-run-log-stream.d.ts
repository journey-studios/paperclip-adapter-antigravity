import type { CommandManagedRuntimeRunner } from "./command-managed-runtime.js";
export type SandboxRunLogSink = (stream: "stdout" | "stderr", chunk: string) => Promise<void>;
export interface SandboxRunLogTailHandle {
    /**
     * Wrap the agent CLI invocation in a shell script that tees stdout/stderr
     * into tailable log files while preserving the original streams (the
     * provider result must keep the full stdout for adapter parsing) and the
     * original exit code.
     */
    wrapCommand(command: string, args: string[]): {
        command: string;
        args: string[];
    };
    /** Start the host-side poll loop that tails the log files via the runner. */
    start(onLog: SandboxRunLogSink): void;
    /**
     * Stop the poll loop and emit any bytes of the final batched output that
     * were not already streamed. Emitting the suffix past the streamed byte
     * offset both dedupes the final batch and guarantees full coverage when
     * the tail loop degraded mid-run.
     */
    finish(finalBatch: {
        stdout: string;
        stderr: string;
    }): Promise<void>;
    /** Stop the poll loop without emitting anything further (error path). */
    abort(): Promise<void>;
}
export interface SandboxRunLogTailFactory {
    create(): SandboxRunLogTailHandle;
}
export interface SandboxRunLogTailFactoryOptions {
    runner: CommandManagedRuntimeRunner;
    remoteCwd: string;
    /** Remote directory the log files live in (bridge queue `logs/` dir). */
    logsDir: string;
    shellCommand?: "bash" | "sh" | null;
    pollIntervalMs?: number | null;
    maxChunkBytesPerTick?: number | null;
    tickTimeoutMs?: number | null;
    maxConsecutiveFailures?: number | null;
}
export declare function createSandboxRunLogTailFactory(options: SandboxRunLogTailFactoryOptions): SandboxRunLogTailFactory;
//# sourceMappingURL=sandbox-run-log-stream.d.ts.map