export declare const CONNECTION_INTENT_AGENT_GUIDANCE: string;
export interface ExecutionContinuationEnvelope {
    [key: string]: unknown;
}
export interface NativeFinalizationResult {
    [key: string]: unknown;
}
export interface ProviderQuotaResult {
    provider: string;
    source?: string | null;
    ok: boolean;
    error?: string;
    windows: Array<{
        label: string;
        usedPercent: number | null;
        resetsAt: string | null;
        valueLabel: string | null;
        detail?: string | null;
    }>;
}
//# sourceMappingURL=shared-shim.d.ts.map