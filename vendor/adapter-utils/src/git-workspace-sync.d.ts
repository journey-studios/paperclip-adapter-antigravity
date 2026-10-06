export interface GitCommandResult {
    stdout: string;
    stderr: string;
}
export interface GitWorkspaceSnapshot {
    headCommit: string;
    branchName: string | null;
    overlayPaths: string[];
    deletedPaths: string[];
    ignoredPaths: string[];
    /** Managed, editable repositories inside the task workspace. */
    repositories?: Array<{
        path: string;
        snapshot: GitWorkspaceSnapshot;
    }>;
}
export declare const PROJECT_REPOSITORIES_DIR = ".paperclip-repositories";
export interface ExpensiveWorkspaceGitInput {
    localDir: string;
    args: readonly string[];
    operation: string;
    timeout: number;
    maxBuffer: number;
    /**
     * Optional environment override for the invocation. Absent for the anchor
     * workspace's own full-tree walks (they inherit the process environment, a
     * directory this process already controls). A referenced-project scan sets
     * this to its hardened environment (see {@link buildHardenedGitEnv}), so a
     * host executor that honors it still runs the read hardened even though it
     * dispatches through the same seam as the anchor's reads.
     */
    env?: NodeJS.ProcessEnv;
}
export type ExpensiveWorkspaceGitExecutor = (input: ExpensiveWorkspaceGitInput) => Promise<GitCommandResult>;
/**
 * The workspace Git scan scheduler's typed code for a saturated queue
 * (`server/src/services/workspace-git-operation-scheduler.ts`,
 * `WORKSPACE_GIT_SCAN_ERROR_CODES.saturated`). Declared again here because
 * `adapter-utils` cannot import from `server` (the reverse direction is
 * allowed, not this one); `server` carries a test that asserts the two
 * literals stay equal. `resolveReferencedSourceIgnore` in
 * `sandbox-managed-runtime.ts` reads this code off a caught error's `code`
 * property, never off its message text, to retry only a saturated queue and
 * fail closed on every other Git scan error.
 */
export declare const WORKSPACE_GIT_SCAN_SATURATED_CODE = "workspace_git_scan_saturated";
/**
 * Lets a host process apply its process-wide admission policy to the adapter
 * package's full-tree Git walks. Standalone adapter-utils consumers retain the
 * existing timeout/buffer-bounded fallback.
 */
export declare function setExpensiveWorkspaceGitExecutor(executor: ExpensiveWorkspaceGitExecutor | null): void;
export declare const GIT_ARCHIVE_EXCLUDES: readonly [".git", ".git/*"];
/**
 * Identity flags for commits the sync machinery itself creates (the merge
 * commits that reconcile concurrent histories). Execution hosts are often
 * containers with no git config and no resolvable hostname, so git cannot
 * auto-detect an identity there and `commit-tree` hard-fails with "Author
 * identity unknown" — which fails the whole run at finalize. Passing the
 * identity per invocation keeps every deployment working without host
 * configuration; `GIT_AUTHOR_*` / `GIT_COMMITTER_*` environment variables
 * still take precedence over `-c` when an operator sets them.
 */
export declare const GIT_SYNC_COMMIT_IDENTITY_ARGS: readonly ["-c", "user.name=Paperclip", "-c", "user.email=noreply@paperclip.ing"];
export declare function runLocalGit(localDir: string, args: string[], options?: {
    timeout?: number;
    maxBuffer?: number;
    env?: NodeJS.ProcessEnv;
}): Promise<GitCommandResult>;
export declare function readGitWorkspaceSnapshot(localDir: string, includeRepositories?: boolean): Promise<GitWorkspaceSnapshot | null>;
/** The `git ls-files --others --ignored` output for one directory, read by {@link readReferencedSourceGitIgnoredPaths}. */
export interface ReferencedSourceGitIgnoreScan {
    /** The absolute repository top level `git rev-parse --show-toplevel` reports. */
    toplevel: string;
    /** Ignored paths, relative to `toplevel`, trailing slashes stripped, sorted. */
    ignoredPaths: string[];
}
/** Bound on the number of parsed ignored entries `readReferencedSourceGitIgnoredPaths` accepts before it fails closed. */
export declare const REFERENCED_SOURCE_IGNORE_MAX_ENTRY_COUNT = 10000;
/** Bound on the summed UTF-8 byte length of the resolved ignored-path strings `readReferencedSourceGitIgnoredPaths` accepts before it fails closed. */
export declare const REFERENCED_SOURCE_IGNORE_MAX_TOTAL_BYTES: number;
/**
 * Thrown by {@link readReferencedSourceGitIgnoredPaths} when the parsed
 * ignored-path list breaches {@link REFERENCED_SOURCE_IGNORE_MAX_ENTRY_COUNT}
 * or {@link REFERENCED_SOURCE_IGNORE_MAX_TOTAL_BYTES}, so the caller can
 * classify the failure as a bound breach instead of a plain Git read error.
 * The message never leaves this package: `resolveReferencedSourceIgnore`
 * replaces it with a fixed category before the failure reaches any consumer.
 */
export declare class ReferencedSourceIgnoreScanLimitExceededError extends Error {
    constructor(message: string);
}
/**
 * Read the Git-ignored paths of a referenced-project host directory, for the
 * staging path to exclude them (see `resolveReferencedSourceIgnore` in
 * `sandbox-managed-runtime.ts`). Every command runs through
 * {@link runHardenedReadOnlyGit}, because the directory is a host checkout the
 * staging code does not control, unlike the anchor workspace.
 *
 * Returns `null` when `localDir` is not a Git work tree — the caller keeps
 * today's fixed excludes for that case. Throws on any other Git error, a
 * timeout, malformed output, or a bound breach (see
 * {@link ReferencedSourceIgnoreScanLimitExceededError}), so the caller can
 * fail closed and skip staging that one project instead of shipping it
 * unfiltered.
 */
export declare function readReferencedSourceGitIgnoredPaths(localDir: string): Promise<ReferencedSourceGitIgnoreScan | null>;
/**
 * Reduce a git remote URL to a credential-free form before it is copied into a
 * transported workspace, or null when the URL must not be carried at all.
 * Allowlist, fail closed: only shapes whose credential surface is fully known
 * are kept — http(s) with userinfo/query/fragment stripped (tokens ride in any
 * of those), ssh/git schemes with password/query/fragment stripped, and
 * scp-like `user@host:path` (no password slot exists in that syntax). Every
 * other form — filesystem paths, unknown schemes, unparseable strings — is
 * dropped rather than risk persisting an embedded secret in the execution
 * host's git config.
 */
export declare function sanitizeGitRemoteUrl(url: string): string | null;
/**
 * The workspace's `origin` remote URL with credentials scrubbed, or null when
 * the workspace has no `origin` remote (or is not a git repository).
 */
export declare function readSanitizedOriginRemoteUrl(localDir: string): Promise<string | null>;
export declare function withShallowGitWorkspaceClone<T>(input: {
    localDir: string;
    snapshot: GitWorkspaceSnapshot;
}, fn: (cloneDir: string) => Promise<T>): Promise<T>;
export declare function createImportedGitRef(scope?: string): string;
export declare function createRemoteGitExportRef(scope?: string): string;
export declare function deleteLocalGitRef(input: {
    localDir: string;
    ref: string;
}): Promise<void>;
export declare function fetchGitBundleIntoLocalRef(input: {
    localDir: string;
    bundlePath: string;
    exportRef: string;
    importedRef: string;
    baseSha: string;
}): Promise<string>;
/**
 * True when a bundle import failed because the host repository does not hold a
 * commit the (delta) bundle assumes as a prerequisite. Such a failure is
 * recoverable by re-exporting a full, self-contained bundle from the still-live
 * sandbox rather than discarding the run.
 */
export declare function isMissingGitPrerequisiteError(error: unknown): boolean;
export declare function buildRemoteGitDeltaBundleScript(input: {
    remoteDir: string;
    baseSha: string;
    exportRef: string;
    bundlePath: string;
    statusPath?: string;
    catBundle?: boolean;
    cleanupBundle?: boolean;
    /**
     * Skip the delta boundary entirely and always emit a full, self-contained
     * bundle (no prerequisites). Used as the recovery path when a delta import
     * failed because the host lacked the bundle's prerequisite.
     */
    forceFullBundle?: boolean;
}): string;
/**
 * Preserve imported work whose history does not connect to the local one.
 *
 * The dominant real-world cause is a history rewrite inside a transported
 * workspace: transported clones are depth-1 shallow, so the boundary commit
 * reads as parentless there and `git commit --amend` rewrites it into a root
 * commit that shares no ancestor with the host history. A tree merge is
 * impossible without a common ancestor, and failing the integration would
 * discard the run's work. Instead, squash-graft the imported tree onto the
 * current head as a single commit that reuses the imported head's message,
 * with a trailer recording the graft. Concurrent local-only commits keep
 * their place in history as the graft's ancestry; the imported tree is taken
 * wholesale because no base exists to merge against. The caller advances the
 * branch ref to the returned commit.
 */
export declare function createUnrelatedHistoryGraftCommit(input: {
    localDir: string;
    currentHead: string;
    importedHead: string;
    syncLabel: string;
}): Promise<string>;
export declare function integrateImportedGitHead(input: {
    localDir: string;
    importedHead: string;
}): Promise<void>;
export declare function resetLocalGitIndexToHead(input: {
    localDir: string;
    checkWorkingTreeClean?: boolean;
}): Promise<void>;
//# sourceMappingURL=git-workspace-sync.d.ts.map