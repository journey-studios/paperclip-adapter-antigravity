/**
 * Versioned frame codec for the sandbox duplex channel.
 *
 * The channel carries newline-delimited JSON frames. One frame is one line. The
 * host and the generated gateway each hold a copy of this codec. A shared
 * fixture file (`duplex-frame-vectors.json`) proves the two copies stay wire
 * compatible: both copies decode the same bytes to the same frames.
 *
 * The decoder never throws on the read path. A malformed or version-mismatch
 * frame becomes a protocol-error result, not an exception. This keeps one bad
 * frame from crashing the read loop.
 *
 * The `http2_v1` host readiness gate imports {@link decodeDuplexLine} from this
 * file to read the one READY line every gateway sends. That is the only frame
 * this module's decode side still reads in production; the gateway itself
 * never decodes, it only writes one READY line with {@link encodeDuplexFrame}.
 */
/** The wire version this codec reads and writes. */
export declare const DUPLEX_FRAME_VERSION = 2;
/**
 * The default maximum size of one frame, in bytes. The decoder rejects a longer
 * frame with a `frame_too_large` protocol error. The value matches the per-chunk
 * byte bound of the host duplex route, and the host body limit for one HTTP/2
 * bridge stream ({@link DEFAULT_SANDBOX_CALLBACK_BRIDGE_MAX_BODY_BYTES} in
 * `sandbox-callback-bridge.ts`).
 */
export declare const DEFAULT_MAX_DUPLEX_FRAME_BYTES = 262144;
/**
 * The READY control frame. The gateway sends it one time after it binds the
 * host-assigned listener port. READY is a liveness signal, not an address
 * source. The frame carries exactly the frame version and the `nonce` string.
 * The gateway echoes the nonce the host passed through the launch environment,
 * so the host correlates the READY frame with this channel open. The frame
 * carries no address data; the host builds the endpoint from its own stored
 * port, never from the channel.
 */
export interface DuplexReadyFrame {
    version: number;
    type: "ready";
    nonce: string;
}
/** The heartbeat control frame. Each side sends it on an interval to prove liveness. */
export interface DuplexHeartbeatFrame {
    version: number;
    type: "heartbeat";
}
/** The orderly close control frame. A side sends it to end the channel cleanly. */
export interface DuplexCloseFrame {
    version: number;
    type: "close";
}
/**
 * The protocol-error control frame. A peer sends it to report a bad frame. This
 * frame is distinct from a decode-time protocol error: the decoder produces a
 * {@link DuplexProtocolError} result, while a peer sends this frame on the wire.
 */
export interface DuplexErrorFrame {
    version: number;
    type: "error";
    code: string;
    message?: string;
}
/** Any frame the codec reads or writes. */
export type DuplexFrame = DuplexReadyFrame | DuplexHeartbeatFrame | DuplexCloseFrame | DuplexErrorFrame;
/** The reason the decoder rejected one line. */
export type DuplexProtocolErrorCode = "malformed_frame" | "unknown_type" | "version_mismatch" | "frame_too_large" | "id_too_large";
/** A decode-time protocol error. The read path returns it; it never throws. */
export interface DuplexProtocolError {
    code: DuplexProtocolErrorCode;
    message: string;
}
/** One decode result: a valid frame, or a protocol error. */
export type DuplexDecodeResult = {
    ok: true;
    frame: DuplexFrame;
} | {
    ok: false;
    error: DuplexProtocolError;
};
/**
 * One size-checked encode result: one line, or a `frame_too_large` error. The
 * shape mirrors {@link DuplexDecodeResult}, so the encode side reports the
 * over-limit case as a typed outcome, not an exception.
 */
export type DuplexEncodeResult = {
    ok: true;
    line: string;
} | {
    ok: false;
    error: {
        code: "frame_too_large";
        message: string;
    };
};
/**
 * Encode one frame to a single line of JSON with a trailing newline. `JSON.stringify`
 * escapes any newline inside a string value, so the returned line holds no
 * interior newline. This keeps one frame on one line.
 */
export declare function encodeDuplexFrame(frame: DuplexFrame): string;
/**
 * Encode one frame to a single line and enforce the maximum frame size. The
 * function measures the encoded JSON in bytes, without the trailing newline, so
 * it matches the decoder bound exactly: a line the decoder accepts encodes, and a
 * line the decoder rejects returns a `frame_too_large` result. The function never
 * throws; it reports the over-limit case as a typed outcome.
 *
 * The size bound follows request and response bodies the host does not control,
 * so an over-limit frame is an expected condition, not a programming error. Every
 * write path that can carry a large body uses this function, so no path emits a
 * frame the peer decoder rejects. The bound applies to every frame type; the
 * guard is a no-op for a small control frame.
 */
export declare function encodeDuplexFrameChecked(frame: DuplexFrame, maxFrameBytes?: number): DuplexEncodeResult;
/**
 * Decode one line (no trailing newline) to a frame or a protocol error. The
 * streaming decoder calls this for each complete line. It is exported so a
 * caller with its own line splitter can reuse the same validation.
 *
 * The check order matters. A parseable frame with the wrong version becomes a
 * `version_mismatch`, so the version check runs before the type check.
 */
export declare function decodeDuplexLine(line: string | Buffer): DuplexDecodeResult;
//# sourceMappingURL=duplex-frame-codec.d.ts.map