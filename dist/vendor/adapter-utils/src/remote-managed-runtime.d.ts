import { type SshRemoteExecutionSpec } from "./ssh.js";
import { type SandboxAdditionalSource, type SandboxManagedRuntimeAssetRestoreContext } from "./sandbox-managed-runtime.js";
import type { RuntimeProgressSink } from "./runtime-progress.js";
export interface RemoteManagedRuntimeAsset {
    key: string;
    localDir: string;
    followSymlinks?: boolean;
    exclude?: string[];
    restore?: (ctx: SandboxManagedRuntimeAssetRestoreContext) => Promise<void>;
}
export interface PreparedRemoteManagedRuntime {
    spec: SshRemoteExecutionSpec;
    workspaceLocalDir: string;
    workspaceRemoteDir: string;
    runtimeRootDir: string;
    assetDirs: Record<string, string>;
    /**
     * Remote directory of each additional (referenced) project that staged
     * successfully, keyed by `projectId`. A project whose staging failed is
     * absent (per-project failure isolation).
     */
    additionalSourceDirs: Record<string, string>;
    restoreWorkspace(onProgress?: RuntimeProgressSink): Promise<void>;
}
export declare function buildRemoteExecutionSessionIdentity(spec: SshRemoteExecutionSpec | null): {
    readonly transport: "ssh";
    readonly host: string;
    readonly port: number;
    readonly username: string;
    readonly remoteCwd: string;
};
export declare function remoteExecutionSessionMatches(saved: unknown, current: SshRemoteExecutionSpec | null): boolean;
export declare function prepareRemoteManagedRuntime(input: {
    spec: SshRemoteExecutionSpec;
    runId: string;
    adapterKey: string;
    workspaceLocalDir: string;
    workspaceRemoteDir?: string;
    syncWorkspace?: boolean;
    assets?: RemoteManagedRuntimeAsset[];
    /** Referenced (additional) projects to stage as plain, read-only trees. */
    additionalSources?: SandboxAdditionalSource[];
    onProgress?: RuntimeProgressSink;
}): Promise<PreparedRemoteManagedRuntime>;
//# sourceMappingURL=remote-managed-runtime.d.ts.map