import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

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

interface QuotaUsageEntry {
  timestamp: number;
  tokens: number;
  model?: string;
}

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Default Antigravity baseline quotas (configurable via environment variables)
const DEFAULT_5H_TOKEN_LIMIT = 2_000_000;
const DEFAULT_WEEKLY_TOKEN_LIMIT = 15_000_000;

function resolveQuotaStorePath(): string {
  const custom = process.env.PAPERCLIP_AGY_QUOTA_FILE;
  if (custom) return custom;
  const home = process.env.HOME || os.homedir();
  return path.join(home, ".gemini", "antigravity-cli", "quota-history.json");
}

/**
 * Record token consumption from an agent run into the persistent quota history file.
 */
export async function recordAgyRunUsage(tokens: number, model?: string): Promise<void> {
  if (!tokens || tokens <= 0) return;
  const filePath = resolveQuotaStorePath();
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    let entries: QuotaUsageEntry[] = [];
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      entries = JSON.parse(raw);
      if (!Array.isArray(entries)) entries = [];
    } catch {
      entries = [];
    }

    const now = Date.now();
    entries.push({ timestamp: now, tokens, model });

    // Prune entries older than 7 days
    const cutoff = now - SEVEN_DAYS_MS;
    entries = entries.filter((e) => typeof e.timestamp === "number" && e.timestamp >= cutoff);

    await fs.writeFile(filePath, JSON.stringify(entries, null, 2), "utf-8");
  } catch (err) {
    console.warn("[agy_local] Failed to record quota usage:", err);
  }
}

/**
 * Return provider quota rate limits for Antigravity (5h and Weekly windows).
 * Evaluates the persistent sliding window ledger and returns ProviderQuotaResult.
 */
export async function getQuotaWindows(): Promise<ProviderQuotaResult> {
  try {
    const filePath = resolveQuotaStorePath();
    let entries: QuotaUsageEntry[] = [];
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) entries = parsed;
    } catch {
      entries = [];
    }

    const now = Date.now();
    const cutoff5h = now - FIVE_HOURS_MS;
    const cutoffWeekly = now - SEVEN_DAYS_MS;

    let tokens5h = 0;
    let oldest5hTimestamp: number | null = null;
    let tokensWeekly = 0;
    let oldestWeeklyTimestamp: number | null = null;

    for (const entry of entries) {
      if (typeof entry.timestamp !== "number" || typeof entry.tokens !== "number") continue;
      if (entry.timestamp >= cutoffWeekly) {
        tokensWeekly += entry.tokens;
        if (oldestWeeklyTimestamp === null || entry.timestamp < oldestWeeklyTimestamp) {
          oldestWeeklyTimestamp = entry.timestamp;
        }
      }
      if (entry.timestamp >= cutoff5h) {
        tokens5h += entry.tokens;
        if (oldest5hTimestamp === null || entry.timestamp < oldest5hTimestamp) {
          oldest5hTimestamp = entry.timestamp;
        }
      }
    }

    const limit5h = Number(process.env.AGY_5H_TOKEN_LIMIT) || DEFAULT_5H_TOKEN_LIMIT;
    const limitWeekly = Number(process.env.AGY_WEEKLY_TOKEN_LIMIT) || DEFAULT_WEEKLY_TOKEN_LIMIT;

    const used5hPercent = Math.min(100, Math.max(0, Math.round((tokens5h / limit5h) * 100)));
    const usedWeeklyPercent = Math.min(100, Math.max(0, Math.round((tokensWeekly / limitWeekly) * 100)));

    const resets5h = oldest5hTimestamp
      ? new Date(oldest5hTimestamp + FIVE_HOURS_MS).toISOString()
      : new Date(now + FIVE_HOURS_MS).toISOString();
    const resetsWeekly = oldestWeeklyTimestamp
      ? new Date(oldestWeeklyTimestamp + SEVEN_DAYS_MS).toISOString()
      : new Date(now + SEVEN_DAYS_MS).toISOString();

    const windows: QuotaWindow[] = [
      {
        label: "5h",
        usedPercent: used5hPercent,
        resetsAt: resets5h,
        valueLabel: `${Math.max(0, 100 - used5hPercent)}% remaining`,
        detail: `${tokens5h.toLocaleString()} / ${limit5h.toLocaleString()} tokens (5h limit)`,
      },
      {
        label: "Weekly",
        usedPercent: usedWeeklyPercent,
        resetsAt: resetsWeekly,
        valueLabel: `${Math.max(0, 100 - usedWeeklyPercent)}% remaining`,
        detail: `${tokensWeekly.toLocaleString()} / ${limitWeekly.toLocaleString()} tokens (7d limit)`,
      },
    ];

    return {
      provider: "google",
      source: "antigravity",
      ok: true,
      windows,
    };
  } catch (err) {
    return {
      provider: "google",
      source: "antigravity",
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      windows: [],
    };
  }
}
