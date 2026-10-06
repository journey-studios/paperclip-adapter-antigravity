import type { Duplex } from "node:stream";
import { type SandboxCallbackBridgeBody } from "./sandbox-callback-bridge-body.js";
import type { BridgeBodyReservation } from "./http2-bridge-server.js";
import { type RuntimeSpanRunner, type StartupSpanContext } from "./acpx-engine/startup-timing.js";
import type { CommandManagedRuntimeRunner } from "./command-managed-runtime.js";
export declare const SANDBOX_CALLBACK_BRIDGE_ENTRYPOINT = "paperclip-bridge-server.mjs";
/** The active non-file transport mode. */
export declare const SANDBOX_CALLBACK_BRIDGE_HTTP2_MODE = "http2_v1";
export declare const DEFAULT_SANDBOX_CALLBACK_BRIDGE_MAX_BODY_BYTES: number;
export interface SandboxCallbackBridgeRouteRule {
    method: string;
    path: RegExp;
}
export declare const DEFAULT_SANDBOX_CALLBACK_BRIDGE_ROUTE_ALLOWLIST: readonly SandboxCallbackBridgeRouteRule[];
export declare const HTTP2_SANDBOX_CALLBACK_BRIDGE_ROUTE_ALLOWLIST: readonly SandboxCallbackBridgeRouteRule[];
export declare const DEFAULT_SANDBOX_CALLBACK_BRIDGE_HEADER_ALLOWLIST: readonly ["accept", "content-type", "if-match", "if-none-match", "x-paperclip-github-capability"];
export interface SandboxCallbackBridgeRequest extends SandboxCallbackBridgeBody {
    id: string;
    method: string;
    path: string;
    query: string;
    headers: Record<string, string>;
    createdAt: string;
}
export interface SandboxCallbackBridgeResponse extends SandboxCallbackBridgeBody {
    id: string;
    status: number;
    headers: Record<string, string>;
    body: string;
    completedAt: string;
}
export interface SandboxCallbackBridgeAsset {
    localDir: string;
    entrypoint: string;
    cleanup(): Promise<void>;
}
export interface SandboxCallbackBridgeDirectories {
    rootDir: string;
    requestsDir: string;
    responsesDir: string;
    logsDir: string;
    readyFile: string;
    pidFile: string;
    logFile: string;
}
export interface SandboxCallbackBridgeQueueClient {
    makeDir(remotePath: string): Promise<void>;
    makeDirs?(remotePaths: string[]): Promise<void>;
    listJsonFiles(remotePath: string): Promise<string[]>;
    fileSize?(remotePath: string): Promise<number>;
    readTextFile(remotePath: string, maxBytes?: number): Promise<string>;
    writeTextFile(remotePath: string, body: string): Promise<void>;
    writeResponseFile?(responsePath: string, body: string, options?: {
        requestPath?: string | null;
    }): Promise<{
        wrote: boolean;
    }>;
    rename(fromPath: string, toPath: string): Promise<void>;
    remove(remotePath: string): Promise<void>;
}
export interface SandboxCallbackBridgeWorkerHandle {
    stop(options?: {
        drainTimeoutMs?: number;
    }): Promise<void>;
}
export interface StartedSandboxCallbackBridgeServer {
    baseUrl: string;
    host: string;
    port: number;
    pid: number;
    directories: SandboxCallbackBridgeDirectories;
    stop(): Promise<void>;
}
export declare function createSandboxCallbackBridgeToken(bytes?: number): string;
export declare function authorizeSandboxCallbackBridgeRequestWithRoutes(request: Pick<SandboxCallbackBridgeRequest, "method" | "path">, routes?: readonly SandboxCallbackBridgeRouteRule[]): string | null;
export declare function sanitizeSandboxCallbackBridgeHeaders(headers: Record<string, string>, allowlist?: readonly string[]): Record<string, string>;
export declare function sandboxCallbackBridgeDirectories(rootDir: string): SandboxCallbackBridgeDirectories;
export declare function buildSandboxCallbackBridgeEnv(input: {
    queueDir: string;
    bridgeToken: string;
    host?: string;
    port?: number | null;
    pollIntervalMs?: number | null;
    responseTimeoutMs?: number | null;
    maxQueueDepth?: number | null;
    maxBodyBytes?: number | null;
}): Record<string, string>;
export declare function createSandboxCallbackBridgeAsset(): Promise<SandboxCallbackBridgeAsset>;
export declare function createFileSystemSandboxCallbackBridgeQueueClient(): SandboxCallbackBridgeQueueClient;
export declare function createCommandManagedSandboxCallbackBridgeQueueClient(input: {
    runner: CommandManagedRuntimeRunner;
    remoteCwd: string;
    timeoutMs?: number | null;
    shellCommand?: "bash" | "sh" | null;
}): SandboxCallbackBridgeQueueClient;
export declare function startSandboxCallbackBridgeWorker(input: {
    client: SandboxCallbackBridgeQueueClient;
    queueDir: string;
    pollIntervalMs?: number | null;
    iterationTimeoutMs?: number | null;
    watchdogTimeoutMs?: number | null;
    abortedHandlerGraceMs?: number | null;
    authorizeRequest?: (request: SandboxCallbackBridgeRequest) => string | null | Promise<string | null>;
    handleRequest: (request: Omit<SandboxCallbackBridgeRequest, "body" | "bodyEncoding"> & {
        body: string | Buffer;
    }, options?: {
        signal: AbortSignal;
        reservation: BridgeBodyReservation;
    }) => Promise<{
        status: number;
        headers?: Record<string, string>;
        body?: string | Buffer;
    }>;
    maxBodyBytes?: number | null;
    getRuntimeParentContext?: () => StartupSpanContext | undefined;
    runtimeSpan?: RuntimeSpanRunner;
}): Promise<SandboxCallbackBridgeWorkerHandle>;
/**
 * Content-hash-skip write of a Paperclip-authored text file into the sandbox, in
 * a SINGLE remote exec. The body's sha256 is computed on the host; the one shell
 * round-trip skips the write entirely when the remote file already hashes to the
 * same value (warm start — 0 write execs), otherwise it uploads (base64 over
 * stdin), verifies the decoded bytes, and atomically renames into place. A
 * PID-liveness lock serializes concurrent writers to the same path and the
 * verify step guards against a torn upload.
 *
 * Fail loudly: a non-zero remote exit (surfaced by `requireSuccessfulResult`) or
 * malformed result JSON throws rather than silently re-uploading and masking a
 * failed check. The only intentional degradation is when the remote has neither
 * `sha256sum` nor `shasum` — then the skip cannot be proven and we conservatively
 * re-upload (and the post-upload verify is best-effort, as noted inline).
 */
export declare function syncRemoteTextFileWithHashSkip(input: {
    runner: CommandManagedRuntimeRunner;
    remoteCwd: string;
    remoteDir: string;
    remotePath: string;
    body: string;
    label: string;
    action: string;
    lockDir: string;
    timeoutMs?: number | null;
    shellCommand?: "bash" | "sh" | null;
}): Promise<{
    uploaded: boolean;
    sha256: string;
}>;
export declare function syncSandboxCallbackBridgeEntrypoint(input: {
    runner: CommandManagedRuntimeRunner;
    remoteCwd: string;
    assetRemoteDir: string;
    bridgeAsset: SandboxCallbackBridgeAsset;
    timeoutMs?: number | null;
    shellCommand?: "bash" | "sh" | null;
}): Promise<{
    remoteEntrypoint: string;
    sha256: string;
    uploaded: boolean;
}>;
export declare function startSandboxCallbackBridgeServer(input: {
    runner: CommandManagedRuntimeRunner;
    remoteCwd: string;
    assetRemoteDir: string;
    queueDir: string;
    bridgeToken: string;
    bridgeAsset?: SandboxCallbackBridgeAsset | null;
    host?: string;
    port?: number | null;
    pollIntervalMs?: number | null;
    responseTimeoutMs?: number | null;
    timeoutMs?: number | null;
    nodeCommand?: string;
    shellCommand?: "bash" | "sh" | null;
    maxQueueDepth?: number | null;
    maxBodyBytes?: number | null;
}): Promise<StartedSandboxCallbackBridgeServer>;
/**
 * Constant-time bridge-token compare. Both this sandbox gateway and the host
 * server in `http2-bridge-server.ts` import this one helper, so the gateway
 * check and the independent host check (accepted security fix 4) apply the
 * exact same comparison rule. A length mismatch returns `false` without a
 * `timingSafeEqual` call, because `timingSafeEqual` throws on unequal buffer
 * lengths; both operands are bridge tokens of near-fixed length, so this one
 * length branch leaks no useful timing signal.
 */
export declare function compareBridgeTokensConstantTime(expected: string, received: string | null | undefined): boolean;
/** One local request the gateway forwards as one HTTP/2 stream. */
export interface SandboxHttp2BridgeGatewayRequest {
    method: string;
    path: string;
    query: string;
    headers: Record<string, string>;
    body: Buffer;
    /**
     * The token the local caller presented. The gateway check (accepted
     * security fix 4 keeps this alongside the independent host check) compares
     * it against the per-run bridge token before it opens a stream.
     */
    receivedToken: string | null | undefined;
}
/** The response one forwarded HTTP/2 stream carried back. */
export interface SandboxHttp2BridgeGatewayResponse {
    status: number;
    headers: Record<string, string>;
    body: Buffer;
}
export interface SandboxHttp2BridgeGateway {
    /** Forward one local request as one HTTP/2 stream over the client session. */
    forwardRequest(request: SandboxHttp2BridgeGatewayRequest): Promise<SandboxHttp2BridgeGatewayResponse>;
    /** Close the HTTP/2 client session. Safe to call more than one time. */
    close(): Promise<void>;
}
export interface CreateSandboxHttp2BridgeGatewayOptions {
    /**
     * The per-run bridge token. The gateway checks every request against it,
     * then attaches it to the outbound HTTP/2 stream as the `authorization`
     * header, so the host can run its own independent check.
     */
    bridgeToken: string;
    /**
     * Open the transport the HTTP/2 client session runs on. Returns a `Duplex`
     * already connected to the host — the sandbox process's own channel in
     * production, or one side of a paired in-memory `Duplex` in a test.
     */
    createConnection: () => Duplex;
    /** The `:authority` pseudo-header value. The channel carries no real network
     * address, so this is a fixed label. The default is `bridge.internal`. */
    authority?: string;
    /** The header allowlist applied to every outbound request. The default is
     * {@link DEFAULT_SANDBOX_CALLBACK_BRIDGE_HEADER_ALLOWLIST}. */
    headerAllowlist?: readonly string[];
    /**
     * The sink for a GOAWAY the host sends. The host names the last client
     * stream ID it processed; a caller classifies each of its own dispatched
     * stream IDs against it with `classifyStreamAgainstGoaway` in
     * `http2-bridge-server.ts` to know which requests need a retry elsewhere.
     */
    onGoaway?: (record: {
        lastStreamId: number;
        errorCode: number;
    }) => void;
}
/**
 * Create the sandbox HTTP/2 client gateway. It opens one HTTP/2 client
 * session on the transport `createConnection` returns, and forwards each
 * local request the caller hands it (already checked against the bridge
 * token — see {@link SandboxHttp2BridgeGatewayRequest.receivedToken}) as one
 * HTTP/2 stream. It keeps the header allowlist on the sandbox side, exactly
 * as the file-mode gateway does.
 */
export declare function createSandboxHttp2BridgeGateway(options: CreateSandboxHttp2BridgeGatewayOptions): SandboxHttp2BridgeGateway;
/**
 * Return the exact zero-dependency codec source the generated duplex gateway
 * embeds. A test wraps this source and calls `encodeDuplexFrame` to prove the
 * embedded copy encodes the READY frame the same way the host encode side does.
 * The source declares `encodeDuplexFrame` and `DUPLEX_FRAME_VERSION`, but exports
 * neither; a caller wraps it to read those names.
 */
export declare function getSandboxDuplexGatewayCodecSource(): string;
/**
 * Return the exact zero-dependency ledger source the generated gateway
 * embeds. A test wraps this source and calls `createBridgeProcessBodyLedger`
 * to prove the embedded copy reserves and releases bytes correctly, with no
 * spawned process involved.
 */
export declare function getSandboxBridgeProcessBodyLedgerSource(): string;
export declare function getSandboxCallbackBridgeServerSource(): string;
//# sourceMappingURL=sandbox-callback-bridge.d.ts.map