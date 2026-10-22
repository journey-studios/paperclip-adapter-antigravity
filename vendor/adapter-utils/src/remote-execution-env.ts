const REMOTE_EXECUTION_ENV_IDENTITY_KEYS = new Set([
  "PATH",
  "HOME",
  "PWD",
  "SHELL",
  "USER",
  "LOGNAME",
  "NVM_DIR",
  "TMPDIR",
  "TMP",
  "TEMP",
  "XDG_CONFIG_HOME",
  "XDG_CACHE_HOME",
  "XDG_DATA_HOME",
  "XDG_STATE_HOME",
  "XDG_RUNTIME_DIR",
]);

// Secrets that belong to the Paperclip control plane. No agent process needs them, local or remote: holding the JWT
// or tool-action signing secret is enough to act as any agent. Adapters build a run's env as `{ ...process.env, ...env }`,
// which hands the server's copy to every agent, and an agent that runs `env` sends it to its model provider.
const CONTROL_PLANE_SECRET_ENV_KEYS = new Set([
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "PAPERCLIP_AGENT_JWT_SECRET",
  "PAPERCLIP_TOOL_ACTION_SIGNING_SECRET",
  "PAPERCLIP_SECRETS_MASTER_KEY",
  "PAPERCLIP_SECRETS_MASTER_KEY_FILE",
]);

// Nothing from the control plane crosses an execution-target boundary, the server's own gateway key included.
// Provider credentials intentionally are not listed here: those may be supplied explicitly per agent/environment.
const REMOTE_EXECUTION_CONTROL_PLANE_SECRET_KEYS = new Set([
  ...CONTROL_PLANE_SECRET_ENV_KEYS,
  "OMNIROUTE_API_KEY",
]);

function readEnvValueCaseInsensitive(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const direct = env[key];
  if (typeof direct === "string") return direct;
  const upper = key.toUpperCase();
  for (const [candidateKey, candidateValue] of Object.entries(env)) {
    if (candidateKey.toUpperCase() === upper && typeof candidateValue === "string") {
      return candidateValue;
    }
  }
  return undefined;
}

// Drops the copies of control-plane secrets a run env inherited from the server. A value that differs from the server's
// was set for this agent on purpose (its own database, say), so it stays.
export function withoutInheritedControlPlaneSecrets<T extends string | undefined>(
  env: Record<string, T>,
  inheritedEnv: NodeJS.ProcessEnv = process.env,
): Record<string, T> {
  const kept: Record<string, T> = {};
  for (const [key, value] of Object.entries(env)) {
    const inherited =
      CONTROL_PLANE_SECRET_ENV_KEYS.has(key.toUpperCase()) &&
      readEnvValueCaseInsensitive(inheritedEnv, key) === value;
    if (!inherited) kept[key] = value;
  }
  return kept;
}

export function sanitizeRemoteExecutionEnv(
  env: Record<string, string>,
  inheritedEnv: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    const normalizedKey = key.toUpperCase();
    if (REMOTE_EXECUTION_CONTROL_PLANE_SECRET_KEYS.has(normalizedKey)) {
      continue;
    }
    if (!REMOTE_EXECUTION_ENV_IDENTITY_KEYS.has(normalizedKey)) {
      sanitized[key] = value;
      continue;
    }
    const inheritedValue = readEnvValueCaseInsensitive(inheritedEnv, key);
    if (typeof inheritedValue === "string" && inheritedValue === value) {
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
}
