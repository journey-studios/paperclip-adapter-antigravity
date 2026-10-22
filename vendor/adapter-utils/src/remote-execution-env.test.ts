import { describe, expect, it } from "vitest";
import { sanitizeRemoteExecutionEnv, withoutInheritedControlPlaneSecrets } from "./remote-execution-env.js";

describe("sanitizeRemoteExecutionEnv", () => {
  it("drops control-plane secrets while preserving explicit provider and Paperclip run credentials", () => {
    const result = sanitizeRemoteExecutionEnv({
      DATABASE_URL: "postgres://secret",
      BETTER_AUTH_SECRET: "auth-secret",
      PAPERCLIP_AGENT_JWT_SECRET: "jwt-secret",
      PAPERCLIP_TOOL_ACTION_SIGNING_SECRET: "tool-action-secret",
      PAPERCLIP_SECRETS_MASTER_KEY_FILE: "/paperclip/secrets/master.key",
      OMNIROUTE_API_KEY: "route-secret",
      GEMINI_API_KEY: "explicit-provider-key",
      PAPERCLIP_API_KEY: "run-token",
      CUSTOM_RUN_ENV: "ok",
    }, {});
    expect(result).toEqual({
      GEMINI_API_KEY: "explicit-provider-key",
      PAPERCLIP_API_KEY: "run-token",
      CUSTOM_RUN_ENV: "ok",
    });
  });
});

describe("withoutInheritedControlPlaneSecrets", () => {
  it("drops the server's own copies and keeps values configured for the agent", () => {
    const server = {
      PAPERCLIP_AGENT_JWT_SECRET: "jwt-secret",
      PAPERCLIP_TOOL_ACTION_SIGNING_SECRET: "tool-action-secret",
      BETTER_AUTH_SECRET: "auth-secret",
      DATABASE_URL: "postgres://control-plane",
      OMNIROUTE_API_KEY: "route-secret",
    };
    const result = withoutInheritedControlPlaneSecrets({
      ...server,
      DATABASE_URL: "postgres://agent-project-db",
      PAPERCLIP_API_KEY: "run-token",
      PATH: "/usr/bin",
    }, server);
    expect(result).toEqual({
      DATABASE_URL: "postgres://agent-project-db",
      OMNIROUTE_API_KEY: "route-secret",
      PAPERCLIP_API_KEY: "run-token",
      PATH: "/usr/bin",
    });
  });
});
