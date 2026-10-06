import type { AdapterConfigSchema } from "@paperclipai/adapter-utils";
import { models, DEFAULT_AGY_LOCAL_MODEL } from "../index.js";

/**
 * Declarative configuration schema for Antigravity adapter settings.
 * Paperclip UI uses this schema to render fields in the Agent Runtime settings tab.
 */
export function getConfigSchema(): AdapterConfigSchema {
  return {
    fields: [
      {
        key: "model",
        label: "Model",
        type: "select",
        default: DEFAULT_AGY_LOCAL_MODEL,
        options: models.map((m) => ({
          value: m.id,
          label: m.label,
        })),
        hint: "Select the Gemini, Claude, or OSS model to run with Antigravity.",
      },
      {
        key: "dangerouslySkipPermissions",
        label: "Skip Tool Permissions",
        type: "toggle",
        default: true,
        hint: "Auto-approve tool execution for headless runs (prevents agy_permission_denied).",
      },
      {
        key: "effort",
        label: "Reasoning Effort",
        type: "select",
        default: "high",
        options: [
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
        ],
        hint: "Reasoning effort tier passed to agy CLI.",
      },
      {
        key: "mode",
        label: "Execution Mode",
        type: "select",
        default: "accept-edits",
        options: [
          { value: "accept-edits", label: "Accept Edits" },
          { value: "plan", label: "Plan" },
        ],
        hint: "Execution mode for agy.",
      },
      {
        key: "printTimeout",
        label: "Turn Timeout",
        type: "text",
        default: "24h",
        hint: "Maximum time limit per CLI turn (e.g. 15m, 30m, 1h, 24h).",
      },
      {
        key: "project",
        label: "Antigravity Project",
        type: "text",
        hint: "Optional project ID or project name passed via --project.",
      },
      {
        key: "promptTemplate",
        label: "Prompt Template",
        type: "textarea",
        hint: "Optional custom prompt template with {{variable}} placeholders.",
      },
      {
        key: "extraArgs",
        label: "Extra CLI Arguments",
        type: "text",
        hint: "Optional comma-separated arguments passed to agy CLI.",
      },
    ],
  };
}
