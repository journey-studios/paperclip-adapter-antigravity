export declare const REDACTED_COMMAND_TEXT_VALUE = "***REDACTED***";
export declare function isPublicExecutorToolSelector(value: string): boolean;
export declare function redactCommandText(command: string, redactedValue?: string): string;
/**
 * Redact secrets from an untrusted diagnostic string.
 *
 * The function first runs the command redaction. The command redaction handles
 * shell `KEY=value` assignments, CLI secret options, bearer headers, and common
 * token shapes. The function then redacts JSON and escaped-JSON secret fields,
 * because a sandbox diagnostic can carry a serialized JSON error such as
 * `{"token":"opaque-value"}`. The caller must still bound the length after this
 * step.
 */
export declare function redactDiagnosticText(text: string, redactedValue?: string): string;
//# sourceMappingURL=command-redaction.d.ts.map