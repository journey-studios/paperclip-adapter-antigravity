import type { AdapterExecutionContext } from "../types.js";
/**
 * Structured event emitted once per named sandbox run-startup boundary so the
 * duration of each bring-up step lands in the `heartbeat_run_events` stream
 * (jsonb `payload`) beside the existing "run started" / "adapter invocation"
 * anchors. Observability-only — it rides the existing
 * `ctx.onEvent → onAdapterEvent → appendRunEvent` bridge with no schema change.
 */
export declare const RUN_STARTUP_STEP_EVENT_TYPE = "run.startup.step";
/**
 * Map a raw provider key to a low-cardinality public family. Return the key
 * unchanged when it is a built-in family. Return `plugin` for every other
 * value, so an operator-defined plugin key never becomes an unbounded span
 * attribute. A missing or empty key also maps to `plugin`.
 */
export declare function normalizeProviderFamily(key: string | undefined): string;
/**
 * The common prefix for every sandbox-startup span attribute. One prefix keeps
 * the attribute namespace closed and easy to find in the OpenTelemetry backend.
 */
export declare const SANDBOX_STARTUP_SPAN_ATTR_PREFIX = "paperclip.sandbox.startup.";
/**
 * The closed attribute-name contract for every sandbox-startup span. This is
 * the single source of truth for the harness span attributes. Each name uses
 * the `paperclip.sandbox.startup.` prefix and a type suffix:
 *
 * - `*.wall_ms` — one wall-clock time in float milliseconds.
 * - `*.count` — a count.
 *
 * The producer sets only these keys. It never sets a free-form key, so a
 * command, a path, an argument, or an environment value can never ride a span.
 */
export declare const SANDBOX_STARTUP_SPAN_ATTRS: {
    /** The low-cardinality provider family (through `normalizeProviderFamily`). */
    readonly provider: "paperclip.sandbox.startup.provider";
    /** The step or execution outcome: `ok`, `skipped`, or `failed`. */
    readonly outcome: "paperclip.sandbox.startup.outcome";
    /** The wall-clock time of one measured step. */
    readonly stepWallMs: "paperclip.sandbox.startup.step.wall_ms";
    /** The clamped `argv[0]` command label of one execution. */
    readonly execCommand: "paperclip.sandbox.startup.exec.command";
    /** The numeric process exit code of one execution. */
    readonly execExitCode: "paperclip.sandbox.startup.exec.exit_code";
    /** The host-measured wall time of one execution. */
    readonly execWallMs: "paperclip.sandbox.startup.exec.wall_ms";
    /** The provider handle-fetch wait before one execution ran. */
    readonly execWaitBeforeMs: "paperclip.sandbox.startup.exec.wait_before_ms";
    /** The in-sandbox run time of one execution. */
    readonly execSandboxMs: "paperclip.sandbox.startup.exec.sandbox_ms";
    /** The transport time the host adds around one execution. */
    readonly execNetworkMs: "paperclip.sandbox.startup.exec.network_ms";
    /** Whether one execution sits on the startup critical path. */
    readonly execCriticalPath: "paperclip.sandbox.startup.exec.critical_path";
    /** Whether the provider served the sandbox handle from its warm cache. */
    readonly execCacheHit: "paperclip.sandbox.startup.exec.cache_hit";
    /** The root-span wall time of the whole bring-up. */
    readonly rootWallMs: "paperclip.sandbox.startup.root.wall_ms";
    /** The sum of the step wall times of the whole bring-up. */
    readonly rootWorkMs: "paperclip.sandbox.startup.root.work_ms";
    /** The difference between the work sum and the wall time (overlap). */
    readonly rootDiffMs: "paperclip.sandbox.startup.root.diff_ms";
    /** Whether this bring-up is a cold start (no warm handle). */
    readonly coldStart: "paperclip.sandbox.startup.cold_start";
    /** The clamped region label (through `clampSpanLabel`). */
    readonly region: "paperclip.sandbox.startup.region";
    /** The hashed image-id label (through `clampSpanLabel`). */
    readonly imageId: "paperclip.sandbox.startup.image_id";
    /** The hashed sandbox-id label (through `clampSpanLabel`). */
    readonly sandboxId: "paperclip.sandbox.startup.sandbox_id";
    /** The hashed lease-id label (through `clampSpanLabel`). */
    readonly leaseId: "paperclip.sandbox.startup.lease_id";
    /** The create-runtime sub-time of the `acp.handshake` step. */
    readonly handshakeCreateRuntimeWallMs: "paperclip.sandbox.startup.handshake.create_runtime.wall_ms";
    /** The ensure-session sub-time of the `acp.handshake` step. */
    readonly handshakeEnsureSessionWallMs: "paperclip.sandbox.startup.handshake.ensure_session.wall_ms";
    /** A shared low-cardinality tag that marks two steps as one parallel batch. */
    readonly batch: "paperclip.sandbox.startup.batch";
    /** The host-local wall time of the pack step (build the tarball). */
    readonly packWallMs: "paperclip.sandbox.startup.pack.wall_ms";
    /** The wall time of the transfer step (upload the files to the sandbox). */
    readonly transferWallMs: "paperclip.sandbox.startup.transfer.wall_ms";
    /** The number of serial guard round trips before one transfer. */
    readonly transferGuardCount: "paperclip.sandbox.startup.transfer.guard.count";
    /** The transfer direction: `inbound` for an upload to the sandbox, `outbound`
     * for a download from the sandbox. The parent span carries operation identity,
     * so the transfer span never carries an operation label. The value stays in a
     * closed set, so the attribute cardinality is bounded. */
    readonly transferDirection: "paperclip.sandbox.startup.transfer.direction";
};
/** The closed value set for the `outcome` attribute. */
export declare const SANDBOX_STARTUP_OUTCOME: {
    readonly ok: "ok";
    readonly skipped: "skipped";
    readonly failed: "failed";
};
export type SandboxStartupOutcome = (typeof SANDBOX_STARTUP_OUTCOME)[keyof typeof SANDBOX_STARTUP_OUTCOME];
/**
 * Bound a span label value to a closed, low-cardinality set. This is the one
 * boundary function for every free-form label. It is a hard-coded per-label
 * map, the same pattern as `normalizeProviderFamily`:
 *
 * - `command` — a known command basename maps to itself; any other value maps
 *   to `other`, so a full command line, a path, or an argument never leaks.
 * - `region` — a known region maps to itself; any other value maps to
 *   `unknown`.
 * - `image_id` / `sandbox_id` / `lease_id` — the raw value maps to a
 *   non-reversible short hash, because it can hold an internal codename or a
 *   secret-like string, and the telemetry backend may index it.
 *
 * An unknown label name returns `undefined`, so the caller drops it. A missing
 * value for a hashed label returns `undefined` too (fail open — never a raw
 * value, never an empty attribute).
 */
export declare function clampSpanLabel(name: string, value: string | undefined): string | undefined;
/**
 * A minimal, OTel-free span contract. The server injects a real
 * `@opentelemetry/api` span, which satisfies this shape structurally. The
 * default is a no-op span, so a step with no injected tracer changes nothing.
 */
export interface StartupSpan {
    setAttribute(key: string, value: string | number | boolean): void;
    setStatus(status: {
        code: number;
        message?: string;
    }): void;
    end(): void;
}
/**
 * An opaque parent-context token. The server builds it from the OTel
 * `@opentelemetry/api` `context` / `trace` helpers. `adapter-utils` never reads
 * it; it only forwards it to `startSpan`, so this package stays OTel-free. A
 * child span opened with this token parents to the span the token carries.
 */
export type StartupSpanContext = unknown;
/**
 * A minimal, OTel-free tracer contract. The server injects a real
 * `@opentelemetry/api` tracer, which satisfies this shape structurally. The
 * `startSpan` signature is a subset of the OTel one, so a real tracer is
 * assignable here. The optional third argument is the explicit parent context:
 * a real OTel `startSpan(name, options, context)` parents the new span to the
 * span that `context` carries. `adapter-utils` passes it through as an opaque
 * token, so parenting never depends on ambient async-context propagation.
 */
export interface StartupTracer {
    startSpan(name: string, options?: {
        attributes?: Record<string, string | number | boolean>;
    }, context?: StartupSpanContext): StartupSpan;
}
/**
 * The injected tracer plus the one context helper the engine needs to build a
 * parent-context token from the root span. The server binds these to
 * `@opentelemetry/api` (`trace.getTracer`, `trace.setSpan` over
 * `context.active()`). The default is a no-op, so the whole span path stays a
 * no-op until the server injects a real implementation.
 */
export interface StartupTraceContext {
    readonly tracer: StartupTracer;
    /**
     * Return a parent-context token whose active span is `span`. A child span
     * opened with this token parents to `span`. The token is opaque to
     * `adapter-utils`.
     */
    contextWithSpan(span: StartupSpan): StartupSpanContext;
}
/** A shared no-op span. It implements the structural span contract and does
 * nothing, so a caller with no injected tracer changes no behavior. */
export declare const NOOP_STARTUP_SPAN: StartupSpan;
/**
 * The default trace context. Its tracer is a no-op and it produces no parent
 * token, so the engine emits no spans until the server injects a real
 * implementation.
 */
export declare const NOOP_STARTUP_TRACE_CONTEXT: StartupTraceContext;
/**
 * The active step context that `measureStartupStep` publishes while it runs the
 * step body `fn`. Inner code (for example the host→sandbox exec seam) reads it
 * through `getActiveStepContext()` to parent a child span to the step span.
 *
 * - `span` — the open step span. A child span may set its status or read it.
 * - `parentContext` — a parent-context token whose active span is the step span.
 *   A child span opened with this token parents to the step span. It is opaque
 *   to `adapter-utils`; the server builds it through `contextWithSpan`.
 * - `criticalPath` — whether the step sits on the startup critical path. Two
 *   overlapping steps (the parallel bridges) set it `false`; every other step
 *   is `true`.
 */
export interface ActiveStepContext {
    readonly span: StartupSpan;
    readonly parentContext: StartupSpanContext;
    readonly criticalPath: boolean;
}
/**
 * Return the active step context, or `null` when no measured step is running.
 * Inner code parents a child span to the step span through
 * `getActiveStepContext()?.parentContext`. A `null` result is a no-op: the
 * caller opens no child span or opens an unparented span.
 */
export declare function getActiveStepContext(): ActiveStepContext | null;
/**
 * Run `work` with no active step context, then restore the previous store. A
 * bridge boundary uses this to start its long-lived poll timer and socket
 * handlers outside the measured step store.
 *
 * Node snapshots the active store on each async resource at creation time. So a
 * timer or a handler scheduled inside a measured step body keeps that step store
 * after the step span ends. A later run-time exec then reads the ended step and
 * parents its `sandbox.exec` span to a dead startup step, and it copies the
 * step's `criticalPath` flag. This helper resets the store for the wrapped work,
 * so each continuation reads an empty store. Each run-time exec then opens an
 * unparented span with no stale `criticalPath` flag.
 *
 * The helper forwards only the opaque store, so this package stays free of
 * `@opentelemetry/api`. It needs no Node version gate.
 */
export declare function runWithoutActiveStep<T>(work: () => T): T;
/**
 * Run `work` under a given parent-context token, then restore the previous
 * store. A run-time exec that reads `getActiveStepContext()` inside `work`
 * parents its span to `parentContext`, not to a startup step. The store carries
 * the no-op span, because there is no open step span at run time. It sets
 * `criticalPath` to `false`, because a run-time exec is not on the startup
 * critical path.
 *
 * When `parentContext` is `undefined`, the helper empties the store, exactly
 * like `runWithoutActiveStep`. Inner code then reads `null` and opens an
 * unparented span.
 *
 * The helper forwards only the opaque token, so this package stays free of
 * `@opentelemetry/api`.
 */
export declare function runWithRuntimeParent<T>(parentContext: StartupSpanContext, work: () => T): T;
/**
 * Run one run-time operation inside its own wrapper span. The runner opens a
 * wrapper span parented to the current run span, publishes the wrapper span as
 * the runtime parent while `work` runs, and ends the span when `work` settles.
 * A child `sandbox.exec` span inside `work` parents to the wrapper span, so the
 * trace groups the operation's execs under one named span. A throwing `work`
 * sets the wrapper span error status before the span ends.
 *
 * The runner reads the run parent per call, so it always parents to the live
 * span (`agent.turn` during the turn, `task.run` otherwise). The default runner
 * opens no real span; it only runs `work` under the current run parent, so the
 * span path stays a no-op until the server injects a real tracer.
 */
export type RuntimeSpanRunner = <T>(name: string, work: () => Promise<T>) => Promise<T>;
/**
 * Build a {@link RuntimeSpanRunner} from a trace context and the run-parent
 * getter. The runner opens the wrapper span through `traceContext.tracer`, and
 * it derives the wrapper span's child parent token through
 * `traceContext.contextWithSpan`. A no-op trace context yields a runner that
 * opens no real span and runs `work` under the current run parent, so the span
 * path stays inert until the server injects a real tracer. Every tracer call
 * sits inside an error swallow, so a throwing tracer never changes control flow.
 */
export declare function createRuntimeSpanRunner(traceContext: StartupTraceContext, getRuntimeParentContext: () => StartupSpanContext | undefined): RuntimeSpanRunner;
/**
 * Optional per-step attribution for a `run.startup.step` event and its span.
 * The event payload carries only the high-level fields (`step`, `durationMs`,
 * `outcome`). The detailed per-step round-trip and provider-duration numbers
 * ride the OTel spans (the per-execution `sandbox.exec` child spans and the
 * step span), not the payload. These options configure the span path and the
 * step context.
 *
 * - `tracer` — an injected structural tracer. It defaults to a no-op, so the
 *   span path changes no runtime behavior until the server injects a real
 *   tracer. The span carries only the closed attribute allowlist from
 *   `SANDBOX_STARTUP_SPAN_ATTRS`: the normalized `provider`, the step wall time,
 *   and the outcome. The step name rides the span name, not an attribute. The
 *   round-trip and provider-duration detail rides the per-execution
 *   `sandbox.exec` child spans.
 * - `parentContext` — an opaque parent-context token from the root span. When
 *   set, the step's span parents to that root. `measureStartupStep` forwards it
 *   to `startSpan` and never inspects it, so parenting stays explicit and does
 *   not depend on ambient async-context propagation.
 * - `provider` — the raw provider key for the step. `measureStartupStep`
 *   normalizes it through `normalizeProviderFamily` before it sets the
 *   low-cardinality `provider` span attribute. It never sets the raw key.
 */
export interface StartupStepMeasureOptions {
    tracer?: StartupTracer;
    parentContext?: StartupSpanContext;
    provider?: string;
    /**
     * Build a parent-context token whose active span is a given span. The server
     * binds it to `@opentelemetry/api`. `measureStartupStep` uses it once, after
     * it opens the step span, to publish the step's child context on the active
     * step context. Inner code reads that context to parent an exec span to the
     * step span. When absent, the active step context carries no parent token, so
     * an inner exec span opens unparented (a no-op when tracing is off).
     */
    contextWithSpan?: (span: StartupSpan) => StartupSpanContext;
    /**
     * Whether the step sits on the startup critical path. It rides the active
     * step context, so an inner exec span records it. Two overlapping steps (the
     * parallel bridges) pass `false`; every other step defaults to `true`.
     */
    criticalPath?: boolean;
    /**
     * Report the step wall time (float ms) once the step settles. The executor
     * accumulates it into the root-span work sum. A throwing reporter never
     * changes startup control flow.
     */
    onWallMs?: (wallMs: number) => void;
    /**
     * A shared low-cardinality batch tag. Two steps that run in parallel (the
     * bridges) pass the same value, so the trace marks them as one batch. It
     * rides the span as the closed `…batch` attribute. Pass only a fixed literal,
     * never run or user data.
     */
    batch?: string;
    /**
     * Named wall-time sub-splits (float ms) that ride the step span as fixed,
     * closed attribute keys. Only `acp.handshake` uses it today, for the
     * create-runtime and ensure-session sub-times. The helper maps each value to
     * a hard-coded attribute key, so a free-form key can never widen the closed
     * span allowlist. A non-finite value sets no attribute.
     */
    spanWallTimes?: () => Partial<Record<"createRuntime" | "ensureSession", number>>;
}
/**
 * Time `fn` with the injected `now` clock and emit exactly one
 * `run.startup.step` event carrying only the high-level `{ step, durationMs,
 * outcome }`. The event fires in a `finally`, so a throwing step
 * still reports its duration before the error is re-thrown. `now` is injected
 * (never `Date.now()` here) so callers/tests stay deterministic, and
 * `ctx.onEvent` is optional — a missing sink is a no-op that neither throws nor
 * swallows `fn`'s return value or error. A step skipped by a warm cache never
 * calls this helper, so it emits no event (never a zero).
 *
 * When `options.tracer` is injected, the helper also opens one span at `start`
 * and ends it in the `finally`. The span carries a closed attribute allowlist
 * from `SANDBOX_STARTUP_SPAN_ATTRS`: the normalized `provider`, the step wall
 * time, and the outcome (`ok` or `failed`). The step name rides the span name.
 * A throwing `fn` sets the span error status before the span ends and the
 * outcome is `failed`. The round-trip and provider-duration detail rides the
 * spans, not the payload. The tracer
 * defaults to a no-op, so a caller with no tracer changes nothing. Every span
 * call sits inside the same error swallow as the event sink, so a throwing
 * tracer never changes startup control flow.
 */
export declare function measureStartupStep<T>(ctx: Pick<AdapterExecutionContext, "onEvent">, now: () => number, step: string, fn: () => Promise<T>, options?: StartupStepMeasureOptions): Promise<T>;
/**
 * The two root-span timing numbers. `wallMs` is the root span's own wall time.
 * `workMs` is the sum of the step wall times. The difference (`workMs − wallMs`)
 * is the overlap the parallel steps saved.
 */
export interface SandboxRootSpanTimings {
    wallMs: number;
    workMs: number;
}
/**
 * The low-cardinality root-span context. Each field is optional and omitted
 * when absent (fail open — never an invented value). The helper below bounds
 * each value: `provider` through `normalizeProviderFamily`, `region` through a
 * small allowlist, and each id or image through a non-reversible hash.
 */
export interface SandboxRootSpanContext {
    coldStart?: boolean;
    provider?: string;
    region?: string;
    imageId?: string;
    sandboxId?: string;
    leaseId?: string;
}
/**
 * Assemble every root-span (`sandbox.startup`) attribute in one place. This is
 * the single producer-side boundary for the root span: it sets only the closed
 * `paperclip.sandbox.startup.` allowlist. It records the wall, work, and diff
 * times, and the bounded context. A raw id, an image reference, or a region
 * never rides the span un-bounded, and an absent value sets no attribute.
 */
export declare function setSandboxRootSpanAttributes(span: StartupSpan, timings: SandboxRootSpanTimings, context: SandboxRootSpanContext): void;
/** The options a skipped step reuses from a measured step: the tracer, the root
 * parent-context token, and the raw provider key. */
export type SkippedStartupStepOptions = Pick<StartupStepMeasureOptions, "tracer" | "parentContext" | "provider">;
/**
 * Emit one `run.startup.step` span and event for a step that a warm cache
 * skips, with `outcome = skipped` and a zero wall time. A skipped step runs no
 * work, so this helper opens and ends the span without a body. It shows the
 * skip as a real, distinct outcome, never a misleading zero-work `ok` step.
 *
 * The span and the event carry the closed allowlist: the step name (the span
 * name), the normalized `provider` (when given), `step.wall_ms = 0`, and
 * `outcome = skipped`. Every tracer and sink call sits inside an error swallow,
 * so a throwing tracer or sink never changes startup control flow. The tracer
 * defaults to a no-op, so a caller with no tracer only emits the event.
 */
export declare function emitSkippedStartupStep(ctx: Pick<AdapterExecutionContext, "onEvent">, step: string, options?: SkippedStartupStepOptions): Promise<void>;
/**
 * Structured event emitted once per named run-lifecycle phase, so the duration
 * and the outcome of each phase land in the run-events stream. It is a
 * run-log event and rides the existing `ctx.onEvent` bridge. It never changes
 * startup control flow. The payload is a closed shape: exactly `phase`,
 * `durationMs`, and `outcome`. The phase name is from a closed allowlist, so
 * the event never carries a command, an argument, a path, an environment
 * value, or a raw identifier.
 */
export declare const RUN_PHASE_TIMING_EVENT_TYPE = "run.phase.timing";
/**
 * The closed set of run-lifecycle phase names. A phase-timing event may name only
 * one of these. The list is fixed and low-cardinality; it never derives from run
 * or user data.
 */
export declare const RUN_PHASE_NAMES: readonly ["place_workspace", "start_transport", "create_runtime", "ensure_session", "configure_session", "prepare_turn", "turn", "end_session", "settle_reuse", "stop_transport", "sync_back", "release_staging_lease"];
/** One run-lifecycle phase name from the closed allowlist. */
export type RunPhaseName = (typeof RUN_PHASE_NAMES)[number];
/** The closed outcome set for a phase-timing event. */
export type RunPhaseOutcome = "ok" | "failed";
/**
 * Emit exactly one `run.phase.timing` event for a run-lifecycle phase. The
 * payload carries only `phase`, `durationMs`, and `outcome`. It never carries a
 * command, an argument, a path, an environment value, or a raw identifier. The
 * phase name must be one member of the closed allowlist; a name outside the
 * allowlist emits nothing, so a free-form label can never reach the stream. A
 * negative or a non-finite duration clamps to 0. Every sink call sits inside an
 * error swallow, so a throwing telemetry sink never fails the run.
 */
export declare function emitRunPhaseTiming(ctx: Pick<AdapterExecutionContext, "onEvent">, phase: string, durationMs: number, outcome: RunPhaseOutcome): Promise<void>;
//# sourceMappingURL=startup-timing.d.ts.map