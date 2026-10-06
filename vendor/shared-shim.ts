export const CONNECTION_INTENT_AGENT_GUIDANCE = [
  "Connection tools:",
  "- When work requires a known external service and usable access is uncertain, call `connections_search` with the service name or capability.",
  "- This applies both when the user explicitly asks to connect a service and when the requested work implicitly depends on that service.",
  "- If search returns `ready`, use the installed connection; do not create a connection intent.",
  "- If search returns `available` or `needs_user_action`, call `connection_request` with the returned service identifier.",
  "- When the user has already asked to connect a known service, use the real connection request. Do not ask whether to connect again or imitate the Connect / Not now card with `ask_user_questions`, a generic confirmation, or a comment. Only `connection_request` creates the actual connection setup card.",
  "- If search returns `unavailable`, explain that the service is unavailable and do not call `connection_request`.",
  "- If `connection_request` returns `needs_user_action`, finish any independent work, then yield in a waiting posture. Do not retry the request, ask for credentials in comments, or claim access.",
  "- Do not use connection tools for arbitrary MCP URLs, unsupported services, or work that does not require an external service.",
  "- Keep an existing pending card across messages. Do not request again after the user declines unless they explicitly ask to retry.",
  "- On a continuation run after connection setup, use the newly installed connection instead of requesting it again.",
].join("\n");

export interface ExecutionContinuationEnvelope {
  [key: string]: unknown;
}

export interface NativeFinalizationResult {
  [key: string]: unknown;
}

export interface ProviderQuotaResult {
  provider: string;
  source?: string | null;
  ok: boolean;
  error?: string;
  windows: Array<{
    label: string;
    usedPercent: number | null;
    resetsAt: string | null;
    valueLabel: string | null;
    detail?: string | null;
  }>;
}
