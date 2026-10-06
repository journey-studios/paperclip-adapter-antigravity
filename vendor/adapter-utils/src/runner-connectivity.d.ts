import type { AdapterExecutionTarget } from "./execution-target.js";
export declare const PAPERCLIP_RUNNER_INGRESS_PORT = 43127;
export declare const PAPERCLIP_RUNNER_CONNECT_PATH_PREFIX = "/api/runner/v1/connect";
export interface SecretHeader {
    readonly name: string;
    readonly value: string;
}
export interface RunnerIngressEndpoint {
    readonly kind: "authenticated_websocket";
    readonly websocketUrl: string;
    readonly secretHeaders: readonly SecretHeader[];
    readonly generation: string;
    refresh(): Promise<RunnerIngressEndpoint>;
    close(): Promise<void>;
}
export type PaperclipRunnerTransport = {
    readonly mode: "local_loopback";
    readonly connectUrl: string;
} | {
    readonly mode: "direct_outbound";
    readonly connectUrl: string;
    readonly caBundlePath?: string;
} | {
    readonly mode: "provider_ingress";
    readonly listenAddress: "0.0.0.0";
    readonly listenPort: number;
    readonly listenPath: string;
    readonly ingress: RunnerIngressEndpoint;
};
type RunnerIngressAuthorization = {
    /** Per-run authorization resolved by the native runtime selection policy. */
    readonly runnerIngressAuthorized: boolean;
    /** @deprecated Use runnerIngressAuthorized. Retained for API compatibility. */
    readonly enableRunnerPreviewIngress?: boolean;
} | {
    readonly runnerIngressAuthorized?: never;
    /** @deprecated Use runnerIngressAuthorized. Retained for API compatibility. */
    readonly enableRunnerPreviewIngress: boolean;
};
export declare class PaperclipRunnerTransportError extends Error {
    readonly code: "runner_transport_ineligible" | "runner_direct_wss_failed" | "runner_ingress_unavailable";
    constructor(code: PaperclipRunnerTransportError["code"], message: string, options?: ErrorOptions);
}
export declare function buildDirectRunnerConnectUrl(input: {
    runnerPublicUrl: string;
    runId: string;
}): string;
export declare function resolvePaperclipRunnerTransport(input: {
    target: AdapterExecutionTarget;
    runId: string;
    localConnectUrl: string;
    runnerPublicUrl?: string | null;
    runnerCaBundlePath?: string | null;
    getRunnerIngressEndpoint?: (input: {
        leaseId: string;
        port: number;
        path: string;
    }) => Promise<RunnerIngressEndpoint>;
} & RunnerIngressAuthorization): Promise<PaperclipRunnerTransport>;
export {};
//# sourceMappingURL=runner-connectivity.d.ts.map