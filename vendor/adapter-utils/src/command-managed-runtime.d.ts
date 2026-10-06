import { type PreparedSandboxManagedRuntime, type SandboxAdditionalSource, type SandboxManagedRuntimeAsset, type SandboxManagedRuntimeClient, type SandboxSyncOperation, type SandboxSyncResult, type WorkspaceDurableSeedPaths, type WorkspaceInboundMode } from "./sandbox-managed-runtime.js";
import type { RunProcessResult } from "./server-utils.js";
import type { RuntimeProgressSink, RuntimeStatusSink } from "./runtime-progress.js";
import type { RuntimeSpanRunner } from "./acpx-engine/startup-timing.js";
import type { GitWorkspaceSnapshot } from "./git-workspace-sync.js";
import type { DirectorySnapshot } from "./workspace-restore-merge.js";
/**
 * Input for a duplex channel open. The caller supplies only the command argument
 * vector the sandbox runs as the channel child process. Element 0 is the program
 * and the rest are its arguments. The runner adds the lease scope from its own
 * closure. This type is separate from the worker manager's
 * `DuplexChannelOpenInput`, which also carries the lease scope fields.
 */
export interface DuplexChannelOpenInput {
    command: readonly string[];
}
/**
 * A persistent bidirectional channel to one long-lived command in the sandbox.
 * The caller writes raw input bytes, reads streamed output, and stops or closes
 * the channel. This is the cross-layer channel type: the runner returns it, and
 * the sandbox driver adapts the worker manager's host session to it.
 */
export interface CommandManagedDuplexChannel {
    /** Writes raw input bytes to the channel. */
    write(data: Uint8Array): void;
    /** Registers the one data listener. The channel streams each raw byte chunk in order. */
    onData(listener: (chunk: Uint8Array) => void): void;
    /**
     * Registers the one exit listener. The channel calls it one time with the exit.
     * A numeric `exitCode` is a real process exit. `transportClosed` is true when the
     * provider transport closed with no exit data, so a reader can tell a real
     * process exit from a reason-less transport close.
     */
    onExit(listener: (exit: {
        exitCode: number | null;
        transportClosed?: boolean;
    }) => void): void;
    /** Stops the child process. Safe to call more than one time. */
    stop(): void;
    /** Closes the channel and releases the route. Safe to call more than one time. */
    close(): Promise<void>;
}
export interface CommandManagedRuntimeRunner {
    /**
     * True when the provider verified the concurrent-sync opt-in. A native runner
     * carries the value from the effective capability snapshot
     * (`concurrentSyncOperations`). The client copies it onto the prepared sync
     * client only on the native path; the base64 fallback ignores it and always
     * permits concurrency. The default is false, so an undeclared native provider
     * never permits concurrent sync operations.
     */
    allowConcurrentSyncOperations?: boolean;
    /**
     * True only when `execute({ stdin })` can surface useful in-flight progress
     * for a single stdin-backed command. Provider-backed sandbox runners usually
     * complete the entire RPC before returning, so they should leave this false
     * and let the caller choose a chunked upload path when progress is requested.
     */
    supportsSingleStreamStdinProgress?: boolean;
    execute(input: {
        command: string;
        args?: string[];
        cwd?: string;
        env?: Record<string, string>;
        stdin?: string;
        timeoutMs?: number;
        onLog?: (stream: "stdout" | "stderr", chunk: string) => Promise<void>;
        onSpawn?: (meta: {
            pid: number;
            startedAt: string;
        }) => Promise<void>;
        /**
         * Run this command through the lease's persistent session even when no run
         * step is active. A sandbox provider opens the session on the first
         * non-bypassed command; the ACP process session bridge sets this so the
         * long-lived agent command streams its output through the session log
         * stream. The default keeps the context-based session selection.
         */
        useSession?: boolean;
        /**
         * Run this command outside the lease's persistent session even when a run
         * step is active. The persistent session is a single serialized shell. In
         * streamed mode the agent runs as one long-lived foreground command that
         * holds the session for the whole run. The bridge control-plane execs
         * (input delivery, output read, callback relay, and the queue/setup
         * bookkeeping) must run concurrently with the agent, so they run as
         * independent one-shot commands. On the session they queue behind the agent
         * command that never returns — a permanent deadlock. An explicit bypass
         * always wins over the context-based session selection and over
         * `useSession`. The default keeps the context-based session selection.
         */
        bypassSession?: boolean;
    }): Promise<RunProcessResult>;
    /**
     * Optional native inbound file transfer. Present only when the sandbox
     * provider advertises both `environmentSyncIn` and `environmentSyncOut`; the
     * client exposes `syncIn`/`syncOut` only when BOTH are present, so the
     * orchestrator either uses the native path for both directions or falls back
     * to the base64 transport for both.
     */
    syncIn?(operations: SandboxSyncOperation[]): Promise<SandboxSyncResult>;
    /** Optional native outbound file transfer. See {@link syncIn}. */
    syncOut?(operations: SandboxSyncOperation[]): Promise<SandboxSyncResult>;
    /**
     * Optional persistent duplex channel. Present only when the sandbox provider's
     * effective capability grants `duplexCommandStream`. The runner opens one
     * bidirectional channel to a long-lived command in the sandbox. The SSH runner
     * and every provider without the capability omit the member, so a caller gates
     * on its presence in the same style as {@link syncIn}/{@link syncOut}.
     *
     * HTTP/2 is the preferred transport. `queue_v1` is the soft-deprecated fallback.
     */
    openDuplexChannel?(input: DuplexChannelOpenInput): Promise<CommandManagedDuplexChannel>;
}
export interface CommandManagedRuntimeSpec {
    providerKey?: string | null;
    shellCommand?: "bash" | "sh" | null;
    leaseId?: string | null;
    remoteCwd: string;
    timeoutMs?: number | null;
}
export type CommandManagedRuntimeAsset = SandboxManagedRuntimeAsset;
/**
 * Host-side confinement guard for a sync operation's post-upload command `cwd`
 * (Security Condition C2). Runs BEFORE any handoff — native delegation OR the
 * generic fallback — so an out-of-root `cwd` is rejected fail-closed before a
 * provider ever sees it. `cwd` (when present) MUST be an absolute POSIX path with
 * no `..` segment, confined to (equal to or under) one of the operation's own
 * file-mapping target paths. Commands with no `cwd` are unconstrained here and
 * default to the runtime's stable command cwd at exec time.
 */
export declare function assertPostUploadCommandsConfined(operations: readonly SandboxSyncOperation[]): void;
export declare function createCommandManagedRuntimeClient(input: {
    runner: CommandManagedRuntimeRunner;
    commandCwd: string;
    timeoutMs: number;
    shellCommand?: "bash" | "sh" | null;
}): SandboxManagedRuntimeClient;
export declare function prepareCommandManagedRuntime(input: {
    runner: CommandManagedRuntimeRunner;
    spec: CommandManagedRuntimeSpec;
    adapterKey: string;
    workspaceLocalDir: string;
    workspaceRemoteDir?: string;
    syncWorkspace?: boolean;
    workspaceInboundMode?: WorkspaceInboundMode;
    workspaceDurableSeed?: WorkspaceDurableSeedPaths;
    workspaceBaseline?: DirectorySnapshot;
    workspaceGitSnapshot?: GitWorkspaceSnapshot | null;
    workspaceExclude?: string[];
    preserveAbsentOnRestore?: string[];
    assets?: CommandManagedRuntimeAsset[];
    /** Referenced (additional) projects to stage into the sandbox as plain, read-only trees. */
    additionalSources?: SandboxAdditionalSource[];
    installCommand?: string | null;
    /** When provided alongside `installCommand`, skip the install if `command -v <detectCommand>` succeeds. */
    detectCommand?: string | null;
    onProgress?: RuntimeProgressSink;
    onRuntimeProgress?: RuntimeStatusSink;
    runtimeSpan?: RuntimeSpanRunner;
}): Promise<PreparedSandboxManagedRuntime>;
//# sourceMappingURL=command-managed-runtime.d.ts.map