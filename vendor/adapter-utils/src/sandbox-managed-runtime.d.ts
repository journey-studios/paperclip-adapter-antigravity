import { type GitWorkspaceSnapshot } from "./git-workspace-sync.js";
import { type DirectorySnapshot } from "./workspace-restore-merge.js";
import { type RuntimeProgressSink, type RuntimeStatusSink } from "./runtime-progress.js";
import type { RuntimeSpanRunner } from "./acpx-engine/startup-timing.js";
export interface SandboxRemoteExecutionSpec {
    transport: "sandbox";
    provider: string;
    sandboxId: string;
    remoteCwd: string;
    timeoutMs: number;
    apiKey: string | null;
}
/**
 * Remote paths handed to an asset's `provision.postUploadCommand`. All are POSIX
 * paths inside the sandbox: `assetTarPath` is the uploaded asset tarball,
 * `assetDir` is where the asset should be materialized, and `runtimeRootDir`
 * is the directory any `stageFiles` were written into.
 */
export interface SandboxManagedRuntimeAssetProvisionContext {
    assetTarPath: string;
    assetDir: string;
    runtimeRootDir: string;
}
/**
 * Per-asset inbound provisioning contribution. The core is adapter-agnostic:
 * an asset that supplies neither `stageFiles` nor `postUploadCommand` is
 * materialized with a plain destroy-then-replace `tar -xf`. An adapter that
 * needs custom provisioning (e.g. a credential merge) supplies helper files via
 * `stageFiles` and the shell command that consumes them via `postUploadCommand`.
 *
 * Both contributions ride the unified {@link SandboxSyncOperation} the core
 * builds per asset: `stageFiles` become additional `files` mappings placed
 * alongside the asset tar, and `postUploadCommand` becomes the operation's
 * ordered `postUploadCommands`. See {@link SandboxPostUploadCommand} for the
 * command-origin / confinement security contract (C1–C3).
 */
export interface SandboxManagedRuntimeAssetProvision {
    /**
     * Extra files placed into `runtimeRootDir` (alongside the asset tar) before
     * the post-upload command runs — typically helper scripts the command
     * invokes. Contents may be raw bytes or a UTF-8 string.
     */
    stageFiles?: {
        name: string;
        contents: Buffer | string;
    }[];
    /**
     * Builds the opaque, adapter-authored shell command that materializes the
     * uploaded asset tar into `assetDir`, run as the operation's ordered
     * post-upload command after every mapping has landed. Defaults to a plain
     * destroy-then-replace `tar -xf` extraction when omitted. Any path embedded in
     * the command MUST be built from already-confined paths and shell-quoted (C3).
     */
    postUploadCommand?: (ctx: SandboxManagedRuntimeAssetProvisionContext) => string;
}
/**
 * Context passed to an asset's `restore` contribution during teardown.
 * `assetDir` is the asset's directory inside the sandbox and `readFile` reads
 * a file back from the sandbox as raw bytes. `tempDir` is a host scratch
 * directory that belongs to this restore task alone. The shared scheduler can
 * run restore tasks at the same time, so a task must not share scratch space
 * with another task. A restore that needs a host temporary file writes it under
 * `tempDir`. The coordinator removes the directory after the task settles. The
 * sandbox coordinator always sets `tempDir`. A serial runtime that never runs
 * restore tasks at the same time can omit it.
 */
export interface SandboxManagedRuntimeAssetRestoreContext {
    assetDir: string;
    readFile: (remotePath: string) => Promise<Buffer>;
    tempDir?: string;
}
export interface SandboxManagedRuntimeAsset {
    key: string;
    localDir: string;
    followSymlinks?: boolean;
    exclude?: string[];
    /** Optional inbound provisioning contribution (staged files + extract command). */
    provision?: SandboxManagedRuntimeAssetProvision;
    /**
     * Optional teardown/outbound contribution, invoked once per asset during
     * `restoreWorkspace`. Defaults to a no-op when omitted.
     */
    restore?: (ctx: SandboxManagedRuntimeAssetRestoreContext) => Promise<void>;
}
/**
 * How a referenced project's Git-ignored paths were resolved, computed once
 * per project by `resolveReferencedSourceIgnore` before staging starts. The
 * sandbox lane, the SSH lane, and the content-signature walk each consume
 * this ONE resolution, so the three sites never drift apart.
 *
 * - `git`: `localPath` is a Git work tree. `ignoredPaths` are its ignored
 *   entries, already re-relativized to `localPath` (see
 *   `resolveReferencedSourceIgnore`).
 * - `other`: `localPath` is not a Git work tree. The staging path keeps
 *   today's fixed heavy-directory excludes.
 * - `failed`: the Git read failed, timed out, breached a parse bound, or
 *   returned output the resolver could not safely re-relativize. The project
 *   is NOT staged (fail closed) — every site records it as a per-project
 *   failure instead of shipping it unfiltered. `reason` is always one of
 *   {@link REFERENCED_SOURCE_IGNORE_FAILURE_REASONS} — never a raw Git or tar
 *   diagnostic, an absolute host path, or a basename.
 */
export type ReferencedSourceIgnoreResolution = {
    kind: "git";
    ignoredPaths: string[];
} | {
    kind: "other";
} | {
    kind: "failed";
    reason: string;
};
/**
 * The fixed, allowlisted failure categories a `failed`
 * {@link ReferencedSourceIgnoreResolution} reports as `reason`. This is the
 * ENTIRE vocabulary: no absolute host path, no basename, no opaque token, and
 * no raw Git or tar stderr ever reaches `reason` — only one of these three
 * stable strings, chosen once at the single construction point in
 * `resolveReferencedSourceIgnore`. A `failed` resolution always prevents
 * staging and is always re-resolved before its next use, so two different
 * underlying failures colliding on the same category (e.g. a timeout and a
 * malformed-output error both reporting `scanFailed`) never weakens the
 * fail-closed decision.
 */
export declare const REFERENCED_SOURCE_IGNORE_FAILURE_REASONS: {
    /** A Git read failed, timed out, was cancelled, or returned malformed output — including a saturated scan queue that never recovered after its retries. */
    readonly scanFailed: "git-ignore-scan-failed";
    /** The parsed ignored-entry count or total UTF-8 byte size breached its bound (see `readReferencedSourceGitIgnoredPaths`). */
    readonly limitExceeded: "git-ignore-scan-limit-exceeded";
    /** The referenced project's `localPath` is not a descendant of its own Git top level. */
    readonly toplevelNotDescendant: "git-toplevel-not-descendant";
};
/**
 * A referenced (additional) project to stage into the run sandbox as a plain,
 * read-only tree. `localPath` is the host checkout directory. Upstream code
 * already authorized and realized this directory (`project:read`); this layer
 * adds no authorization logic. `projectId` names the isolated remote
 * subdirectory (`project-<projectId>` under the runtime root) the tree lands in.
 *
 * Additional sources are plain trees only. They never carry the anchor
 * workspace's git-history, overlay, or `.paperclip-runtime` preservation
 * semantics — those stay anchor-only.
 *
 * `ignoreResolution` is required so every construction site must supply it
 * explicitly — a caller cannot default to the unfiltered legacy behavior by
 * omission. Resolve it once per project with `resolveReferencedSourceIgnore`.
 */
export interface SandboxAdditionalSource {
    localPath: string;
    projectId: string;
    ignoreResolution: ReferencedSourceIgnoreResolution;
}
/**
 * Escape tar `--exclude` glob metacharacters (`*`, `?`, `[`) in a literal
 * path, so a Git-ignored path that happens to contain one of them is matched
 * literally instead of as a pattern. Without this, a repository-controlled
 * path containing e.g. `*` could exclude unrelated sibling files that
 * happen to match the resulting glob. GNU tar and bsdtar both honor a
 * backslash as a `fnmatch` escape character, so this is not command
 * injection — `createTarballFromDirectory` and the SSH tar equivalent both
 * pass `--exclude` values as argument-vector entries, never through a shell.
 */
export declare function escapeTarExcludeLiteral(entry: string): string;
/**
 * The tar `--exclude` entries a referenced project's resolved ignore set
 * contributes, on top of the fixed heavy-directory excludes every site
 * already applies. Empty for `other` (today's fixed excludes are enough)
 * and for `failed` (the project is not staged at all, so no exclude list
 * matters).
 */
export declare function referencedSourceIgnoreExcludeEntries(resolution: ReferencedSourceIgnoreResolution): string[];
/**
 * Resolve a referenced project's Git-ignored paths ONCE, before any staging
 * site runs. Called once per project (see `execute.ts`); the sandbox lane,
 * the SSH lane, and the content-signature walk all consume this one result,
 * so they can never apply a different exclusion set to the same project.
 *
 * Fails closed: a Git read error, a timeout, malformed output, a parse-bound
 * breach, or a `localPath` that is not a plain descendant of its own Git
 * toplevel all return `failed`, never an empty ignore list — an empty list
 * means "resolved, nothing extra to exclude", which is a different claim than
 * "the resolution did not run".
 *
 * Retries ONLY a saturated scan queue (the shared workspace Git operation
 * scheduler rejecting before spawn because it is at capacity) — a liveness
 * condition, not an integrity one. Three attempts total, with the bounded
 * backoff in {@link REFERENCED_SOURCE_IGNORE_SCAN_RETRY_DELAYS_MS}, retried
 * through the same registered scheduler every time. No direct-spawn fallback
 * exists: bypassing the scheduler would defeat the process-wide concurrency
 * limit it enforces. Every other failure — timeout, cancellation, an output
 * limit, a permission error, malformed output, a real Git failure, or a bound
 * breach — makes exactly one attempt and fails closed immediately.
 */
export declare function resolveReferencedSourceIgnore(localPath: string): Promise<ReferencedSourceIgnoreResolution>;
/**
 * Per-call byte-level progress hook. `transferredBytes`/`totalBytes` are decoded
 * file bytes (not the base64 wire size). `totalBytes` is null when the size is
 * not known up front. The transport is the source of truth for byte counts; the
 * orchestrator owns the phase label and direction.
 */
export interface SandboxTransferProgressOptions {
    onProgress?: (transferredBytes: number, totalBytes: number | null) => void | Promise<void>;
}
/**
 * A single source→target file or directory transfer within a sync operation.
 * Mirrors the plugin SDK `PluginSyncFileMapping`; kept as a local structural
 * type so `adapter-utils` does not depend on the plugin SDK. For `syncIn`,
 * `sourcePath` is a host path and `targetPath` a sandbox path; for `syncOut` the
 * direction is reversed. Sandbox paths are POSIX.
 */
export interface SandboxSyncFileMapping {
    sourcePath: string;
    targetPath: string;
    kind: "file" | "directory";
    mode?: number;
    exclude?: string[];
    followSymlinks?: boolean;
    /**
     * Advisory read-write intent for the sandbox target. `"rw"` marks a target the
     * agent may change and keep; `"ro"` marks a read-only tree. An absent value
     * defaults to `"ro"` (read-only is the safe default for an advisory signal).
     * The field is advisory metadata for an optional sandbox feedback wrapper. It
     * does not change the transfer and adds no security.
     */
    access?: "rw" | "ro";
    /**
     * The sandbox directory that becomes read-write when `access` is `"rw"` and a
     * post-upload command extracts `targetPath` into a different directory. A tar
     * mapping uploads an archive under the runtime root, so its `targetPath` is the
     * staging archive, not the directory the extract command fills. This field
     * names that final destination directory. When absent, the read-write
     * destination is the parent directory of `targetPath`. Advisory; ignored when
     * `access` is not `"rw"`.
     */
    writablePath?: string;
}
/**
 * A control command run against the sandbox after a sync operation's files have
 * landed. Mirrors the plugin SDK `PluginPostUploadCommand`; kept as a local
 * structural type so `adapter-utils` does not depend on the plugin SDK. Ordered
 * within {@link SandboxSyncOperation.postUploadCommands} and executed in array
 * order, fail-fast (first non-zero exit or timeout aborts the operation).
 *
 * SECURITY — command origin (Stage-1 design review, condition C1). `command` is
 * a **Paperclip/adapter-authored control operation**: it may be supplied ONLY by
 * core/adapter code. No server route, issue/comment content, project/workspace
 * file content, provider-plugin callback, or arbitrary adapter config may supply
 * a raw `command` string; any path embedded in it MUST be built by adapter/core
 * helpers from already-confined paths and shell-quoted (C3). Providers treat the
 * command as **opaque** — execute or reject, never rewrite/concatenate/append.
 */
export interface SandboxPostUploadCommand {
    /** The opaque, adapter-authored shell command to run after upload. */
    command: string;
    /**
     * Working directory for the command. When present, MUST be an absolute POSIX
     * path confined under the operation's allowed sandbox target root (C2). When
     * absent, defaults to the runtime's stable command cwd — never a process
     * default cwd.
     */
    cwd?: string;
    /** Optional per-command timeout in milliseconds. */
    timeoutMs?: number;
}
/**
 * An ordered, opaque unit of work handed to the native sync transport. The
 * `operationId` is an opaque, non-sensitive token authored by the orchestrator
 * (never a caller/asset identifier that could leak intent); a provider MUST NOT
 * interpret it.
 */
export interface SandboxSyncOperation {
    operationId: string;
    files: SandboxSyncFileMapping[];
    /**
     * Optional ordered control commands run after this operation's files land, in
     * array order, fail-fast. Absent means "no commands" — byte-identical to a
     * pre-contract operation. See {@link SandboxPostUploadCommand} for the command
     * origin/confinement security contract (C1–C4).
     */
    postUploadCommands?: SandboxPostUploadCommand[];
}
export interface SandboxSyncResult {
    operations: {
        operationId: string;
        filesTransferred: number;
        bytesTransferred: number;
    }[];
}
export interface SandboxManagedRuntimeClient {
    makeDir(remotePath: string): Promise<void>;
    writeFile(remotePath: string, bytes: ArrayBuffer, options?: SandboxTransferProgressOptions): Promise<void>;
    readFile(remotePath: string, options?: SandboxTransferProgressOptions): Promise<Buffer | Uint8Array | ArrayBuffer>;
    listFiles(remotePath: string): Promise<string[]>;
    remove(remotePath: string): Promise<void>;
    run(command: string, options: {
        timeoutMs: number;
    }): Promise<void>;
    /**
     * True when the orchestrator may run this client's sync operations
     * concurrently. The base64 fallback always sets it true. A native provider
     * takes the value from the verified `concurrentSyncOperations` opt-in; an
     * undeclared native provider keeps it false. One flag serves both `syncIn` and
     * `syncOut`. `createCommandManagedRuntimeClient` always sets it on a prepared
     * client; it is optional here so a test mock can omit it.
     */
    allowConcurrentSyncOperations?: boolean;
    /**
     * Optional native inbound transfer. Present only when the sandbox provider
     * advertises both `environmentSyncIn` and `environmentSyncOut`; otherwise the
     * orchestrator falls back to the tar + base64 `writeFile`/`run` path so
     * behavior is byte-identical to a provider that never opted in.
     */
    syncIn?(operations: SandboxSyncOperation[]): Promise<SandboxSyncResult>;
    /** Optional native outbound transfer. See {@link syncIn}. */
    syncOut?(operations: SandboxSyncOperation[]): Promise<SandboxSyncResult>;
}
/**
 * Host-side complete-mediation guard for native sync operations. The orchestrator
 * authors every `targetPath`, but the native transport crosses the host↔sandbox
 * trust boundary, so we canonicalize and confine each mapping's source and target
 * to an orchestrator-owned root before handing the operation to a provider.
 * Absolute escapes and `..` traversal are rejected fail-closed. Sandbox and host
 * paths on the server are POSIX.
 */
export declare function assertSyncOperationsConfined(operations: SandboxSyncOperation[], roots: {
    sourceRoots: string[];
    targetRoots: string[];
}): void;
export interface PreparedSandboxManagedRuntime {
    spec: SandboxRemoteExecutionSpec;
    workspaceLocalDir: string;
    workspaceRemoteDir: string;
    runtimeRootDir: string;
    assetDirs: Record<string, string>;
    /**
     * Remote directory of each additional (referenced) project that staged
     * successfully, keyed by `projectId`. A project whose staging failed is
     * absent (per-project failure isolation). Empty when no additional sources
     * were requested.
     */
    additionalSourceDirs: Record<string, string>;
    /**
     * Each additional (referenced) project whose staging failed, paired with the
     * failure message. Per-project failure isolation keeps one project's failure
     * from aborting the run, so a failed project is absent from
     * `additionalSourceDirs` and present here. Empty when every requested project
     * staged, or when no additional sources were requested.
     */
    additionalSourceFailures: AdditionalSourceStagingFailure[];
    /** Durable merge inputs used to resume an outbound restore after host restart. */
    workspaceSyncSnapshot: {
        baseline: DirectorySnapshot;
        gitSnapshot: GitWorkspaceSnapshot | null;
    } | null;
    restoreWorkspace(onProgress?: RuntimeProgressSink): Promise<void>;
}
export type WorkspaceInboundMode = "host_current" | "durable_seed" | "adopt_remote";
/**
 * Controller-owned archives for replaying the exact pre-turn workspace into a
 * replacement sandbox. Paths are never sent to the provider as credentials or
 * persisted in database metadata.
 */
export interface WorkspaceDurableSeedPaths {
    workspaceArchivePath: string;
    workspaceArchiveSha256?: string;
    gitArchivePath?: string | null;
    gitArchiveSha256?: string | null;
}
/** One additional (referenced) project that failed to stage into the sandbox. */
export interface AdditionalSourceStagingFailure {
    projectId: string;
    error: string;
}
export declare function parseSandboxRemoteExecutionSpec(value: unknown): SandboxRemoteExecutionSpec | null;
export declare function buildSandboxExecutionSessionIdentity(spec: SandboxRemoteExecutionSpec | null): {
    readonly transport: "sandbox";
    readonly provider: string;
    readonly sandboxId: string;
    readonly remoteCwd: string;
};
export declare function sandboxExecutionSessionMatches(saved: unknown, current: SandboxRemoteExecutionSpec | null): boolean;
export declare function createTarballFromDirectory(input: {
    localDir: string;
    archivePath: string;
    exclude?: string[];
    followSymlinks?: boolean;
}): Promise<void>;
export declare function mirrorDirectory(sourceDir: string, targetDir: string, options?: {
    preserveAbsent?: string[];
}): Promise<void>;
export declare function mergeExcludes(...groups: Array<string[] | undefined>): string[];
export declare function prepareSandboxManagedRuntime(input: {
    spec: SandboxRemoteExecutionSpec;
    adapterKey: string;
    client: SandboxManagedRuntimeClient;
    workspaceLocalDir: string;
    workspaceRemoteDir?: string;
    syncWorkspace?: boolean;
    /** Selects authoritative host staging, exact durable-seed replay, or no-overwrite adoption. */
    workspaceInboundMode?: WorkspaceInboundMode;
    workspaceDurableSeed?: WorkspaceDurableSeedPaths;
    /** Durable snapshots supplied when reconstructing an interrupted restore. */
    workspaceBaseline?: DirectorySnapshot;
    workspaceGitSnapshot?: GitWorkspaceSnapshot | null;
    workspaceExclude?: string[];
    preserveAbsentOnRestore?: string[];
    assets?: SandboxManagedRuntimeAsset[];
    /**
     * Referenced (additional) projects to stage into the sandbox as plain,
     * read-only trees, each in its own isolated `project-<projectId>` directory.
     * Defaults to none, so a legacy/anchor-only call is behavior-identical.
     */
    additionalSources?: SandboxAdditionalSource[];
    onProgress?: RuntimeProgressSink;
    onRuntimeProgress?: RuntimeStatusSink;
    runtimeSpan?: RuntimeSpanRunner;
}): Promise<PreparedSandboxManagedRuntime>;
//# sourceMappingURL=sandbox-managed-runtime.d.ts.map