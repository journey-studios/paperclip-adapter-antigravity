export interface AgyCredentialReadinessInput {
    env?: NodeJS.ProcessEnv;
    homedir?: string;
    configuredApiKey?: string | null;
}
export interface AgyCredentialReadiness {
    ready: boolean;
    authMode: "subscription" | "api" | "none";
    tokenPath?: string | null;
    detail?: string | null;
}
/**
 * Searches for the Antigravity CLI OAuth token file across standard locations:
 * - $ANTIGRAVITY_CLI_HOME/antigravity-oauth-token
 * - $GEMINI_CLI_HOME/antigravity-oauth-token
 * - ~/.gemini/antigravity-cli/antigravity-oauth-token
 * - ~/.gemini/antigravity/antigravity-oauth-token
 */
export declare function resolveAgyOAuthTokenPath(homedir?: string, env?: NodeJS.ProcessEnv): string | null;
/**
 * Validates whether the OAuth token file exists, is non-empty, and contains a valid token.
 */
export declare function hasUsableAgyOAuthToken(tokenPath: string): boolean;
/**
 * Checks whether Antigravity credentials are ready to use.
 * Checks for:
 * 1. Explicitly configured API key
 * 2. Environment API keys (GEMINI_API_KEY, AGY_API_KEY, ANTIGRAVITY_API_KEY)
 * 3. Local OAuth token in ~/.gemini/antigravity-cli (or alternate homes)
 */
export declare function evaluateAgyCredentialReadiness(input?: AgyCredentialReadinessInput): AgyCredentialReadiness;
//# sourceMappingURL=credentials.d.ts.map