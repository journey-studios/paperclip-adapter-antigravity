export interface QuotaWindow {
    label: string;
    usedPercent: number | null;
    resetsAt: string | null;
    valueLabel: string | null;
    detail?: string | null;
}
export interface ProviderQuotaResult {
    provider: string;
    source?: string | null;
    ok: boolean;
    error?: string;
    windows: QuotaWindow[];
}
/**
 * Record token consumption from an agent run into the persistent quota history file.
 */
export declare function recordAgyRunUsage(tokens: number, model?: string): Promise<void>;
/**
 * Return provider quota rate limits for Antigravity (5h and Weekly windows).
 * Evaluates the persistent sliding window ledger and returns ProviderQuotaResult.
 */
export declare function getQuotaWindows(): Promise<ProviderQuotaResult>;
//# sourceMappingURL=quota.d.ts.map