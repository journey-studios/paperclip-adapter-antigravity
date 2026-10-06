export type SnapshotEntry = {
    kind: "dir";
} | {
    kind: "file";
    mode: number;
    hash: string;
} | {
    kind: "symlink";
    target: string;
};
export interface DirectorySnapshot {
    exclude: string[];
    entries: Map<string, SnapshotEntry>;
}
export interface SerializedDirectorySnapshot {
    version: 1;
    exclude: string[];
    entries: Array<[string, SnapshotEntry]>;
}
export declare function serializeDirectorySnapshot(snapshot: DirectorySnapshot): SerializedDirectorySnapshot;
export declare function parseDirectorySnapshot(value: unknown): DirectorySnapshot | null;
export declare function directorySnapshotSha256(snapshot: DirectorySnapshot): string;
/**
 * The stable `code` a lock-timeout error carries, so a caller can identify it
 * without matching on the error message text (the message embeds the lock
 * directory path).
 */
export declare const WORKSPACE_RESTORE_LOCK_TIMEOUT_CODE = "ERR_WORKSPACE_RESTORE_LOCK_TIMEOUT";
/**
 * The closed set of codes a failed workspace restore can carry off the
 * sandbox. Every code is safe to store on a run record readable by any
 * same-company actor: none embeds a filesystem path, a raw error message, or
 * a process id.
 */
export type WorkspaceRestoreFailureCode = "restore_permission_denied" | "restore_lock_timeout" | "restore_failed";
/**
 * The outcome of one workspace restore. `ok: true` on a clean restore. `ok:
 * false` carries one allowlisted {@link WorkspaceRestoreFailureCode} — never a
 * raw error, a path, or a process id.
 */
export type WorkspaceRestoreOutcome = {
    readonly ok: true;
} | {
    readonly ok: false;
    readonly code: WorkspaceRestoreFailureCode;
};
/**
 * Classifies a caught workspace-restore error into one allowlisted code. Maps
 * `EACCES` and `EPERM` to a permission failure, the merge-lock timeout
 * (matched by {@link WORKSPACE_RESTORE_LOCK_TIMEOUT_CODE}, never by the error
 * message text) to a lock-timeout failure, and every other error to a generic
 * failure. Never reads or returns `Error.message`, a filesystem path, or a
 * process id.
 */
export declare function classifyWorkspaceRestoreFailure(error: unknown): WorkspaceRestoreFailureCode;
/**
 * The fixed, allowlisted line an ACP adapter writes to the run log when a
 * workspace restore fails. Every call site must pass this to `onLog` instead
 * of the caught error's own message: the caught error can carry a host
 * filesystem path or the lock owner's process id, and the run log is
 * readable by any same-company actor. Never add the code's raw
 * `Error.message` to this text.
 */
export declare function describeWorkspaceRestoreFailure(code: WorkspaceRestoreFailureCode): string;
export declare function withDirectoryMergeLock<T>(targetDir: string, fn: (canonicalTargetDir: string) => Promise<T>, env?: NodeJS.ProcessEnv): Promise<T>;
export declare function captureDirectorySnapshot(rootDir: string, options?: {
    exclude?: string[];
}): Promise<DirectorySnapshot>;
export declare function mergeDirectoryWithBaseline(input: {
    baseline: DirectorySnapshot;
    sourceDir: string;
    targetDir: string;
    beforeApply?: () => Promise<void>;
    afterApply?: () => Promise<void>;
}): Promise<void>;
export declare function directoryEntryMatchesBaseline(rootDir: string, relative: string, baselineEntry: SnapshotEntry): Promise<boolean>;
//# sourceMappingURL=workspace-restore-merge.d.ts.map