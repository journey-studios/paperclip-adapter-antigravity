/**
 * Skill delivery for Antigravity (agy).
 *
 * agy has a first-class skill loader with the same on-disk shape as Claude Code
 * (`<name>/SKILL.md` with `name` / `description` frontmatter), so Paperclip
 * skills need no transformation — only to land in a directory agy actually
 * scans. Probing agy confirms:
 *
 *   scanned      ~/.gemini/config/skills/<name>/SKILL.md
 *   scanned      <any --add-dir root>/.agents/skills/<name>/SKILL.md
 *   NOT scanned  ~/.gemini/skills/<name>/SKILL.md
 *   NOT scanned  <workspace>/.claude/skills, <workspace>/.gemini/skills
 *
 * `~/.gemini/skills` was where the legacy `gemini_local` lane linked skills,
 * but agy ignores it entirely. This module ensures skills are never targeted there.
 *
 * That `--add-dir` roots each contribute their own `.agents/skills` enables
 * per-agent isolation: the adapter passes `--add-dir <cwd>` to bind the workspace,
 * and an extra `--add-dir` pointing to a Paperclip-managed directory delivers
 * skills without writing into the user's workspace repo.
 */
import type { AdapterExecutionContext, AdapterSkillContext, AdapterSkillSnapshot } from "@paperclipai/adapter-utils";
import { type PaperclipSkillEntry } from "@paperclipai/adapter-utils/server-utils";
export declare function linkSkillDirectory(source: string, target: string): Promise<void>;
export declare function unlinkSkillDirectory(target: string): Promise<void>;
export declare const ADAPTER_TYPE = "agy_local";
/** Path segment agy scans for skills beneath every `--add-dir` root. */
export declare const AGY_WORKSPACE_SKILL_SUBPATH: string;
/** agy's global customization root. Always scanned, shared by every agy run on the host. */
export declare const AGY_GLOBAL_SKILLS_HOME_SEGMENTS: readonly [".gemini", "config", "skills"];
/** Root for the per-agent skill trees this adapter owns. */
export declare const AGY_AGENT_SKILL_ROOT_SEGMENTS: readonly [".agy-paperclip", "agents"];
export type AgySkillScope = "agent";
export interface AgySkillRoot {
    scope: AgySkillScope;
    /**
     * Directory to pass to agy as an extra `--add-dir`. Always non-null to guarantee
     * agent and company isolation.
     */
    addDir: string;
    /** Directory holding `<runtimeName>/SKILL.md`. */
    skillsHome: string;
    /** Legacy directory holding `<runtimeName>/SKILL.md` before agent-scoping was applied. */
    legacySkillsHome?: string;
    /** Company ID this agent belongs to. */
    companyId?: string | null;
    /** Human-readable location for the Paperclip skills UI. */
    locationLabel: string;
    warnings?: string[];
}
export interface ResolveAgySkillRootInput {
    config: Record<string, unknown>;
    agentId?: string | null;
    companyId?: string | null;
    /** Overridable for tests; defaults to the process user's home directory. */
    homeDir?: string;
}
/**
 * Sanitize an agent id into a single path segment.
 */
export declare function sanitizeAgentIdSegment(agentId: string): string;
/**
 * Decide where this agent's skills live based on configuration and scope.
 * Always resolves to an isolated per-agent directory to guarantee company boundaries.
 */
export declare function resolveAgySkillRoot(input: ResolveAgySkillRootInput): AgySkillRoot;
export declare function resolveAgySkillsHome(config: Record<string, unknown>, agentId?: string | null): string;
export interface MigrateLegacySkillsOptions {
    companyId?: string | null;
    availableEntries?: PaperclipSkillEntry[];
}
export declare function extractCompanyIdFromSkillMarkdown(content: string): string | null;
export declare function readSkillDirectoryCompanyId(dirPath: string): Promise<string | null>;
export declare function extractCompanyIdFromPath(filePath: string): string | null;
export declare function isEntryOwnedByOtherCompany(legacySkillsHome: string, entry: import("node:fs").Dirent, options: MigrateLegacySkillsOptions): Promise<boolean>;
/**
 * Migrates existing custom skills from the un-scoped legacy directory
 * (e.g. `<configuredRoot>/.agents/skills`) into the agent-scoped directory
 * (`<configuredRoot>/<agentId>/.agents/skills`), while preserving any skills
 * owned by other companies on a shared host.
 */
export declare function migrateLegacySkills(root: AgySkillRoot, options?: MigrateLegacySkillsOptions): Promise<string[]>;
export declare function listAgySkills(ctx: AdapterSkillContext): Promise<AdapterSkillSnapshot>;
export declare const listSkills: typeof listAgySkills;
export declare function syncAgySkills(ctx: AdapterSkillContext, desiredSkills: string[]): Promise<AdapterSkillSnapshot>;
export declare const syncSkills: typeof syncAgySkills;
export interface RunSkillSync {
    root: AgySkillRoot;
    /** Null when the run performed no sync (global scope, or nothing to deliver). */
    snapshot: AdapterSkillSnapshot | null;
    /** Skill keys this run expected to be present. */
    desiredSkills: string[];
    warnings: string[];
}
/**
 * Reconcile this agent's skill root before a heartbeat run begins.
 */
export declare function syncSkillsForRun(input: {
    config: Record<string, unknown>;
    agentId: string;
    companyId: string;
}): Promise<RunSkillSync>;
/** Prefix every skill-sync receipt line carries, so a run log can be grepped for it. */
export declare const SKILL_SYNC_LOG_PREFIX = "[paperclip] skill sync:";
/**
 * Render a per-run receipt for what skill sync actually did.
 */
export declare function describeRunSkillSync(sync: RunSkillSync): string[];
/** Legacy helper for backward compatibility */
export declare function ensureAgySkillsInjected(onLog: AdapterExecutionContext["onLog"], skillsEntries: Array<{
    key: string;
    runtimeName: string;
    source: string;
}>, desiredSkillNames?: string[], skillsHome?: string): Promise<void>;
export declare function resolveAgyDesiredSkillNames(config: Record<string, unknown>, availableEntries: Array<{
    key: string;
}>): any;
//# sourceMappingURL=skills.d.ts.map