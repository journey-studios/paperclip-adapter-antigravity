export type LocalProcessSandboxAccess = "ro" | "rw";
export type LocalProcessNetworkScope = "deny" | "allowlist";
export interface LocalProcessSandboxPath {
    path: string;
    access: LocalProcessSandboxAccess;
}
export interface LocalProcessSandboxPathAlias {
    path: string;
    target: string;
}
export interface LocalProcessSandboxOptions {
    workspaceDir: string;
    filesystemScope?: "workspace" | null;
    managedPaths?: LocalProcessSandboxPath[];
    extraPaths?: LocalProcessSandboxPath[];
    pathAliases?: LocalProcessSandboxPathAlias[];
    outboundRestorePaths?: string[];
    homeDir?: string | null;
    networkScope?: LocalProcessNetworkScope | null;
    networkAllowlist?: string[];
    networkTrustedUrls?: string[];
    command?: string;
}
export interface LocalProcessSandboxSpawnTarget {
    command: string;
    args: string[];
    cwd: string;
    env?: Record<string, string | undefined>;
    cleanup?: () => Promise<void>;
}
export declare function parseLocalProcessNetworkAllowlist(value: unknown): string[];
export declare function parseLocalProcessNetworkScope(value: unknown): LocalProcessNetworkScope | null;
export declare function parseLocalProcessFilesystemScope(value: unknown): "workspace" | null;
export declare function buildLocalProcessSandboxSpawnTarget(input: {
    executable: string;
    args: string[];
    cwd: string;
    options: LocalProcessSandboxOptions;
}): Promise<LocalProcessSandboxSpawnTarget>;
export declare function parseLocalProcessSandboxExtraPaths(value: unknown): LocalProcessSandboxPath[];
//# sourceMappingURL=local-process-sandbox.d.ts.map