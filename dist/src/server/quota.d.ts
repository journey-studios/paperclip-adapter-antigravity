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
 * Parse the provider-authoritative payload returned by:
 *   agy --output-format json --print /usage
 */
export declare function parseAgyUsageQuotaOutput(stdout: string): ProviderQuotaResult | null;
/**
 * Record token consumption from an agent run into the persistent quota history file.
 */
export declare function recordAgyRunUsage(tokens: number, model?: string): Promise<void>;
/**
 * Return Antigravity subscription quota.
 *
 * Prefer the provider-authoritative /usage slash command exposed by agy.
 * The local token ledger remains only as a compatibility fallback for older
 * CLI builds or transient command failures.
 */
export declare function getQuotaWindows(): Promise<ProviderQuotaResult>;
/** Test helper. */
export declare function resetAgyQuotaCacheForTests(): void;
//# sourceMappingURL=quota.d.ts.map