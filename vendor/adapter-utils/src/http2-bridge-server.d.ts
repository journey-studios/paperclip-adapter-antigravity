/**
 * Host HTTP/2 server for the sandbox callback bridge transport.
 *
 * The server wraps one {@link CommandManagedDuplexChannel} as a Node `Duplex`
 * and runs one plaintext HTTP/2 session on it. It maps every stream on that
 * session to one call of the caller-supplied `forwardRequest` handler, then
 * writes the result back as the stream response. The handler applies the real
 * host token and the run attribution, so those rules stay in one place, next
 * to the existing file-bridge and duplex-bridge forward path.
 *
 * This file does not select the transport for a run. It builds and tests the
 * host half of the pair in isolation; a later phase wires the pair into the
 * transport-selection path.
 *
 * Requests flow from the sandbox to the host only: the host never opens a
 * stream to the sandbox. The server enforces three checks, in this order, for
 * every stream:
 *   1. a constant-time compare of the bridge token against the per-run token
 *      (accepted security fix 4), before any other processing;
 *   2. one canonical parse of the `:path` pseudo-header (accepted security fix
 *      3), whose result feeds both the route allowlist and the forward URL;
 *   3. the route allowlist and the header allowlist, reused unchanged from
 *      `sandbox-callback-bridge.ts`.
 * The server also bounds ten `http2.createServer` options (accepted security
 * fix 1), so Node enforces the session, header, and stream-reset limits on
 * every connection with no new component.
 */
import { Duplex } from "node:stream";
import http2 from "node:http2";
import type { CommandManagedDuplexChannel } from "./command-managed-runtime.js";
import { type SandboxCallbackBridgeRouteRule } from "./sandbox-callback-bridge.js";
/** Server push. The transport never needs it. */
export declare const HTTP2_BRIDGE_ENABLE_PUSH = false;
/**
 * Open streams. The host keeps one forward, its request body, and its
 * response body alive for the life of a stream, and — before this file binds
 * each forward to its own stream's abort signal — a forward can outlive its
 * stream's own HTTP/2 slot until the forward's own timeout runs out. The
 * forward path carries a request body and a response body as raw `Buffer`
 * values with no string copy. Counting every retained `Buffer` copy of one
 * stream's request and response body against the
 * {@link DEFAULT_SANDBOX_CALLBACK_BRIDGE_MAX_BODY_BYTES} body limit
 * (`sandbox-callback-bridge.ts`) gives an accounting peak of four times that
 * limit for one live forward. This bound is the per-route in-flight-body
 * budget: `HTTP2_BRIDGE_MAX_CONCURRENT_STREAMS * 4 *
 * DEFAULT_SANDBOX_CALLBACK_BRIDGE_MAX_BODY_BYTES` bytes = 4 * 4 * 10,551,296
 * bytes = 168,820,736 bytes (161 MiB) for one route. {@link
 * HTTP2_BRIDGE_MAX_ROUTE_BODY_BYTES} enforces this figure as a real, live
 * cap on every reservation, so one busy route cannot pass it, no matter how
 * much of the process-wide ceiling below still sits free.
 *
 * Aggregate behavior: the host process admits up to
 * `DEFAULT_MAX_CONCURRENT_DUPLEX_ROUTES` (128, in `plugin-worker-manager.ts`)
 * routes at the same time. The aggregate across every route is bounded too:
 * every stream's {@link BridgeBodyReservation} owner also reserves against
 * the shared {@link HTTP2_BRIDGE_MAX_PROCESS_BODY_BYTES} total
 * (1,073,741,824 bytes, 1 GiB), so the process retains no more than that
 * many live body bytes no matter how many routes or streams run at once. One
 * full-size stream's four retained copies cost `4 * 10,551,296` =
 * 42,205,184 bytes of that total, so the process admits at least 25
 * concurrent full-size streams, spread across at least six routes each at
 * their own per-route ceiling, before it starts denying the rest with a 503
 * response.
 */
export declare const HTTP2_BRIDGE_MAX_CONCURRENT_STREAMS = 4;
/** One decompressed header list. The Node default is 65535. */
export declare const HTTP2_BRIDGE_MAX_HEADER_LIST_SIZE = 16384;
/** The header-compression table. This keeps the Node default. */
export declare const HTTP2_BRIDGE_HEADER_TABLE_SIZE = 4096;
/** Session memory in mebibytes. The Node default is 10. */
export declare const HTTP2_BRIDGE_MAX_SESSION_MEMORY = 16;
/** Header pairs per request. This names the Node default. */
export declare const HTTP2_BRIDGE_MAX_HEADER_LIST_PAIRS = 128;
/** The outbound compression table. */
export declare const HTTP2_BRIDGE_MAX_DEFLATE_DYNAMIC_TABLE_SIZE = 4096;
/** Invalid frames before Node closes the session. */
export declare const HTTP2_BRIDGE_MAX_SESSION_INVALID_FRAMES = 100;
/** Rejected streams before Node closes the session. */
export declare const HTTP2_BRIDGE_MAX_SESSION_REJECTED_STREAMS = 100;
/** The stream-reset budget (frames per interval). Node sends GOAWAY past the budget. */
export declare const HTTP2_BRIDGE_STREAM_RESET_RATE = 10;
/** The stream-reset budget (burst allowance). Node sends GOAWAY past the budget. */
export declare const HTTP2_BRIDGE_STREAM_RESET_BURST = 100;
/**
 * The full bounded options object. The server passes this object, unchanged,
 * to `http2.createServer`. A test asserts every value on this object, so it
 * proves the running server actually carries the bound, not only that the
 * named constant exists.
 */
export declare const HTTP2_BRIDGE_SERVER_OPTIONS: http2.ServerOptions;
/**
 * The most process memory, in bytes, this file lets every route hold in live
 * request and response body buffers at the same time. Every
 * {@link BridgeBodyReservation} owner reserves against this one shared
 * total, so no combination of concurrent streams, across every route, can
 * retain more than this many bytes at once. This value keeps the accepted
 * process ceiling at 1,073,741,824 bytes (1 GiB) — the same ceiling
 * `doc/observability.md` already accepted before the per-body limit rose to
 * 10 MiB — now enforced by this reservation instead of left as an unenforced
 * document note. See the per-route budget comment above for the full
 * accounting.
 */
export declare const HTTP2_BRIDGE_MAX_PROCESS_BODY_BYTES: number;
/**
 * The most memory, in bytes, one route (one {@link createHttp2BridgeServer}
 * call, one sandbox run's bridge session) may hold in live request and
 * response body buffers at the same time, on top of the shared process-wide
 * ceiling above. This is the same per-route figure the budget comment above
 * already derives from stream concurrency: naming it here and checking it on
 * every reservation stops one busy route from spending the whole
 * process-wide ceiling and denying every sibling route admission. See that
 * comment for the full accounting.
 */
export declare const HTTP2_BRIDGE_MAX_ROUTE_BODY_BYTES: number;
/**
 * One route's own running total, in bytes, against
 * {@link HTTP2_BRIDGE_MAX_ROUTE_BODY_BYTES}. `createHttp2BridgeServer`
 * creates exactly one ledger per route and every stream that route ever
 * handles reserves against it, so one route's own activity can never pass
 * its own ceiling, regardless of how much of the process-wide total remains
 * free for other routes.
 */
export interface BridgeRouteBodyLedger {
    /**
     * Reserve `byteCount` more bytes against this route's own ceiling. Returns
     * `false`, and reserves nothing, when the new route total would pass
     * {@link HTTP2_BRIDGE_MAX_ROUTE_BODY_BYTES}.
     */
    reserve(byteCount: number): boolean;
    /** Release `byteCount` bytes this route previously reserved. */
    release(byteCount: number): void;
    /** The bytes this route currently holds. */
    readonly reservedBytes: number;
}
/** Create one fresh {@link BridgeRouteBodyLedger}, holding zero bytes. One
 * `createHttp2BridgeServer` call creates exactly one, before its first
 * stream, and every stream that route ever handles shares it. */
export declare function createBridgeRouteBodyLedger(): BridgeRouteBodyLedger;
/**
 * One HTTP/2 stream's reservation owner. `handleStream` creates exactly one
 * owner per stream and releases it in its existing `finally` block, so every
 * live request or response body buffer that stream produces reserves
 * against the same owner, and the process reclaims those bytes exactly one
 * time when the stream ends.
 */
export interface BridgeBodyReservation {
    /**
     * Reserve `byteCount` more bytes against the process-wide total, and
     * against this owner's route ledger when it has one. Returns `false` and
     * reserves nothing against either total when either check fails. A failed
     * reservation allocates nothing: the caller must not copy the bytes it
     * asked to reserve.
     */
    reserve(byteCount: number): boolean;
    /**
     * Release every byte this owner currently holds. Safe to call more than
     * one time: a second call releases nothing.
     */
    release(): void;
    /** The bytes this owner currently holds. */
    readonly heldBytes: number;
}
/**
 * Create one fresh {@link BridgeBodyReservation} owner, holding zero bytes.
 * A caller that passes `routeLedger` also checks and reserves against that
 * route's own ceiling on every call, isolating this owner's route from every
 * other route sharing the process-wide total. A caller with no route to
 * isolate (a test filling only the process-wide total, for example) omits
 * it, and this owner checks the process-wide ceiling alone.
 */
export declare function createBridgeBodyReservation(routeLedger?: BridgeRouteBodyLedger): BridgeBodyReservation;
/**
 * A reservation owner denied a request or response body copy because the
 * process-wide ceiling would otherwise be passed. The stream handler answers
 * 503 for this error, not 413: a 413 tells a caller its own body is too
 * large; a 503 tells a caller the host is busy and to retry later.
 */
export declare class BridgeProcessCapacityError extends Error {
    constructor();
}
/**
 * Test-only. Reset the process-wide reservation total to zero. A test file
 * that exercises {@link createBridgeBodyReservation} must call this between
 * tests, so a reservation one test left unreleased cannot lower the ceiling
 * for a later test.
 */
export declare function resetBridgeBodyReservationsForTest(): void;
/** Test-only. Read the current process-wide reservation total. */
export declare function getBridgeBodyReservedBytesForTest(): number;
/** The default cap, in bytes, on the read-side queue {@link wrapDuplexChannelAsNodeDuplex}
 * holds once `Duplex.push()` reports the readable side is full (a `false`
 * return). A sandbox-controlled channel has no upstream pause: `onData` below
 * keeps delivering bytes whether or not the HTTP/2 session keeps up with
 * them. Past this cap the wrapper treats the channel as stuck, not merely
 * slow, and fails closed: it stops the channel and destroys the `Duplex`, so
 * a producer that keeps outpacing its reader cannot grow host memory without
 * bound. This cap also bounds one single chunk: the wrapper checks a chunk's
 * own size against it before `push()` ever runs, so one oversized chunk
 * cannot cross the cap on its first delivery, before the queue holds
 * anything to compare it against. This is a fixed share of the fixed
 * per-route byte budget the host bounds every duplex retention site
 * against; it no longer derives from {@link HTTP2_BRIDGE_MAX_SESSION_MEMORY},
 * which bounds the underlying `Http2Session`'s own memory, not this
 * read-side queue. */
export declare const DEFAULT_HTTP2_BRIDGE_MAX_BUFFERED_READ_BYTES = 524288;
/** The default bound, in milliseconds, on how long the read-side queue
 * {@link wrapDuplexChannelAsNodeDuplex} holds can stay non-empty with no
 * chunk draining from it. The byte cap above bounds how much memory a stuck
 * reader can hold; it does not bound how long the reader can stay stuck. A
 * consumer that never resumes reading would otherwise hold the channel open,
 * backpressured, for as long as the queue stays under the byte cap. Each
 * drained chunk renews this bound, so a consumer that keeps making real
 * progress never trips it; only a consumer that stops resuming entirely
 * does. */
export declare const DEFAULT_HTTP2_BRIDGE_READ_BACKPRESSURE_STALL_MS = 30000;
/**
 * Wrap a {@link CommandManagedDuplexChannel} as a Node `Duplex`, so an
 * `Http2Server` can run one session directly on it (`server.emit("connection",
 * duplex)`). The wrapper never buffers more than one write in flight: it calls
 * the stream write callback only after the channel's own write call settles
 * (the backpressure constraint), never as a delivery signal. The provider
 * accepts many megabytes in milliseconds and holds them in its own buffer, so
 * this direction stays governed by the channel's own write-settle timing.
 *
 * The read direction needs its own bound. The channel exposes no pause: once
 * `onData` below is registered, the channel keeps calling it for every byte
 * the sandbox sends, with no way for this wrapper to slow it down. Node's
 * `Duplex.push()` reports back-pressure through its boolean return, not by
 * refusing the call, so a caller that ignores a `false` return and keeps
 * pushing grows the readable side's internal buffer with no limit. This
 * wrapper honors that signal instead: while `push()` reports room, it pushes
 * directly; once `push()` reports the readable side is full, it queues each
 * later chunk instead of pushing past that signal, and drains the queue from
 * `read()`, which Node calls again only once the consumer wants more. Every
 * chunk, on either path, first checks against
 * {@link DEFAULT_HTTP2_BRIDGE_MAX_BUFFERED_READ_BYTES} (or the caller's
 * `maxBufferedReadBytes`) on its own size, and the queue checks against the
 * same cap on its cumulative size: past either check the wrapper fails
 * closed instead of buffering further, because the channel has no pause to
 * fall back on. A second, independent bound —
 * {@link DEFAULT_HTTP2_BRIDGE_READ_BACKPRESSURE_STALL_MS} (or the caller's
 * `readBackpressureStallMs`) — covers the case the byte cap does not: a
 * consumer that stops reading entirely, so the queue never grows past the
 * byte cap but also never drains. This bound renews on every chunk the
 * queue drains, so a consumer that keeps making real progress never trips
 * it.
 */
export declare function wrapDuplexChannelAsNodeDuplex(channel: CommandManagedDuplexChannel, options?: {
    maxBufferedReadBytes?: number;
    readBackpressureStallMs?: number;
}): Duplex;
/** The reason {@link parseCanonicalBridgeRequestPath} rejected one request. */
export type CanonicalBridgeRequestPathRejection = "missing_path" | "duplicate_pseudo_header" | "non_origin_form" | "encoded_slash" | "backslash" | "nul_byte" | "dot_segment";
/** The one parsed pathname and query. Both the route allowlist and the forward
 * URL builder read this same value; the host never parses `:path` twice. */
export interface CanonicalBridgeRequestPath {
    pathname: string;
    /** The query string, in `URL.search` form: empty, or a leading `?`. */
    query: string;
}
export type CanonicalBridgeRequestPathResult = {
    ok: true;
    value: CanonicalBridgeRequestPath;
} | {
    ok: false;
    reason: CanonicalBridgeRequestPathRejection;
};
/**
 * Parse the `:path` pseudo-header exactly one time. The caller passes the
 * returned pathname and query to both the route allowlist and the forward URL
 * builder — never a second, independent parse of the raw header.
 *
 * The parser rejects a request that carries any of: a duplicate pseudo-header,
 * a missing or empty `:path`, a non-origin-form path, an encoded slash, a
 * backslash, a NUL byte, or a dot segment (checked before URL normalization
 * would silently remove it, and after percent-decoding each segment, so an
 * encoded dot segment cannot slip through).
 */
export declare function parseCanonicalBridgeRequestPath(headers: http2.IncomingHttpHeaders): CanonicalBridgeRequestPathResult;
/**
 * Build the forward URL from the one canonical parse. This mirrors
 * `buildBridgeForwardUrl` in `execution-target.ts`, which the file bridge and
 * the duplex bridge use today; a later phase wires the HTTP/2 host handler to
 * that same forward path and can consolidate the two into one export.
 */
export declare function buildHttp2BridgeForwardUrl(baseUrl: string, request: CanonicalBridgeRequestPath): URL;
/** The default interval between two liveness PING frames, in milliseconds. */
export declare const DEFAULT_HTTP2_BRIDGE_PING_INTERVAL_MS = 5000;
/** The default bound a sent PING waits for its ack before the session counts as stalled. */
export declare const DEFAULT_HTTP2_BRIDGE_PING_STALL_MS = 20000;
/** The default idle bound on a request body read: the maximum gap between
 * two received chunks (or between the token check and the first chunk)
 * before the server treats the stream as stalled. Each received chunk resets
 * this bound, so a slow peer that keeps making real progress completes; only
 * a peer that stops sending trips it. */
export declare const DEFAULT_HTTP2_BRIDGE_REQUEST_BODY_TIMEOUT_MS = 30000;
/** The default hard ceiling on a request body read's total lifetime: an
 * absolute bound armed once, at the start of the read, and never renewed by
 * later progress. This bound is independent of
 * {@link DEFAULT_HTTP2_BRIDGE_REQUEST_BODY_TIMEOUT_MS}: the idle bound
 * resets on every chunk to catch a peer that stops sending; this ceiling
 * catches a peer that never stops sending but also never finishes, so a
 * peer cannot use a steady trickle of small chunks to hold a
 * {@link HTTP2_BRIDGE_MAX_CONCURRENT_STREAMS} stream slot open forever. Set
 * well above {@link DEFAULT_HTTP2_BRIDGE_REQUEST_BODY_TIMEOUT_MS} so a
 * legitimate upload that makes real but slow progress — a chunk every few
 * seconds, well inside the idle bound — still has room to finish. */
export declare const DEFAULT_HTTP2_BRIDGE_REQUEST_BODY_LIFETIME_CEILING_MS = 480000;
/** The default bound {@link Http2BridgeServerHandle.close} waits for an
 * active session to close on its own before it force-destroys the session. A
 * session that carries a stalled stream would otherwise hold `close()` open
 * forever, because `session.close()` waits for every open stream to end. */
export declare const DEFAULT_HTTP2_BRIDGE_CLOSE_GRACE_MS = 5000;
/** The default bound the capacity-denial (503) response path waits for its
 * queued write to settle before it force-destroys the stream. A normal,
 * draining peer settles well inside this bound, so it still receives the
 * full 503 body. A stalled peer that never grants the flow-control credit
 * the write needs would otherwise hold this stream's reservation and
 * {@link HTTP2_BRIDGE_MAX_CONCURRENT_STREAMS} slot open forever. */
export declare const DEFAULT_HTTP2_BRIDGE_CAPACITY_DENIAL_SETTLE_DEADLINE_MS = 5000;
/** The default bound the completed-response (normal, non-denial) write path
 * waits for its queued write to settle before it force-destroys the stream.
 * A normal, draining peer settles well inside this bound. A stalled peer
 * that grants no flow-control credit would otherwise hold this stream's
 * reservation and {@link HTTP2_BRIDGE_MAX_CONCURRENT_STREAMS} slot open
 * forever — the same failure mode the capacity-denial path already guards
 * against. Set above {@link DEFAULT_HTTP2_BRIDGE_CAPACITY_DENIAL_SETTLE_DEADLINE_MS}
 * because a completed response can carry a full-size body (up to the
 * configured body-byte ceiling), not just a small JSON error payload, so a
 * slow-but-genuine peer needs more room to drain it. */
export declare const DEFAULT_HTTP2_BRIDGE_RESPONSE_WRITE_SETTLE_DEADLINE_MS = 30000;
/** The result of one forward call. The server turns it into one stream response. */
export interface Http2BridgeForwardResult {
    status: number;
    headers?: Record<string, string>;
    body?: Buffer;
}
/**
 * The one canonically-parsed, route-authorized, header-sanitized request the
 * server hands to the forward handler.
 */
export interface Http2BridgeForwardRequest {
    method: string;
    pathname: string;
    query: string;
    headers: Record<string, string>;
    body: Buffer;
    /**
     * The abort signal for this one HTTP/2 stream. `handleStream` aborts it
     * when the stream closes, aborts, or errors, so a caller that passes it
     * through to its own outbound call (a `fetch`, for example) ends that call
     * at once instead of leaving it to run until its own timeout. The signal
     * never fires for any other stream or for the session.
     */
    signal: AbortSignal;
    /**
     * This stream's one {@link BridgeBodyReservation} owner. A forward handler
     * that itself retains a full response body buffer — `execution-target.ts`
     * does, through `forwardBridgeRequest`'s optional `reservation` option —
     * reserves against this same owner, so the request body and the response
     * body of one stream share one ceiling. `handleStream` releases this owner
     * exactly one time, after the forward call settles; the forward handler
     * must never release it.
     */
    reservation: BridgeBodyReservation;
}
export type Http2BridgeForwardHandler = (request: Http2BridgeForwardRequest) => Promise<Http2BridgeForwardResult>;
/** The GOAWAY the server observed, naming the last stream ID the peer processed. */
export interface Http2BridgeGoawayRecord {
    lastStreamId: number;
    errorCode: number;
}
/** Classify one stream ID against an observed GOAWAY's last processed stream ID. */
export declare function classifyStreamAgainstGoaway(streamId: number, lastStreamId: number): "accepted" | "not_accepted";
export interface CreateHttp2BridgeServerOptions {
    /** The per-run bridge token. The server compares it, constant-time, against
     * the token on every stream before route or header processing. */
    bridgeToken: string;
    /** The forward handler the server calls for each authorized request. */
    forwardRequest: Http2BridgeForwardHandler;
    /** The route allowlist. The default is {@link DEFAULT_SANDBOX_CALLBACK_BRIDGE_ROUTE_ALLOWLIST}. */
    routes?: readonly SandboxCallbackBridgeRouteRule[];
    /** The header allowlist. The default is {@link DEFAULT_SANDBOX_CALLBACK_BRIDGE_HEADER_ALLOWLIST}. */
    headerAllowlist?: readonly string[];
    /** The maximum request body size, in bytes. The default is {@link DEFAULT_SANDBOX_CALLBACK_BRIDGE_MAX_BODY_BYTES}. */
    maxBodyBytes?: number;
    /** The interval between two liveness PING frames, in milliseconds. */
    pingIntervalMs?: number;
    /** The bound a sent PING waits for its ack before the server closes the session. */
    pingStallMs?: number;
    /** The idle bound on a request body read: the maximum gap between two
     * received chunks. The default is
     * {@link DEFAULT_HTTP2_BRIDGE_REQUEST_BODY_TIMEOUT_MS}. */
    requestBodyTimeoutMs?: number;
    /** The hard ceiling on a request body read's total lifetime, armed once
     * and never renewed by progress. See
     * {@link DEFAULT_HTTP2_BRIDGE_REQUEST_BODY_LIFETIME_CEILING_MS} for the
     * default and the reasoning behind it. */
    requestBodyLifetimeCeilingMs?: number;
    /** The bound {@link Http2BridgeServerHandle.close} waits for an active
     * session to close on its own before it force-destroys the session. The
     * default is {@link DEFAULT_HTTP2_BRIDGE_CLOSE_GRACE_MS}. */
    closeGraceMs?: number;
    /** The bound the capacity-denial (503) response path waits for its queued
     * write to settle before it force-destroys the stream. The default is
     * {@link DEFAULT_HTTP2_BRIDGE_CAPACITY_DENIAL_SETTLE_DEADLINE_MS}. */
    capacityDenialSettleDeadlineMs?: number;
    /** The bound the completed-response (normal) write path waits for its
     * queued write to settle before it force-destroys the stalled stream. The
     * default is {@link DEFAULT_HTTP2_BRIDGE_RESPONSE_WRITE_SETTLE_DEADLINE_MS}. */
    responseWriteSettleDeadlineMs?: number;
    /** The cap, in bytes, on data this server holds once a bound `Duplex`
     * reports its readable side is full (`push()` returns `false`). Past this
     * cap the server treats the channel as stuck, not merely slow: see
     * {@link wrapDuplexChannelAsNodeDuplex}. The default is
     * {@link DEFAULT_HTTP2_BRIDGE_MAX_BUFFERED_READ_BYTES}. */
    maxBufferedReadBytes?: number;
    /** The bound, in milliseconds, on how long the read backpressure queue
     * {@link wrapDuplexChannelAsNodeDuplex} holds can stay non-empty with no
     * chunk draining from it. The default is
     * {@link DEFAULT_HTTP2_BRIDGE_READ_BACKPRESSURE_STALL_MS}. */
    readBackpressureStallMs?: number;
    /** The sink for a GOAWAY the server observed on a session (one the sandbox
     * side sent to the host). */
    onGoaway?: (record: Http2BridgeGoawayRecord) => void;
    /** The sink for a session-level fault (a stall, a protocol fault). */
    onSessionError?: (error: Error) => void;
    /**
     * Fires once for each new session. A caller uses the live
     * `ServerHttp2Session` to send its own GOAWAY (accepted security fix's
     * GOAWAY-classification behavior is meaningful only from the side that
     * names the last stream it processed — the host, since every stream
     * originates from the sandbox). A test uses this hook to drive the
     * GOAWAY test deterministically.
     */
    onSession?: (session: http2.ServerHttp2Session) => void;
}
/** The handle {@link createHttp2BridgeServer} returns. */
export interface Http2BridgeServerHandle {
    /** The underlying `Http2Server`. It is never `listen()`-ed; every session
     * binds through {@link Http2BridgeServerHandle.bindChannel}. */
    readonly server: http2.Http2Server;
    /** Wrap the channel as a `Duplex` and run one HTTP/2 session on it. Returns
     * the wrapped `Duplex`, so a caller can also drive it directly (a test uses
     * this to bind one side of a paired in-memory `Duplex`). */
    bindChannel(channel: CommandManagedDuplexChannel): Duplex;
    /** Close every active session. Safe to call more than one time. */
    close(): Promise<void>;
}
/** The size and time bounds a request body read enforces. */
export interface Http2BridgeBodyBounds {
    /** The maximum request body size, in bytes. */
    maxBodyBytes: number;
    /** The idle bound: see {@link DEFAULT_HTTP2_BRIDGE_REQUEST_BODY_TIMEOUT_MS}. */
    idleTimeoutMs: number;
    /** The lifetime ceiling: see {@link DEFAULT_HTTP2_BRIDGE_REQUEST_BODY_LIFETIME_CEILING_MS}. */
    lifetimeCeilingMs: number;
}
/**
 * Create the host HTTP/2 bridge server. The server runs no listener of its
 * own: a caller wraps one duplex channel through {@link Http2BridgeServerHandle.bindChannel}
 * per sandbox session.
 */
export declare function createHttp2BridgeServer(options: CreateHttp2BridgeServerOptions): Http2BridgeServerHandle;
//# sourceMappingURL=http2-bridge-server.d.ts.map