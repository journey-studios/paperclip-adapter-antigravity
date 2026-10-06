/**
 * The login panel mode. `displayed_code` shows a one-time code that the user
 * enters in the browser. `submitted_browser_code` asks the user to paste a code
 * from the browser back into the login flow.
 */
export declare const ADAPTER_LOGIN_PANEL_MODES: readonly ["displayed_code", "submitted_browser_code"];
export type AdapterLoginPanelMode = (typeof ADAPTER_LOGIN_PANEL_MODES)[number];
/**
 * The host-side timeout policy. `caller_bounded` lets the caller set the
 * timeout. `fixed` binds the timeout to a fixed adapter value.
 */
export declare const ADAPTER_LOGIN_TIMEOUT_POLICIES: readonly ["caller_bounded", "fixed"];
export type AdapterLoginTimeoutPolicy = (typeof ADAPTER_LOGIN_TIMEOUT_POLICIES)[number];
/**
 * The optional completion claim that the login flow records on success.
 * `storedSessionId` marks that the flow stored a session identifier.
 */
export declare const ADAPTER_LOGIN_COMPLETION_CLAIMS: readonly ["storedSessionId"];
export type AdapterLoginCompletionClaim = (typeof ADAPTER_LOGIN_COMPLETION_CLAIMS)[number];
/**
 * The normalized login prompt. `url` is the validated authorization URL. `code`
 * is the one-time code to show, present only in `displayed_code` mode. A prompt
 * carries no credential secret.
 */
export interface AdapterLoginPrompt {
    url: string;
    code?: string;
}
/**
 * The completion context. The server passes it to the completion hook. It
 * carries the non-secret completion state. It carries no credential byte.
 */
export interface AdapterLoginCompletionContext {
    /** The session identifier that the flow stored, when it stored one. */
    storedSessionId?: string;
}
/**
 * The optional adapter login capability. It declares how the server drives an
 * interactive sandbox login for the adapter. The capability data holds no
 * secret. An adapter with no interactive login (for example an API-key-only
 * vendor) declares no capability.
 */
export interface AdapterLoginCapability {
    /** The login panel mode. */
    panelMode: AdapterLoginPanelMode;
    /** The host-side timeout policy. */
    timeoutPolicy: AdapterLoginTimeoutPolicy;
    /** Returns the fixed, non-secret login command. */
    getCommand: () => string;
    /**
     * Parses the authorization prompt from the login output. Returns null when the
     * output holds no prompt yet. The parser keeps every input byte out of its
     * result and out of every thrown error.
     */
    parsePrompt: (output: string) => AdapterLoginPrompt | null;
    /**
     * Captures the minted credential from the login output. Returns the raw
     * credential bytes, or null when the output holds no credential yet. Only a
     * flow that prints the credential to the terminal sets it. The result is a
     * runtime secret; the capability data never stores it.
     */
    captureCredential?: (output: string) => Buffer | null;
    /**
     * Runs after a successful login. It records the non-secret completion state.
     * It carries no credential byte.
     */
    onComplete?: (ctx: AdapterLoginCompletionContext) => Promise<void>;
    /** The optional completion claim that the flow records on success. */
    completionClaim?: AdapterLoginCompletionClaim;
}
/**
 * Validates one login capability. The function fails closed: it throws a clear
 * error for a malformed shape. It checks each scalar field against its fixed
 * value set, checks each required function member, and checks each optional
 * member only when the member is present. `adapterType` names the adapter in the
 * error text.
 */
export declare function assertValidAdapterLoginCapability(value: unknown, adapterType: string): asserts value is AdapterLoginCapability;
/**
 * Validates the optional login capability of an adapter module. The function is
 * a no-op when the module declares no login capability. It throws a clear error
 * when the module declares a malformed capability, so the loader fails closed.
 */
export declare function validateAdapterLoginCapability(mod: {
    type?: unknown;
    loginCapability?: unknown;
}): void;
//# sourceMappingURL=login-capability.d.ts.map