/**
 * Fixtures captured verbatim from `agy --output-format stream-json`.
 */
export declare const SIMPLE_RUN: string;
export declare const TOOL_RUN: string;
export declare const TRUNCATED_RUN: string;
export declare const MODELS_OUTPUT: string;
/**
 * A recoverable tool error mid-run; the agent recovers and agy reports SUCCESS.
 */
export declare const TOOL_ERROR_RECOVERED_RUN: string;
/**
 * Headless mode auto-denies write_file (no --dangerously-skip-permissions); agy reports
 * SUCCESS with an empty response and `denied_actions`.
 */
export declare const DENIED_ACTION_RUN: string;
//# sourceMappingURL=fixtures.test-util.d.ts.map