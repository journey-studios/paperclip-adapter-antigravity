import { describe, expect, it } from "vitest";
import { parseAgyUsageQuotaOutput } from "./quota.js";

describe("parseAgyUsageQuotaOutput", () => {
  it("parses provider-authoritative model-family quota buckets and reset times", () => {
    const raw = JSON.stringify({
      conversation_id: "",
      status: "SUCCESS",
      response: "",
      command: {
        name: "usage",
        data: {
          groups: [
            {
              name: "Gemini Models",
              description: "Models within this group: Gemini Flash, Gemini Pro",
              buckets: [
                {
                  id: "gemini-weekly",
                  name: "Weekly Limit Remaining",
                  window: "weekly",
                  remaining_fraction: 0.4090534448623657,
                  reset_time: "2026-10-10T15:05:35Z",
                },
                {
                  id: "gemini-5h",
                  name: "Five Hour Limit Remaining",
                  window: "5h",
                  remaining_fraction: 0.8810517191886902,
                  reset_time: "2026-10-07T02:36:13Z",
                },
              ],
            },
            {
              name: "Claude and GPT models",
              buckets: [
                {
                  id: "3p-5h",
                  name: "Five Hour Limit Remaining",
                  window: "5h",
                  remaining_fraction: 1,
                  reset_time: "2026-10-07T03:46:05Z",
                },
              ],
            },
          ],
        },
      },
    });

    const result = parseAgyUsageQuotaOutput(raw);
    expect(result?.source).toBe("antigravity:/usage");
    expect(result?.windows).toHaveLength(3);

    const gemini5h = result?.windows.find((window) => window.label === "Gemini Models · 5h");
    expect(gemini5h).toEqual(
      expect.objectContaining({
        usedPercent: 12,
        valueLabel: "88% remaining",
        resetsAt: "2026-10-07T02:36:13Z",
      }),
    );

    const thirdParty5h = result?.windows.find(
      (window) => window.label === "Claude and GPT models · 5h",
    );
    expect(thirdParty5h?.valueLabel).toBe("100% remaining");
  });

  it("rejects malformed or unrelated payloads", () => {
    expect(parseAgyUsageQuotaOutput("not json")).toBeNull();
    expect(
      parseAgyUsageQuotaOutput(JSON.stringify({ command: { name: "models", data: {} } })),
    ).toBeNull();
  });
});
