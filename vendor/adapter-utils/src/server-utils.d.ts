import { type ChildProcess } from "node:child_process";
import { type ExecutionContinuationEnvelope } from "../../shared-shim.js";
import { type LocalProcessSandboxOptions } from "./local-process-sandbox.js";
import { type SshRemoteExecutionSpec } from "./ssh.js";
import type { AdapterRuntimeToolAccess, AdapterSkillSnapshot } from "./types.js";
export declare function buildRuntimeToolsEnv(access: AdapterRuntimeToolAccess | null | undefined): Record<string, string>;
export interface RunProcessResult {
    exitCode: number | null;
    signal: string | null;
    timedOut: boolean;
    stdout: string;
    stderr: string;
    pid: number | null;
    startedAt: string | null;
    finishedAt?: string | null;
    durationMs?: number | null;
    errorCode?: string | null;
    terminalResultCleanup?: TerminalResultCleanupEvidence | null;
}
export interface TerminalResultCleanupOptions {
    hasTerminalResult: (output: {
        stdout: string;
        stderr: string;
    }) => boolean;
    graceMs?: number;
}
export declare const UNMANAGED_BACKGROUND_TASK_STOP_REASON = "unmanaged_background_task_stopped";
export declare const UNMANAGED_BACKGROUND_TASK_LIVENESS_REASON = "unmanaged background task stopped; no durable live path";
export interface TerminalResultCleanupEvidence {
    kind: "terminal_result_cleanup";
    stopped: true;
    stopReason: typeof UNMANAGED_BACKGROUND_TASK_STOP_REASON;
    reason: typeof UNMANAGED_BACKGROUND_TASK_LIVENESS_REASON;
    terminalResultSeen: boolean;
    signal: NodeJS.Signals | null;
    forceKilled: boolean;
}
interface RunningProcess {
    child: ChildProcess;
    graceSec: number;
    processGroupId: number | null;
}
type RemoteExecutionSpec = SshRemoteExecutionSpec;
export declare function signalRunningProcess(running: Pick<RunningProcess, "child" | "processGroupId">, signal: NodeJS.Signals): void;
export declare const runningProcesses: Map<string, RunningProcess>;
export declare const MAX_CAPTURE_BYTES: number;
export declare const MAX_EXCERPT_BYTES: number;
export declare function isPaperclipRuntimeEnvKey(key: string): boolean;
export declare function isForbiddenConfigEnvKey(key: string): boolean;
export declare function resolvePaperclipInstanceRootForAdapter(input?: {
    homeDir?: string;
    instanceId?: string;
    env?: NodeJS.ProcessEnv;
}): string;
export declare const DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE: string;
export declare const DEFAULT_PAPERCLIP_CONVERSATION_PROMPT_TEMPLATE: string;
export declare const WATCHDOG_DEFAULT_MANDATE: string;
type PaperclipWakeTaskWatchdogLeaf = {
    id: string | null;
    identifier: string | null;
    title: string | null;
    status: string | null;
    priority: string | null;
    role: string | null;
    summary: string | null;
};
type PaperclipWakeTaskWatchdogCapabilities = {
    operations: string[];
    deniedOperations: string[];
    targetScope: {
        watchedIssueId: string | null;
        watchedIssueIdentifier: string | null;
        watchdogIssueId: string | null;
        includeNonWatchdogDescendants: boolean;
        excludedOriginKinds: string[];
    } | null;
};
export type PaperclipWakeTaskWatchdogContext = {
    watchedIssueId: string | null;
    watchedIssueIdentifier: string | null;
    watchedIssueTitle: string | null;
    stopFingerprint: string | null;
    terminalLeafSummaries: PaperclipWakeTaskWatchdogLeaf[];
    customInstructions: string | null;
    capabilities: PaperclipWakeTaskWatchdogCapabilities | null;
};
export interface PaperclipSkillEntry {
    key: string;
    runtimeName: string;
    source: string;
    versionId?: string | null;
    currentVersionId?: string | null;
    sourceStatus?: "available" | "missing";
    missingDetail?: string | null;
}
export interface PaperclipDesiredSkillEntry {
    key: string;
    versionId: string | null;
}
export interface InstalledSkillTarget {
    targetPath: string | null;
    kind: "symlink" | "directory" | "file";
}
export interface MaterializedPaperclipSkillCopyResult {
    copiedFiles: number;
    skippedSymlinks: string[];
}
interface PersistentSkillSnapshotOptions {
    adapterType: string;
    availableEntries: PaperclipSkillEntry[];
    desiredSkills: string[];
    installed: Map<string, InstalledSkillTarget>;
    skillsHome: string;
    locationLabel?: string | null;
    installedDetail?: string | null;
    missingDetail: string;
    externalConflictDetail: string;
    externalDetail: string;
    warnings?: string[];
}
interface RuntimeMountedSkillSnapshotOptions {
    adapterType: string;
    availableEntries: PaperclipSkillEntry[];
    desiredSkills: string[];
    configuredDetail: string | ((entry: PaperclipSkillEntry) => string | null);
    missingDetail?: string;
    mode?: "ephemeral" | "unsupported";
    supported?: boolean;
    unsupportedDetail?: string | ((entry: PaperclipSkillEntry) => string | null);
    warnings?: string[];
    externalInstalled?: Map<string, InstalledSkillTarget>;
    externalLocationLabel?: string | null;
    externalDetail?: string;
    skillsHome?: string;
}
/**
 * True when a runtime skill entry's files are unavailable (failed
 * materialization, deleted version snapshot). Adapters must skip these at
 * mount time: their `source` path does not exist, so symlinking produces a
 * dangling link and content hashing throws.
 */
export declare function isPaperclipSkillSourceMissing(entry: PaperclipSkillEntry): boolean;
export declare function parseObject(value: unknown): Record<string, unknown>;
export declare function asString(value: unknown, fallback: string): string;
export declare function asNumber(value: unknown, fallback: number): number;
export declare function asBoolean(value: unknown, fallback: boolean): boolean;
export declare function asStringArray(value: unknown): string[];
export declare function parseJson(value: string): Record<string, unknown> | null;
export declare function appendWithCap(prev: string, chunk: string, cap?: number): string;
export declare function appendWithByteCap(prev: string, chunk: string, cap?: number): string;
export declare function resolvePathValue(obj: Record<string, unknown>, dottedPath: string): string;
export declare function renderTemplate(template: string, data: Record<string, unknown>): string;
export declare function joinPromptSections(sections: Array<string | null | undefined>, separator?: string): string;
type PaperclipWakeIssue = {
    id: string | null;
    identifier: string | null;
    title: string | null;
    description: string | null;
    descriptionTruncated: boolean;
    status: string | null;
    workMode: string | null;
    priority: string | null;
};
type PaperclipWakeExecutionPrincipal = {
    type: "agent" | "user" | null;
    agentId: string | null;
    userId: string | null;
};
type PaperclipWakeExecutionStage = {
    wakeRole: "reviewer" | "approver" | "executor" | null;
    stageId: string | null;
    stageType: string | null;
    currentParticipant: PaperclipWakeExecutionPrincipal | null;
    returnAssignee: PaperclipWakeExecutionPrincipal | null;
    reviewRequest: {
        instructions: string;
    } | null;
    lastDecisionOutcome: string | null;
    allowedActions: string[];
};
type PaperclipWakeComment = {
    id: string | null;
    issueId: string | null;
    body: string;
    bodyTruncated: boolean;
    createdAt: string | null;
    authorType: string | null;
    authorId: string | null;
};
type PaperclipWakePlanReviewAuthor = {
    type: string | null;
    id: string | null;
};
type PaperclipWakeAnnotationDelta = {
    id: string | null;
    issueId: string | null;
    threadId: string | null;
    documentKey: string | null;
    revisionNumber: number | null;
    quote: string;
    prefix: string;
    suffix: string;
    threadStatus: string | null;
    anchorState: string | null;
    anchorConfidence: string | null;
    body: string;
    bodyTruncated: boolean;
    createdAt: string | null;
    author: PaperclipWakePlanReviewAuthor | null;
};
type PaperclipWakePlanReviewComment = {
    id: string | null;
    threadId: string | null;
    body: string;
    bodyTruncated: boolean;
    author: PaperclipWakePlanReviewAuthor | null;
    createdAt: string | null;
    updatedAt: string | null;
};
type PaperclipWakePlanReviewThread = {
    id: string | null;
    documentKey: string | null;
    documentId: string | null;
    status: string | null;
    revisionId: string | null;
    revisionNumber: number | null;
    anchorState: string | null;
    anchorConfidence: string | null;
    selectedText: string;
    selectedTextTruncated: boolean;
    prefixText: string;
    prefixTextTruncated: boolean;
    suffixText: string;
    suffixTextTruncated: boolean;
    author: PaperclipWakePlanReviewAuthor | null;
    commentCount: number;
    comments: PaperclipWakePlanReviewComment[];
    commentsTruncated: boolean;
    createdAt: string | null;
    updatedAt: string | null;
};
type PaperclipWakePlanReviewInteractionTarget = {
    issueId: string | null;
    documentId: string | null;
    key: string | null;
    revisionId: string | null;
    revisionNumber: number | null;
};
type PaperclipWakePlanReviewInteractionResult = {
    outcome: string | null;
    reason: string | null;
    commentId: string | null;
};
type PaperclipWakePlanReviewInteraction = {
    id: string | null;
    kind: string | null;
    status: string | null;
    continuationPolicy: string | null;
    sourceCommentId: string | null;
    sourceRunId: string | null;
    target: PaperclipWakePlanReviewInteractionTarget | null;
    acceptedTargetRevision: PaperclipWakePlanReviewInteractionTarget | null;
    result: PaperclipWakePlanReviewInteractionResult | null;
    resolvedAt: string | null;
};
type PaperclipWakePlanReviewContext = {
    documentKey: string | null;
    issueId: string | null;
    latestRevisionId: string | null;
    latestRevisionNumber: number | null;
    threads: PaperclipWakePlanReviewThread[];
    interaction: PaperclipWakePlanReviewInteraction | null;
    totals: {
        openThreadCount: number;
        includedThreadCount: number;
        omittedThreadCount: number;
        commentCount: number;
        includedCommentCount: number;
        omittedCommentCount: number;
    };
    limits: {
        maxThreads: number;
        maxComments: number;
        maxBodyChars: number;
        maxTotalBodyChars: number;
        maxAnchorTextChars: number;
    } | null;
    truncated: boolean;
};
type PaperclipWakeDocumentReviewContext = {
    issueId: string | null;
    documents: Array<PaperclipWakePlanReviewContext & {
        title: string | null;
    }>;
    totals: PaperclipWakePlanReviewContext["totals"];
    limits: PaperclipWakePlanReviewContext["limits"];
    truncated: boolean;
};
type PaperclipWakeContinuationSummary = {
    key: string | null;
    title: string | null;
    body: string;
    bodyTruncated: boolean;
    updatedAt: string | null;
};
type PaperclipWakeLivenessContinuation = {
    attempt: number | null;
    maxAttempts: number | null;
    sourceRunId: string | null;
    state: string | null;
    reason: string | null;
    instruction: string | null;
};
type PaperclipWakeChildIssueSummary = {
    id: string | null;
    identifier: string | null;
    title: string | null;
    status: string | null;
    priority: string | null;
    summary: string | null;
};
type PaperclipWakeBlockerSummary = {
    id: string | null;
    identifier: string | null;
    title: string | null;
    status: string | null;
    priority: string | null;
};
type PaperclipWakeTreeHoldSummary = {
    holdId: string | null;
    rootIssueId: string | null;
    mode: string | null;
    reason: string | null;
};
type PaperclipWakeCheckboxSelection = {
    prompt: string | null;
    selectedOptionIds: string[];
    selectedOptions: Array<{
        id: string;
        label: string;
        description: string | null;
    }>;
};
type PaperclipWakeQuestionResponse = {
    interactionId: string;
    summaryMarkdown: string;
    truncated: boolean;
};
type PaperclipWakeExternalChatQuestionResponse = {
    schema: "paperclip.external_chat_question_response.v1";
    interactionId: string;
    responseDeliveryId: string;
    sourceRunId: string;
    sourceCommentId: string;
    endpointId: string;
    conversationId: string;
    bindingSha256: string;
};
type PaperclipWakeExecutionWorkspace = {
    branchName: string | null;
};
type PaperclipWakeToolResult = {
    actionRequestId: string;
    toolName: string;
    resultSummary: string;
    error: string | null;
    declineReason: string | null;
};
type PaperclipWakeAgentMessage = {
    untrustedToolResults?: PaperclipWakeToolResult[];
    text: string;
    source: string | null;
    pluginKey: string | null;
    sessionId: string | null;
};
type PaperclipWakeRecovery = {
    cause: string | null;
    failureSummary: string | null;
    originalAssignee: {
        id: string | null;
        name: string | null;
    } | null;
    attemptCount: number | null;
    maxAttempts: number | null;
    nextAction: string | null;
    routingFallbackReason: string | null;
};
export type PaperclipExternalChatProvider = "slack" | "github" | "discord" | "microsoft-teams" | "telegram" | "imessage-photon";
type PaperclipWakePayload = {
    executionContinuation: ExecutionContinuationEnvelope | null;
    reason: string | null;
    recovery: PaperclipWakeRecovery | null;
    issue: PaperclipWakeIssue | null;
    checkedOutByHarness: boolean;
    externalChatExecutionBound: boolean;
    externalChatProvider: PaperclipExternalChatProvider | null;
    externalChatQuestionResponse: PaperclipWakeExternalChatQuestionResponse | null;
    skillTest: boolean;
    simplifiedEnglishInteractions: boolean;
    dependencyBlockedInteraction: boolean;
    treeHoldInteraction: boolean;
    activeTreeHold: PaperclipWakeTreeHoldSummary | null;
    unresolvedBlockerIssueIds: string[];
    unresolvedBlockerSummaries: PaperclipWakeBlockerSummary[];
    executionStage: PaperclipWakeExecutionStage | null;
    continuationSummary: PaperclipWakeContinuationSummary | null;
    planReviewContext: PaperclipWakePlanReviewContext | null;
    documentReviewContext: PaperclipWakeDocumentReviewContext | null;
    livenessContinuation: PaperclipWakeLivenessContinuation | null;
    taskWatchdog: PaperclipWakeTaskWatchdogContext | null;
    interactionId: string | null;
    sourceRunId: string | null;
    interactionKind: string | null;
    interactionStatus: string | null;
    externalInteractionContinuation: boolean;
    checkboxSelection: PaperclipWakeCheckboxSelection | null;
    questionResponse: PaperclipWakeQuestionResponse | null;
    executionWorkspace: PaperclipWakeExecutionWorkspace | null;
    agentMessage: PaperclipWakeAgentMessage | null;
    annotationDeltas: PaperclipWakeAnnotationDelta[];
    childIssueSummaries: PaperclipWakeChildIssueSummary[];
    childIssueSummaryTruncated: boolean;
    commentIds: string[];
    latestCommentId: string | null;
    comments: PaperclipWakeComment[];
    requestedCount: number;
    includedCount: number;
    missingCount: number;
    truncated: boolean;
    fallbackFetchNeeded: boolean;
};
export declare function normalizePaperclipWakePayload(value: unknown): PaperclipWakePayload | null;
export declare function stringifyPaperclipWakePayload(value: unknown, options?: {
    omitIssueDescription?: boolean;
}): string | null;
export declare function isPaperclipRecoveryWakePayload(value: unknown): boolean;
/**
 * Recognize only the closed, server-attested answered-chat shape for prompting.
 * The server must independently authorize the marker against durable state;
 * this shape check is not a grant of publication, task, or tool authority.
 */
export declare function isPaperclipExternalChatQuestionResponseTurn(value: unknown): boolean;
/**
 * Returns true only for an ordinary external-chat task wake that the trusted
 * Paperclip harness has already authenticated, bound to a concrete issue, and
 * checked out for this run. Provider-like text elsewhere in the payload cannot
 * opt a turn into this contract.
 */
export declare function isPaperclipExternalChatTurn(value: unknown): boolean;
/**
 * Returns true for either an inline-complete external-chat turn or the exact
 * overflow shape that a native runner can satisfy through its closed reader.
 * Callers must not assume the reader exists outside the native-runner lane.
 */
export declare function isPaperclipExternalChatContractTurn(value: unknown): boolean;
export declare function readPaperclipIssueWorkModeFromContext(value: unknown): string | null;
export declare function isAssignmentShapedPaperclipWakeReason(reason: string | null | undefined): boolean;
export declare function selectInitialCommunicationGuidance(context: Record<string, unknown> | null | undefined, options?: {
    resumedSession?: boolean;
}): string;
export declare function selectPaperclipTaskMarkdown(context: Record<string, unknown> | null | undefined, options?: {
    resumedSession?: boolean;
    includeCommunicationGuidance?: boolean;
}): string;
export declare function renderPaperclipWakePrompt(value: unknown, options?: Parameters<typeof renderPaperclipWakePromptBody>[1]): string;
declare function renderPaperclipWakePromptBody(value: unknown, options?: {
    resumedSession?: boolean;
    includeExecutionContract?: boolean;
    conversationMode?: boolean;
    nativeWakeReaderAvailable?: boolean;
    suppressIssueDescription?: boolean;
}): string;
export declare function redactEnvForLogs(env: Record<string, string>): Record<string, string>;
export declare function redactCommandTextForLogs(command: string): string;
export declare function buildInvocationEnvForLogs(env: Record<string, string>, options?: {
    runtimeEnv?: NodeJS.ProcessEnv | Record<string, string>;
    includeRuntimeKeys?: string[];
    resolvedCommand?: string | null;
    resolvedCommandEnvKey?: string;
}): Record<string, string>;
export declare function buildPaperclipEnv(agent: {
    id: string;
    companyId: string;
}): Record<string, string>;
export declare function applyPaperclipWorkspaceEnv(env: Record<string, string>, input: {
    workspaceCwd?: string | null;
    workspaceSource?: string | null;
    workspaceStrategy?: string | null;
    workspaceId?: string | null;
    workspaceRepoUrl?: string | null;
    workspaceRepoRef?: string | null;
    workspaceBranch?: string | null;
    workspaceWorktreePath?: string | null;
    agentHome?: string | null;
}): Record<string, string>;
export declare function shapePaperclipWorkspaceEnvForExecution(input: {
    workspaceCwd?: string | null;
    workspaceWorktreePath?: string | null;
    workspaceHints?: Array<Record<string, unknown>>;
    executionTargetIsRemote?: boolean;
    executionCwd?: string | null;
    /**
     * On a remote target, the map of referenced (mentioned) project id to the staged in-sandbox
     * directory that received that project's tree (`project-<projectId>`). A non-anchor hint whose
     * `projectId` has an entry repoints its `cwd` to the staged directory. A non-anchor hint with no
     * entry loses its `cwd`, so the agent never receives a path the transport did not stage. The map
     * is empty on a local target and defaults to empty, so a caller that passes nothing keeps the
     * previous behavior (every non-anchor hint loses its `cwd` on a remote target).
     */
    stagedProjectDirs?: Record<string, string>;
}): {
    workspaceCwd: string | null;
    workspaceWorktreePath: string | null;
    workspaceHints: Array<Record<string, unknown>>;
};
export declare function rewriteWorkspaceCwdEnvVarsForExecution(input: {
    env: Record<string, unknown>;
    workspaceCwd?: string | null;
    executionCwd?: string | null;
    executionTargetIsRemote?: boolean;
}): Record<string, string>;
export declare function refreshPaperclipWorkspaceEnvForExecution(input: {
    env: Record<string, string>;
    envConfig?: Record<string, unknown>;
    workspaceCwd?: string | null;
    workspaceSource?: string | null;
    workspaceStrategy?: string | null;
    workspaceId?: string | null;
    workspaceRepoUrl?: string | null;
    workspaceRepoRef?: string | null;
    workspaceBranch?: string | null;
    workspaceWorktreePath?: string | null;
    workspaceHints?: Array<Record<string, unknown>>;
    agentHome?: string | null;
    executionTargetIsRemote?: boolean;
    executionCwd?: string | null;
    /** Referenced-project id to staged in-sandbox directory map; see {@link shapePaperclipWorkspaceEnvForExecution}. */
    stagedProjectDirs?: Record<string, string>;
}): {
    workspaceCwd: string | null;
    workspaceWorktreePath: string | null;
    workspaceHints: Array<Record<string, unknown>>;
};
export declare function sanitizeInheritedPaperclipEnv(baseEnv: NodeJS.ProcessEnv): NodeJS.ProcessEnv;
export declare function defaultPathForPlatform(): "C:\\Windows\\System32;C:\\Windows;C:\\Windows\\System32\\Wbem" | "/usr/local/bin:/opt/homebrew/bin:/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin";
export declare function resolveCommandForLogs(command: string, cwd: string, env: NodeJS.ProcessEnv, options?: {
    remoteExecution?: RemoteExecutionSpec | null;
}): Promise<string>;
export declare function sanitizeSshRemoteEnv(env: Record<string, string>, inheritedEnv?: NodeJS.ProcessEnv): Record<string, string>;
export declare function ensurePathInEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv;
export declare function ensureAbsoluteDirectory(cwd: string, opts?: {
    createIfMissing?: boolean;
}): Promise<void>;
export declare function resolvePaperclipSkillsDir(moduleDir: string, additionalCandidates?: string[]): Promise<string | null>;
export declare function listPaperclipSkillEntries(moduleDir: string, additionalCandidates?: string[]): Promise<PaperclipSkillEntry[]>;
export declare function readInstalledSkillTargets(skillsHome: string): Promise<Map<string, InstalledSkillTarget>>;
export declare function buildRuntimeMountedSkillSnapshot(options: RuntimeMountedSkillSnapshotOptions): AdapterSkillSnapshot;
export declare function buildPersistentSkillSnapshot(options: PersistentSkillSnapshotOptions): AdapterSkillSnapshot;
export declare function readPaperclipRuntimeSkillEntries(config: Record<string, unknown>, moduleDir: string, additionalCandidates?: string[]): Promise<PaperclipSkillEntry[]>;
export declare function readPaperclipSkillMarkdown(moduleDir: string, skillKey: string): Promise<string | null>;
export declare function readPaperclipSkillSyncPreference(config: Record<string, unknown>): {
    explicit: boolean;
    desiredSkills: string[];
    desiredSkillEntries: PaperclipDesiredSkillEntry[];
};
export declare function resolvePaperclipDesiredSkillNames(config: Record<string, unknown>, availableEntries: Array<{
    key: string;
    runtimeName?: string | null;
}>): string[];
/**
 * Legacy adapters call the Paperclip API through the operational skill. Keep
 * that skill mounted even when an agent predates skill preferences or carries
 * an explicit empty desired set. Native runners provide the same authority
 * through their protocol and must continue to use the configurable-only
 * resolver above.
 */
export declare const PAPERCLIP_OPERATIONAL_SKILL_KEY = "paperclipai/paperclip/paperclip";
/**
 * Native Paperclip Runner sessions receive the control-plane contract through
 * PRP, so carrying the legacy operational skill into their stored preference
 * is redundant and invalid. Normalize it away at persistence boundaries.
 * Legacy adapters remain unchanged because their runtime resolver mounts the
 * operational skill automatically, including after switching back.
 */
export declare function normalizePaperclipOperationalSkillPreference(adapterType: string, config: Record<string, unknown>): Record<string, unknown>;
/** Apply the persisted defaults and skill contract for the native runner. */
export declare function normalizePaperclipRunnerAdapterConfig(adapterType: string, config: Record<string, unknown>): Record<string, unknown>;
export declare function resolveLegacyPaperclipDesiredSkillNames(config: Record<string, unknown>, availableEntries: Array<{
    key: string;
    runtimeName?: string | null;
}>): string[];
export declare function writePaperclipSkillSyncPreference(config: Record<string, unknown>, desiredSkills: Array<string | PaperclipDesiredSkillEntry>): Record<string, unknown>;
export declare function ensurePaperclipSkillSymlink(source: string, target: string, linkSkill?: (source: string, target: string) => Promise<void>): Promise<"created" | "repaired" | "skipped">;
export declare function materializePaperclipSkillCopy(source: string, target: string): Promise<MaterializedPaperclipSkillCopyResult>;
export declare function removeMaintainerOnlySkillSymlinks(skillsHome: string, allowedSkillNames: Iterable<string>): Promise<string[]>;
export declare function ensureCommandResolvable(command: string, cwd: string, env: NodeJS.ProcessEnv, options?: {
    remoteExecution?: RemoteExecutionSpec | null;
}): Promise<void>;
export declare function runChildProcess(runId: string, command: string, args: string[], opts: {
    cwd: string;
    env: Record<string, string>;
    timeoutSec: number;
    graceSec: number;
    onLog: (stream: "stdout" | "stderr", chunk: string) => Promise<void>;
    onLogError?: (err: unknown, runId: string, message: string) => void;
    onSpawn?: (meta: {
        pid: number;
        processGroupId: number | null;
        startedAt: string;
    }) => Promise<void>;
    terminalResultCleanup?: TerminalResultCleanupOptions;
    stdin?: string;
    remoteExecution?: RemoteExecutionSpec | null;
    localProcessSandbox?: LocalProcessSandboxOptions | null;
}): Promise<RunProcessResult>;
export {};
//# sourceMappingURL=server-utils.d.ts.map