import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

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

const DEFAULT_QUOTA_CACHE_MS = 60_000;
const execFileAsync = promisify(execFile);

let cachedProviderQuota:
  | {
      at: number;
      result: ProviderQuotaResult;
    }
  | null = null;

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function quotaWindowLabel(window: string, name: string): string {
  if (window.toLowerCase() === "5h" || /five\s*hour/i.test(name)) return "5h";
  if (window.toLowerCase() === "weekly" || /weekly/i.test(name)) return "Weekly";
  return name || window || "Quota";
}

/**
 * Parse the provider-authoritative payload returned by:
 *   agy --output-format json --print /usage
 */
export function parseAgyUsageQuotaOutput(stdout: string): ProviderQuotaResult | null {
  let payload: unknown;
  try {
    payload = JSON.parse(stdout);
  } catch {
    return null;
  }

  const root = asRecord(payload);
  const command = asRecord(root.command);
  if (asString(command.name) !== "usage") return null;

  const data = asRecord(command.data);
  const groups = Array.isArray(data.groups) ? data.groups : [];
  const windows: QuotaWindow[] = [];

  for (const rawGroup of groups) {
    const group = asRecord(rawGroup);
    const groupName = asString(group.name).trim() || "Antigravity";
    const groupDescription = asString(group.description).trim();
    const buckets = Array.isArray(group.buckets) ? group.buckets : [];

    for (const rawBucket of buckets) {
      const bucket = asRecord(rawBucket);
      const remainingFraction = asFiniteNumber(bucket.remaining_fraction);
      if (remainingFraction === null) continue;

      const boundedRemaining = Math.min(1, Math.max(0, remainingFraction));
      const remainingPercent = Math.round(boundedRemaining * 100);
      const bucketName = asString(bucket.name).trim();
      const window = quotaWindowLabel(asString(bucket.window), bucketName);
      const bucketDescription = asString(bucket.description).trim();

      windows.push({
        label: groupName + " · " + window,
        usedPercent: 100 - remainingPercent,
        resetsAt: asString(bucket.reset_time).trim() || null,
        valueLabel: String(remainingPercent) + "% remaining",
        detail: bucketDescription || groupDescription || null,
      });
    }
  }

  if (windows.length === 0) return null;

  windows.sort((a, b) => {
    const aGroup = a.label.split(" · ")[0] ?? "";
    const bGroup = b.label.split(" · ")[0] ?? "";
    if (aGroup !== bGroup) return aGroup.localeCompare(bGroup);
    if (a.label.endsWith("· 5h")) return -1;
    if (b.label.endsWith("· 5h")) return 1;
    return a.label.localeCompare(b.label);
  });

  return {
    provider: "google",
    source: "antigravity:/usage",
    ok: true,
    windows,
  };
}

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
 * Return a local rolling-usage estimate for Antigravity (5h and Weekly windows).
 * Used only when the provider-authoritative /usage command is unavailable.
 */
async function getLocalQuotaEstimate(): Promise<ProviderQuotaResult> {
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
    let tokensWeekly = 0;

    for (const entry of entries) {
      if (typeof entry.timestamp !== "number" || typeof entry.tokens !== "number") continue;
      if (entry.timestamp >= cutoffWeekly) {
        tokensWeekly += entry.tokens;
      }
      if (entry.timestamp >= cutoff5h) {
        tokens5h += entry.tokens;
      }
    }

    const limit5h = Number(process.env.AGY_5H_TOKEN_LIMIT) || DEFAULT_5H_TOKEN_LIMIT;
    const limitWeekly = Number(process.env.AGY_WEEKLY_TOKEN_LIMIT) || DEFAULT_WEEKLY_TOKEN_LIMIT;

    const used5hPercent = Math.min(100, Math.max(0, Math.round((tokens5h / limit5h) * 100)));
    const usedWeeklyPercent = Math.min(100, Math.max(0, Math.round((tokensWeekly / limitWeekly) * 100)));


    const windows: QuotaWindow[] = [
      {
        label: "5h",
        usedPercent: used5hPercent,
        resetsAt: null,
        valueLabel: `${Math.max(0, 100 - used5hPercent)}% remaining (local estimate)`,
        detail: `${tokens5h.toLocaleString()} / ${limit5h.toLocaleString()} locally observed tokens in 5h; provider quota may differ`,
      },
      {
        label: "Weekly",
        usedPercent: usedWeeklyPercent,
        resetsAt: null,
        valueLabel: `${Math.max(0, 100 - usedWeeklyPercent)}% remaining (local estimate)`,
        detail: `${tokensWeekly.toLocaleString()} / ${limitWeekly.toLocaleString()} locally observed tokens in 7d; provider quota may differ`,
      },
    ];

    return {
      provider: "google",
      source: "antigravity-local-estimate",
      ok: true,
      windows,
    };
  } catch (err) {
    return {
      provider: "google",
      source: "antigravity-local-estimate",
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      windows: [],
    };
  }
}


/**
 * Return Antigravity subscription quota.
 *
 * Prefer the provider-authoritative /usage slash command exposed by agy.
 * The local token ledger remains only as a compatibility fallback for older
 * CLI builds or transient command failures.
 */
export async function getQuotaWindows(): Promise<ProviderQuotaResult> {
  const now = Date.now();
  const configuredCacheMs = Number(process.env.PAPERCLIP_AGY_QUOTA_CACHE_MS);
  const cacheMs =
    Number.isFinite(configuredCacheMs) && configuredCacheMs >= 0
      ? configuredCacheMs
      : DEFAULT_QUOTA_CACHE_MS;

  if (cachedProviderQuota && now - cachedProviderQuota.at < cacheMs) {
    return cachedProviderQuota.result;
  }

  const command = process.env.PAPERCLIP_AGY_COMMAND || "agy";
  const configuredTimeoutMs = Number(process.env.PAPERCLIP_AGY_QUOTA_TIMEOUT_MS);
  const timeoutMs =
    Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0
      ? configuredTimeoutMs
      : 10_000;

  try {
    const { stdout } = await execFileAsync(
      command,
      ["--output-format", "json", "--print", "/usage"],
      {
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024,
        env: process.env,
      },
    );
    const parsed = parseAgyUsageQuotaOutput(String(stdout));
    if (!parsed) throw new Error("agy /usage returned an unrecognized payload");
    cachedProviderQuota = { at: now, result: parsed };
    return parsed;
  } catch {
    return getLocalQuotaEstimate();
  }
}

/** Test helper. */
export function resetAgyQuotaCacheForTests(): void {
  cachedProviderQuota = null;
}
