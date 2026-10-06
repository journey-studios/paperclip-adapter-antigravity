/**
 * Convert the structured `envBindings` map into an adapter `env` map. Keep
 * `plain`, `secret_ref`, and `user_secret_ref` bindings. Drop entries with an
 * invalid variable name or an unknown binding shape.
 */
export declare function parseEnvBindings(bindings: unknown): Record<string, unknown>;
/**
 * Parse the legacy plain-text `KEY=value` block. Skip blank lines, comment
 * lines, and lines with an invalid variable name.
 */
export declare function parseEnvVars(text: string): Record<string, string>;
/**
 * Build the adapter `env` map from both form sources. A structured binding wins
 * over a legacy plain-text entry with the same key.
 */
export declare function buildAdapterEnvConfig(envBindings: unknown, envVars: string | undefined | null): Record<string, unknown>;
//# sourceMappingURL=env-bindings.d.ts.map