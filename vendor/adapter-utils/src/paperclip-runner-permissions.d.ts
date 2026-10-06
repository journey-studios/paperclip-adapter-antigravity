export type PaperclipRunnerProvider = "codex" | "opencode" | "claude_managed" | "aws_agentcore" | "acpx";
export type CodexPermissionMode = "never" | "on-request" | "untrusted";
export type OpenCodePermissionMode = "allow" | "ask" | "deny";
export type AcpxPermissionMode = "approve-all" | "approve-paperclip" | "approve-reads" | "deny-all";
export type PaperclipRunnerPermissionMode = CodexPermissionMode | OpenCodePermissionMode | AcpxPermissionMode;
export declare const PAPERCLIP_RUNNER_IDLE_TIMEOUT_DEFAULT_MS = 300000;
export declare const PAPERCLIP_RUNNER_IDLE_TIMEOUT_MAX_MS = 86400000;
export declare const PAPERCLIP_RUNNER_DEFAULT_MODELS: {
    readonly codex: "gpt-5.6-sol";
    readonly acpx: "claude-sonnet-5";
    readonly opencode: "openrouter/deepseek/deepseek-v4-flash-0731";
};
export interface PaperclipRunnerPermissionOption<TMode extends string = string> {
    value: TMode;
    label: string;
    description: string;
}
export type PaperclipRunnerPermissionCapability = {
    configurable: true;
    configKey: "codexPermissionMode" | "opencodePermissionMode" | "acpxPermissionMode";
    defaultMode: PaperclipRunnerPermissionMode;
    options: readonly PaperclipRunnerPermissionOption<PaperclipRunnerPermissionMode>[];
    description: string;
} | {
    configurable: false;
    defaultMode: "provider-managed";
    options: readonly [];
    description: string;
};
/**
 * Control-plane catalog for Paperclip Runner permission UX and validation.
 * Runtime contracts validate the same native values again at the process
 * boundary; this catalog must remain browser-safe.
 */
export declare const PAPERCLIP_RUNNER_PERMISSION_CAPABILITIES: {
    readonly codex: {
        readonly configurable: true;
        readonly configKey: "codexPermissionMode";
        readonly defaultMode: "never";
        readonly description: "Codex runs automatically inside a root-denied, workspace-scoped, network-disabled Paperclip environment.";
        readonly options: readonly [{
            readonly value: "never";
            readonly label: "Automatic (isolated)";
            readonly description: "Run without Codex approval pauses while Paperclip keeps its independent workspace, network, and environment restrictions.";
        }];
    };
    readonly opencode: {
        readonly configurable: true;
        readonly configKey: "opencodePermissionMode";
        readonly defaultMode: "allow";
        readonly description: "Controls OpenCode tool permissions inside the assigned Paperclip environment.";
        readonly options: readonly [{
            readonly value: "allow";
            readonly label: "Full auto (allow)";
            readonly description: "Allow OpenCode operations without approval pauses.";
        }, {
            readonly value: "ask";
            readonly label: "Ask for permission";
            readonly description: "Prompt before protected OpenCode operations.";
        }, {
            readonly value: "deny";
            readonly label: "Deny operations";
            readonly description: "Reject protected OpenCode operations.";
        }];
    };
    readonly claude_managed: {
        readonly configurable: false;
        readonly defaultMode: "provider-managed";
        readonly options: readonly [];
        readonly description: "Claude Managed runs non-interactively under its qualified provider profile and Paperclip policy.";
    };
    readonly aws_agentcore: {
        readonly configurable: false;
        readonly defaultMode: "provider-managed";
        readonly options: readonly [];
        readonly description: "AWS AgentCore runs non-interactively under its qualified harness profile and Paperclip policy.";
    };
    readonly acpx: {
        readonly configurable: true;
        readonly configKey: "acpxPermissionMode";
        readonly defaultMode: "approve-all";
        readonly description: "Controls ACPX agent operations inside the assigned Paperclip environment.";
        readonly options: readonly [{
            readonly value: "approve-all";
            readonly label: "Full auto (approve all)";
            readonly description: "Approve ACPX operations without approval pauses.";
        }, {
            readonly value: "approve-paperclip";
            readonly label: "Automatic Paperclip actions";
            readonly description: "Automatically run assigned Paperclip planning and task tools, including reassignment. Company permissions and approval requirements still apply. Other operations require permission.";
        }, {
            readonly value: "approve-reads";
            readonly label: "Allow Paperclip reads";
            readonly description: "Automatically allow assigned Paperclip read tools. Other operations stop with an approval-required message because this runner has no interactive approval handler.";
        }, {
            readonly value: "deny-all";
            readonly label: "Deny all";
            readonly description: "Reject harness permission requests.";
        }];
    };
};
export declare function isPaperclipRunnerProvider(value: unknown): value is PaperclipRunnerProvider;
export declare function resolvePaperclipRunnerPermissionMode(provider: PaperclipRunnerProvider, value: unknown): PaperclipRunnerPermissionMode | "provider-managed";
export declare function resolvePaperclipRunnerModel(provider: keyof typeof PAPERCLIP_RUNNER_DEFAULT_MODELS, value: unknown): string;
export declare function resolvePaperclipRunnerIdleTimeoutMs(value: unknown): number;
/** Defaults for converting a local adapter; the operator may override the provider. */
export declare function paperclipRunnerTransitionConfig(previousAdapterType: string, previousModel: unknown, providerOverride?: unknown): Record<string, unknown>;
/** Old ACPX Codex agent settings use native Codex on their next configuration write. */
export declare function normalizeLegacyRunnerProvider(config: Record<string, unknown>): Record<string, unknown>;
//# sourceMappingURL=paperclip-runner-permissions.d.ts.map