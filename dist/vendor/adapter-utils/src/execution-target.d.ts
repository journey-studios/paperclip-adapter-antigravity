import type { SshRemoteExecutionSpec } from "./ssh.js";
import { type CommandManagedDuplexChannel, type CommandManagedRuntimeAsset, type CommandManagedRuntimeRunner } from "./command-managed-runtime.js";
import type { AdditionalSourceStagingFailure, SandboxAdditionalSource, WorkspaceDurableSeedPaths, WorkspaceInboundMode } from "./sandbox-managed-runtime.js";
import type { GitWorkspaceSnapshot } from "./git-workspace-sync.js";
import type { DirectorySnapshot } from "./workspace-restore-merge.js";
export { resolveReferencedSourceIgnore } from "./sandbox-managed-runtime.js";
export type { AdditionalSourceStagingFailure, ReferencedSourceIgnoreResolution, SandboxAdditionalSource, } from "./sandbox-managed-runtime.js";
import { type SandboxRunLogTailFactory } from "./sandbox-run-log-stream.js";
import { type DuplexBrokerRunDisposition } from "./bridge-transport-contract.js";
import { type DuplexLossReason, type DuplexObservabilityRecorder } from "./duplex-observability.js";
import { type RunProcessResult, type TerminalResultCleanupOptions } from "./server-utils.js";
import { type RuntimeSpanRunner, type StartupSpanContext } from "./acpx-engine/startup-timing.js";
import type { RuntimeProgressSink, RuntimeStatusSink } from "./runtime-progress.js";
import type { LocalProcessSandboxOptions } from "./local-process-sandbox.js";
import type { RunnerIngressEndpoint } from "./runner-connectivity.js";
export type { RuntimeProgressSink } from "./runtime-progress.js";
export declare function postedIssueCommentLogMarker(method: string, requestPath: string, status: number, body: Buffer | string): string;
export type AdapterWorkspaceRealizationMode = "copy" | "in_place";
export interface AdapterWorkspacePathAlias {
    path: string;
    target: string;
}
export interface AdapterWorkspaceRealization {
    mode: AdapterWorkspaceRealizationMode;
    authoritativeRoot: string;
    pathAliases: AdapterWorkspacePathAlias[];
    outboundRestorePaths: string[];
}
interface AdapterExecutionTargetWorkspaceMetadata {
    workspaceRealization?: AdapterWorkspaceRealization | null;
}
export interface AdapterLocalExecutionTarget extends AdapterExecutionTargetWorkspaceMetadata {
    kind: "local";
    environmentId?: string | null;
    leaseId?: string | null;
}
export interface AdapterSshExecutionTarget extends AdapterExecutionTargetWorkspaceMetadata {
    kind: "remote";
    transport: "ssh";
    environmentId?: string | null;
    leaseId?: string | null;
    remoteCwd: string;
    spec: SshRemoteExecutionSpec;
}
/**
 * Read-only snapshot of the effective execution capabilities for one
 * execution target — local, ssh, sandbox, or plugin. Each flag is the
 * resolved result of the provider's declaration, the live worker's verified
 * methods, and any narrowing from the config or lease. The host computes it
 * once and attaches it to the target; a consumer reads it but never changes
 * it, so every field is `readonly`.
 */
export interface EffectiveExecutionCapabilities {
    readonly reusableLeases: boolean;
    readonly nativeSyncIn: boolean;
    readonly nativeSyncOut: boolean;
    readonly persistentProcessSessions: boolean;
    readonly independentControlCommands: boolean;
    readonly incrementalSessionOutput: boolean;
    readonly concurrentSyncOperations: boolean;
    readonly duplexCommandStream: boolean;
    /** Provider can expose a private authenticated WebSocket endpoint for runnerd. */
    readonly runnerWebSocketIngress: boolean;
}
/**
 * @deprecated Renamed to `EffectiveExecutionCapabilities`. This alias will
 * be removed in a later major release.
 */
export interface EffectiveSandboxCapabilities extends EffectiveExecutionCapabilities {
}
export interface SandboxLeaseAcquisition {
    outcome: "created" | "resumed" | "replacement";
    providerLeaseId: string;
    previousProviderLeaseId?: string;
    reason?: "not_found" | "expired" | "identity_mismatch" | "resume_failed";
}
export interface AdapterSandboxExecutionTarget extends AdapterExecutionTargetWorkspaceMetadata {
    kind: "remote";
    transport: "sandbox";
    providerKey?: string | null;
    /**
     * Read-only effective capability snapshot for this sandbox target. The host
     * resolves it from the provider declaration ∩ the verified worker methods ∩
     * narrowing, then attaches it here. Absent when no snapshot was resolved.
     */
    readonly effectiveCapabilities?: EffectiveExecutionCapabilities | null;
    /**
     * Per-run duplex bridge kill switch. The host stamps it on the same seam as
     * `effectiveCapabilities`. `true` selects the duplex transport only when the
     * capability `duplexCommandStream` is also `true`; any other value keeps the
     * file bridge. The value stays on the host and never enters the sandbox
     * environment. Absent means no grant.
     */
    readonly enableSandboxDuplexBridge?: boolean;
    /** Host-owned lifecycle override for paperclip_runner in this environment. */
    readonly runnerLifecyclePolicy?: {
        mode: "per_turn";
        idleTimeoutMs: null;
    } | {
        mode: "warm";
        idleTimeoutMs: number;
    } | null;
    /** Whether this environment is configured to reuse its provider lease. */
    readonly reusableLeaseConfigured?: boolean;
    /** Host-observed provenance for this exact sandbox acquisition. */
    readonly sandboxLeaseAcquisition?: SandboxLeaseAcquisition | null;
    shellCommand?: "bash" | "sh" | null;
    environmentId?: string | null;
    leaseId?: string | null;
    remoteCwd: string;
    timeoutMs?: number | null;
    runner?: CommandManagedRuntimeRunner;
    /** Host-only provider operation. It is never serialized into the sandbox. */
    getRunnerIngressEndpoint?: (input: {
        leaseId: string;
        port: number;
        path: string;
    }) => Promise<RunnerIngressEndpoint>;
    /**
     * Sandbox-backed adapter runs stream the agent CLI's stdout/stderr
     * incrementally via a log-tail loop beside the callback bridge instead of
     * waiting for the batched provider result. Streaming is ON by default;
     * set to `false` to explicitly opt out back to batch-at-end delivery.
     */
    streamRunLogs?: boolean | null;
    /**
     * The injected duplex observability recorder for this run. The host attaches
     * it on the same seam as `runner`, so this live object stays on the host and
     * never enters the sandbox environment. The bridge binds it to the fixed
     * duplex observability surface. Absent means the safe no-op default.
     */
    duplexObservabilityRecorder?: DuplexObservabilityRecorder | null;
}
export type AdapterExecutionTarget = AdapterLocalExecutionTarget | AdapterSshExecutionTarget | AdapterSandboxExecutionTarget;
export type AdapterRemoteExecutionSpec = SshRemoteExecutionSpec;
export type AdapterManagedRuntimeAsset = CommandManagedRuntimeAsset;
export interface PreparedAdapterExecutionTargetRuntime {
    target: AdapterExecutionTarget;
    workspaceRemoteDir: string | null;
    runtimeRootDir: string | null;
    assetDirs: Record<string, string>;
    /**
     * Remote directory of each additional (referenced) project that staged
     * successfully, keyed by `projectId`. Empty for a local target or when no
     * additional sources were requested.
     */
    additionalSourceDirs: Record<string, string>;
    /**
     * Each additional (referenced) project whose staging failed, paired with the
     * failure message. Empty for a local target, for a transport that does not
     * stage referenced projects, or when every requested project staged.
     */
    additionalSourceFailures: AdditionalSourceStagingFailure[];
    workspaceSyncSnapshot: {
        baseline: DirectorySnapshot;
        gitSnapshot: GitWorkspaceSnapshot | null;
    } | null;
    restoreWorkspace(onProgress?: RuntimeProgressSink): Promise<void>;
}
export interface AdapterExecutionTargetProcessOptions {
    cwd: string;
    env: Record<string, string>;
    stdin?: string;
    timeoutSec: number;
    graceSec: number;
    onLog: (stream: "stdout" | "stderr", chunk: string) => Promise<void>;
    onRuntimeProgress?: RuntimeStatusSink;
    onSpawn?: (meta: {
        pid: number;
        processGroupId: number | null;
        startedAt: string;
    }) => Promise<void>;
    terminalResultCleanup?: TerminalResultCleanupOptions;
    /**
     * Sandbox-only: factory from the Paperclip bridge handle that streams the
     * CLI's stdout/stderr during the run. When provided, the batched provider
     * onLog is suppressed and incremental chunks flow through `onLog` instead.
     */
    runLogTail?: SandboxRunLogTailFactory | null;
    /**
     * Sandbox-only: the atomic run-disposition settle from the Paperclip bridge
     * handle. When provided, `runAdapterExecutionTargetProcess` calls it once at
     * the clean-completion boundary of the process, synchronously and before the
     * run-log tail finishes. The call reads the disposition and marks the
     * host-observed orderly completion in one broker step, so a gateway exit
     * after the clean process completion cannot latch a false mid-run loss. A
     * control channel that died before the clean completion still fails the run
     * closed with the typed `duplex_channel_lost` code. The file bridge path
     * never sets it.
     */
    settleRunDisposition?: (() => DuplexBrokerRunDisposition) | null;
    localProcessSandbox?: LocalProcessSandboxOptions | null;
}
export interface AdapterExecutionTargetShellOptions {
    cwd: string;
    env: Record<string, string>;
    timeoutSec?: number;
    graceSec?: number;
    onLog?: (stream: "stdout" | "stderr", chunk: string) => Promise<void>;
}
export interface AdapterExecutionTargetPaperclipBridgeHandle {
    env: Record<string, string>;
    /**
     * Present when the sandbox target opted into run-log streaming
     * (`streamRunLogs`). Create one handle per CLI attempt and pass it to
     * `runAdapterExecutionTargetProcess` via `options.runLogTail`.
     */
    runLogTail?: SandboxRunLogTailFactory | null;
    /**
     * Read the terminal run disposition of the duplex control channel. It reports a
     * failure when the channel was lost before an orderly completion, and names the
     * typed loss reason. It reports a success for a healthy channel or a
     * normal-teardown loss. The file bridge path never sets it, so the method is
     * absent there. The caller reads it at the run-disposition seam to fail a run
     * whose control channel died mid-turn.
     */
    readRunDisposition?(): DuplexBrokerRunDisposition;
    /**
     * Atomically read the run disposition and mark the host-observed orderly
     * completion in one broker step. The ACP lane calls it at the terminal
     * finalization boundary for a success-eligible completion, so no `await` can
     * separate the read from the mark and a teardown loss cannot slip in between.
     * A loss that already latched keeps the failure, because the broker no-ops the
     * mark after a latched loss. The file bridge path never sets it.
     */
    settleRunDisposition?(): DuplexBrokerRunDisposition;
    /**
     * Mark the host-observed orderly completion of the agent turn on the broker's
     * ordered lifecycle. The caller marks it at the ACP terminal-finalization
     * boundary for a still-success-eligible completion, so a later teardown loss
     * cannot flip the run to a failure. A loss that already latched keeps the
     * failure, because the broker no-ops the mark after a latched loss. The file
     * bridge path never sets it, so the method is absent there.
     */
    markOrderlyCompletion?(): void;
    /**
     * Register a listener for a newly latched terminal loss. The listener
     * fires at most once, and only for a loss that flips the disposition to
     * failed — never for a clean channel end that orders after a
     * host-observed orderly completion. Returns a function that unregisters
     * the listener.
     *
     * The caller uses this to abort an in-flight Agent Client Protocol turn
     * the moment the channel dies, instead of waiting for the turn to return
     * a terminal result on its own (a dead channel can leave a turn with
     * nothing to return). The file bridge path never sets it, so the method
     * is absent there.
     */
    onLoss?(listener: (reason: DuplexLossReason) => void): () => void;
    stop(): Promise<void>;
}
export interface AdapterExecutionTargetProcessSessionBridgeHandle {
    agentCommand: string;
    stop(): Promise<void>;
}
export { sanitizeRemoteExecutionEnv } from "./remote-execution-env.js";
export declare const DEFAULT_REMOTE_SANDBOX_ADAPTER_TIMEOUT_SEC = 14400;
export declare function adapterExecutionTargetToRemoteSpec(target: AdapterExecutionTarget | null | undefined): AdapterRemoteExecutionSpec | null;
export declare function adapterExecutionTargetIsRemote(target: AdapterExecutionTarget | null | undefined): boolean;
export declare function adapterExecutionTargetUsesManagedHome(target: AdapterExecutionTarget | null | undefined): boolean;
/**
 * Read the per-run duplex bridge kill switch off a target. Only a sandbox
 * target with `enableSandboxDuplexBridge` set to `true` returns `true`. Every
 * other target and every other value returns `false`, so the caller fails
 * closed to the file bridge.
 */
export declare function adapterExecutionTargetEnablesSandboxDuplexBridge(target: AdapterExecutionTarget | null | undefined): boolean;
/**
 * Read the injected duplex observability recorder off a target. Only a
 * sandbox target with a recorder attached returns it. Every other target
 * returns null, so the bridge falls back to the safe no-op recorder.
 */
export declare function adapterExecutionTargetDuplexObservabilityRecorder(target: AdapterExecutionTarget | null | undefined): DuplexObservabilityRecorder | null;
export declare function adapterExecutionTargetRemoteCwd(target: AdapterExecutionTarget | null | undefined, localCwd: string): string;
export declare function overrideAdapterExecutionTargetRemoteCwd(target: AdapterExecutionTarget | null | undefined, remoteCwd: string | null | undefined): AdapterExecutionTarget | null | undefined;
export declare function resolveAdapterExecutionTargetCwd(target: AdapterExecutionTarget | null | undefined, configuredCwd: string | null | undefined, localFallbackCwd: string): string;
export declare function adapterExecutionTargetUsesPaperclipBridge(target: AdapterExecutionTarget | null | undefined): boolean;
export declare function describeAdapterExecutionTarget(target: AdapterExecutionTarget | null | undefined): string;
export type AdapterExecutionTargetTimeoutSource = "configured" | "sandbox_default" | "unlimited";
export interface AdapterExecutionTargetTimeoutResolution {
    /** Resolved wall-clock timeout in seconds; 0 means no adapter timeout. */
    timeoutSec: number;
    /** Which knob produced the resolved value, for logs and error messages. */
    source: AdapterExecutionTargetTimeoutSource;
}
export declare function resolveAdapterExecutionTargetTimeout(target: AdapterExecutionTarget | null | undefined, configuredTimeoutSec: number | null | undefined): AdapterExecutionTargetTimeoutResolution;
export declare function resolveAdapterExecutionTargetTimeoutSec(target: AdapterExecutionTarget | null | undefined, configuredTimeoutSec: number | null | undefined): number;
/**
 * Self-describing error message for when the adapter wall-clock execution
 * timeout kills a run. Names the timer that fired and the knob that controls
 * it so run failures never surface as a bare "Timed out".
 */
export declare function formatAdapterExecutionTimeoutErrorMessage(resolution: AdapterExecutionTargetTimeoutResolution): string;
/**
 * One-line start-of-run statement of the effective wall-clock timeout and its
 * source. Callers prefix with `[paperclip] ` and append a newline.
 */
export declare function formatAdapterExecutionTimeoutStartLogLine(resolution: AdapterExecutionTargetTimeoutResolution): string;
export declare function ensureAdapterExecutionTargetCommandResolvable(command: string, target: AdapterExecutionTarget | null | undefined, cwd: string, env: NodeJS.ProcessEnv, options?: {
    installCommand?: string | null;
    timeoutSec?: number | null;
}): Promise<void>;
export declare function resolveAdapterExecutionTargetCommandForLogs(command: string, target: AdapterExecutionTarget | null | undefined, cwd: string, env: NodeJS.ProcessEnv): Promise<string>;
export declare function runAdapterExecutionTargetProcess(runId: string, target: AdapterExecutionTarget | null | undefined, command: string, args: string[], options: AdapterExecutionTargetProcessOptions): Promise<RunProcessResult>;
export declare function runAdapterExecutionTargetShellCommand(runId: string, target: AdapterExecutionTarget | null | undefined, command: string, options: AdapterExecutionTargetShellOptions): Promise<RunProcessResult>;
export interface AdapterSandboxInstallCommandCheck {
    code: string;
    level: "info" | "warn" | "error";
    message: string;
    detail?: string;
    hint?: string;
}
export declare function maybeRunSandboxInstallCommand(input: {
    runId: string;
    target: AdapterExecutionTarget | null | undefined;
    adapterKey: string;
    installCommand: string;
    /** When provided, skip the install if `command -v <detectCommand>` succeeds. */
    detectCommand?: string | null;
    env?: Record<string, string>;
    timeoutSec?: number;
}): Promise<AdapterSandboxInstallCommandCheck | null>;
export declare function readAdapterExecutionTargetHomeDir(runId: string, target: AdapterExecutionTarget | null | undefined, options: AdapterExecutionTargetShellOptions): Promise<string | null>;
export declare function ensureAdapterExecutionTargetRuntimeCommandInstalled(input: {
    runId: string;
    target: AdapterExecutionTarget | null | undefined;
    installCommand?: string | null;
    detectCommand?: string | null;
    cwd: string;
    env: Record<string, string>;
    timeoutSec?: number;
    graceSec?: number;
    onLog?: AdapterExecutionTargetShellOptions["onLog"];
}): Promise<void>;
export declare function ensureAdapterExecutionTargetFile(runId: string, target: AdapterExecutionTarget | null | undefined, filePath: string, options: AdapterExecutionTargetShellOptions): Promise<void>;
/**
 * Ensure a working directory exists (and is a directory) on the execution target.
 *
 * For local targets this delegates to the local `ensureAbsoluteDirectory` helper
 * (Node fs). For remote (SSH/sandbox) targets it shells out and runs
 * `mkdir -p` (when allowed) followed by a `[ -d ]` check so the result reflects
 * the directory state inside the environment, not on the Paperclip host.
 *
 * Throws an Error with a human-readable message on failure.
 */
export declare function ensureAdapterExecutionTargetDirectory(runId: string, target: AdapterExecutionTarget | null | undefined, cwd: string, options: AdapterExecutionTargetShellOptions & {
    createIfMissing?: boolean;
}): Promise<void>;
export declare function adapterExecutionTargetSessionIdentity(target: AdapterExecutionTarget | null | undefined): Record<string, unknown> | null;
export declare function adapterExecutionTargetSessionMatches(saved: unknown, target: AdapterExecutionTarget | null | undefined): boolean;
export declare function parseAdapterExecutionTarget(value: unknown): AdapterExecutionTarget | null;
export declare function adapterExecutionTargetFromRemoteExecution(remoteExecution: unknown, metadata?: Pick<AdapterLocalExecutionTarget, "environmentId" | "leaseId">): AdapterExecutionTarget | null;
export declare function readAdapterExecutionTarget(input: {
    executionTarget?: unknown;
    legacyRemoteExecution?: unknown;
}): AdapterExecutionTarget | null;
export declare function prepareAdapterExecutionTargetRuntime(input: {
    runId: string;
    target: AdapterExecutionTarget | null | undefined;
    adapterKey: string;
    workspaceLocalDir: string;
    timeoutSec?: number;
    workspaceRemoteDir?: string;
    syncWorkspace?: boolean;
    workspaceInboundMode?: WorkspaceInboundMode;
    workspaceDurableSeed?: WorkspaceDurableSeedPaths;
    workspaceBaseline?: DirectorySnapshot;
    workspaceGitSnapshot?: GitWorkspaceSnapshot | null;
    workspaceExclude?: string[];
    preserveAbsentOnRestore?: string[];
    assets?: AdapterManagedRuntimeAsset[];
    /** Referenced (additional) projects to stage into the sandbox as plain, read-only trees. */
    additionalSources?: SandboxAdditionalSource[];
    installCommand?: string | null;
    /** When provided alongside `installCommand`, skip the install if the binary is already on PATH. */
    detectCommand?: string | null;
    onProgress?: RuntimeProgressSink;
    onRuntimeProgress?: RuntimeStatusSink;
    runtimeSpan?: RuntimeSpanRunner;
}): Promise<PreparedAdapterExecutionTargetRuntime>;
export declare function runtimeAssetDir(prepared: Pick<PreparedAdapterExecutionTargetRuntime, "assetDirs">, key: string, fallbackRemoteCwd: string): string;
type GitHubLauncherLocation = {
    runId: string;
    target: AdapterExecutionTarget | null | undefined;
};
/** Call only after execution settles, before releasing its remote environment lease. */
export declare function cleanupGitHubOperationLaunchers(input: GitHubLauncherLocation): Promise<void>;
/** Read only execution-target Git context; never import the controller's credentials into SSH. */
export declare function prepareGitHubExecutionEnvironment(input: {
    target: AdapterExecutionTarget | null | undefined;
    cwd: string;
    env: Record<string, string>;
    hostCredentials: boolean;
    networkAccess: boolean;
}): Promise<Record<string, string>>;
/** Stage token-free launchers next to the execution, not in shared global Git config. */
export declare function prepareGitHubOperationLaunchers(input: {
    runId: string;
    target: AdapterExecutionTarget | null | undefined;
    cwd: string;
    env: Record<string, string>;
}): Promise<Record<string, string>>;
export declare function startAdapterExecutionTargetProcessSessionBridge(input: {
    runId: string;
    target: AdapterExecutionTarget | null | undefined;
    runtimeRootDir: string | null | undefined;
    adapterKey: string;
    command: string;
    args: string[];
    cwd: string;
    env: Record<string, string> | (() => Promise<Record<string, string>>);
    timeoutSec?: number | null;
    onLog?: (stream: "stdout" | "stderr", chunk: string) => Promise<void>;
    getRuntimeParentContext?: () => StartupSpanContext | undefined;
    runtimeSpan?: RuntimeSpanRunner;
    streamOutputViaSession?: boolean;
}): Promise<AdapterExecutionTargetProcessSessionBridgeHandle | null>;
export declare function getProcessSessionRemoteSource(input?: {
    outputToStdout?: boolean;
}): string;
/**
 * Build the argument vector that launches the duplex gateway in the sandbox. The
 * host passes the assigned port and the per-open nonce only through the launch
 * environment, so the argument vector sets them as environment assignments in
 * front of the node command. No addressing data comes from the channel.
 *
 * The script uses `exec env NAME=value ... command`. A POSIX shell accepts an
 * environment-assignment prefix only on a plain command, never on `exec`. The
 * form `exec NAME=value command` exits with status 127. The `env` utility carries
 * the assignments, and `exec` still replaces the shell with the gateway process,
 * so the gateway keeps the process slot and the assigned environment.
 */
export declare function buildDuplexGatewayLaunchArgv(input: {
    shellCommand: "bash" | "sh";
    remoteEntrypoint: string;
    nodeCommand?: string | null;
    env: Record<string, string>;
}): string[];
/** The reason the duplex readiness handshake did not pass. */
type DuplexReadinessFailure = "protocol_contamination" | "nonce_mismatch" | "channel_exit" | "timeout";
/** The outcome of the duplex readiness handshake. */
type DuplexReadinessResult = {
    ok: true;
} | {
    ok: false;
    reason: DuplexReadinessFailure;
};
/** The terminal outcome of the preface scan: either the client preface
 * appeared inside the bounded readiness buffer, or it did not. */
type Http2PrefaceScanResult = "found" | "missing";
/**
 * Test-only surface for {@link scanForHttp2ClientPreface}. A test drives the
 * post-preface replay cap across every terminal path without the whole
 * bridge. Production code never reads this export.
 */
export declare const __http2PrefaceScanTesting: {
    scanForHttp2ClientPreface: (channel: CommandManagedDuplexChannel, options: {
        capBytes: number;
        timeoutMs: number;
    }) => {
        scanned: CommandManagedDuplexChannel;
        settled: Promise<Http2PrefaceScanResult>;
        replayOverflowed: () => boolean;
    };
    readScanSearchUnits: () => number;
    resetScanSearchUnits: () => void;
    readScanBufferGrowthCopyUnits: () => number;
    resetScanBufferGrowthCopyUnits: () => void;
    readReplayBufferGrowthCopyUnits: () => number;
    resetReplayBufferGrowthCopyUnits: () => void;
};
/**
 * Test-only surface for the pre-READY readiness gate. A test reads the scan
 * count to prove the newline search work stays linear in the bytes received.
 * Production code does not use this object.
 */
export declare const __duplexReadinessTesting: {
    readNewlineScanUnits: () => number;
    resetNewlineScanUnits: () => void;
    readBufferGrowthCopyUnits: () => number;
    resetBufferGrowthCopyUnits: () => void;
    createReadinessGate: (channel: CommandManagedDuplexChannel, options: {
        nonce: string;
        timeoutMs: number;
    }) => DuplexReadinessGate;
};
interface DuplexReadinessGate {
    /** Resolves with the handshake outcome. It never rejects. */
    readonly ready: Promise<DuplexReadinessResult>;
    /**
     * The channel view the broker consumes after readiness passes. It replays the
     * bytes that followed the READY frame, then forwards each later chunk and the
     * exit. The gate keeps one real data listener, so the broker never double-binds
     * the channel.
     */
    readonly brokerChannel: CommandManagedDuplexChannel;
    /**
     * Report whether a post-READY pre-bind chunk tipped the pending replay buffer
     * past {@link DUPLEX_READINESS_BUFFER_CAP_BYTES}. On such an overflow the gate
     * drops the pending replay buffer and stops the channel. The caller reads this
     * after `ready` resolves `ok`, and before it binds the broker.
     */
    replayOverflowed(): boolean;
    /**
     * Drop the pending replay buffer. The caller runs this on a terminal path that
     * abandons the pending replay without a broker handoff: a readiness failure, a
     * replay overflow, or a broker-construction failure. The normal handoff already
     * drops the buffer inside `brokerChannel.onData`, so a later call here is a
     * no-op.
     */
    disposePendingReplay(): void;
    /**
     * Test-only. Report the length of the retained pre-READY buffer, in bytes. A
     * test reads this to prove the gate drops the pre-READY buffer on READY
     * acceptance, so the process does not retain the sandbox-controlled prefix.
     * Production code does not read this.
     */
    retainedReadinessBufferLength(): number;
}
export declare function startAdapterExecutionTargetPaperclipBridge(input: {
    runId: string;
    target: AdapterExecutionTarget | null | undefined;
    runtimeRootDir: string | null | undefined;
    adapterKey: string;
    timeoutSec?: number | null;
    hostApiToken: string | null | undefined;
    hostApiUrl?: string | null;
    onLog?: (stream: "stdout" | "stderr", chunk: string) => Promise<void>;
    maxBodyBytes?: number | null;
    forwardTimeoutMs?: number | null;
    enableSandboxDuplexBridge?: boolean | null;
    duplexReadinessTimeoutMs?: number | null;
    getRuntimeParentContext?: () => StartupSpanContext | undefined;
    runtimeSpan?: RuntimeSpanRunner;
    duplexObservabilityRecorder?: DuplexObservabilityRecorder | null;
}): Promise<AdapterExecutionTargetPaperclipBridgeHandle | null>;
//# sourceMappingURL=execution-target.d.ts.map