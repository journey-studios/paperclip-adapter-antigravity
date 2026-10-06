import type { CommandManagedRuntimeRunner } from "./command-managed-runtime.js";
import type { DirectorySnapshot } from "./workspace-restore-merge.js";
import { type RuntimeProgressSink } from "./runtime-progress.js";
export interface SshConnectionConfig {
    host: string;
    port: number;
    username: string;
    remoteWorkspacePath: string;
    privateKey: string | null;
    knownHosts: string | null;
    strictHostKeyChecking: boolean;
}
export interface SshCommandResult {
    stdout: string;
    stderr: string;
}
export interface SshRemoteExecutionSpec extends SshConnectionConfig {
    remoteCwd: string;
}
export declare function createSshCommandManagedRuntimeRunner(input: {
    spec: SshRemoteExecutionSpec;
    defaultCwd?: string | null;
    maxBufferBytes?: number | null;
}): CommandManagedRuntimeRunner;
export interface SshEnvLabSupport {
    supported: boolean;
    reason: string | null;
}
export interface SshEnvLabFixtureState {
    kind: "ssh_openbsd";
    bindHost: string;
    host: string;
    port: number;
    username: string;
    rootDir: string;
    workspaceDir: string;
    statePath: string;
    pid: number;
    createdAt: string;
    clientPrivateKeyPath: string;
    clientPublicKeyPath: string;
    hostPrivateKeyPath: string;
    hostPublicKeyPath: string;
    authorizedKeysPath: string;
    knownHostsPath: string;
    sshdConfigPath: string;
    sshdLogPath: string;
}
export declare function shellQuote(value: string): string;
export declare function parseSshRemoteExecutionSpec(value: unknown): SshRemoteExecutionSpec | null;
export declare function getSshEnvLabSupport(): Promise<SshEnvLabSupport>;
export declare function buildKnownHostsEntry(input: {
    host: string;
    port: number;
    publicKey: string;
}): string;
export declare function runSshCommand(config: SshConnectionConfig, remoteCommand: string, options?: {
    env?: Record<string, string>;
    stdin?: string;
    timeoutMs?: number;
    maxBuffer?: number;
}): Promise<SshCommandResult>;
export declare function buildSshSpawnTarget(input: {
    spec: SshRemoteExecutionSpec;
    command: string;
    args: string[];
    env: Record<string, string>;
}): Promise<{
    command: string;
    args: string[];
    cleanup: () => Promise<void>;
}>;
export declare function syncDirectoryToSsh(input: {
    spec: SshRemoteExecutionSpec;
    localDir: string;
    remoteDir: string;
    exclude?: string[];
    followSymlinks?: boolean;
    onProgress?: RuntimeProgressSink;
    progressLabel?: string;
}): Promise<void>;
export declare function syncDirectoryFromSsh(input: {
    spec: SshRemoteExecutionSpec;
    remoteDir: string;
    localDir: string;
    exclude?: string[];
    preserveLocalEntries?: string[];
    onProgress?: RuntimeProgressSink;
    progressLabel?: string;
}): Promise<void>;
export declare function prepareWorkspaceForSshExecution(input: {
    spec: SshRemoteExecutionSpec;
    localDir: string;
    remoteDir?: string;
    onProgress?: RuntimeProgressSink;
}): Promise<{
    gitBacked: boolean;
}>;
export declare function restoreWorkspaceFromSshExecution(input: {
    spec: SshRemoteExecutionSpec;
    localDir: string;
    remoteDir?: string;
    baselineSnapshot?: DirectorySnapshot;
    restoreGitHistory?: boolean;
    onProgress?: RuntimeProgressSink;
}): Promise<void>;
export declare function ensureSshWorkspaceReady(config: SshConnectionConfig): Promise<{
    remoteCwd: string;
}>;
export declare function readSshEnvLabFixtureState(statePath: string): Promise<SshEnvLabFixtureState | null>;
export declare function stopSshEnvLabFixture(stateOrPath: string | SshEnvLabFixtureState): Promise<boolean>;
export declare function startSshEnvLabFixture(input: {
    statePath: string;
    bindHost?: string;
    host?: string;
    readinessTimeoutMs?: number;
}): Promise<SshEnvLabFixtureState>;
export declare function buildSshEnvLabFixtureConfig(state: SshEnvLabFixtureState): Promise<SshConnectionConfig>;
export declare function readSshEnvLabFixtureStatus(statePath: string): Promise<{
    running: boolean;
    state: SshEnvLabFixtureState | null;
}>;
export declare function fileExists(filePath: string): Promise<boolean>;
//# sourceMappingURL=ssh.d.ts.map