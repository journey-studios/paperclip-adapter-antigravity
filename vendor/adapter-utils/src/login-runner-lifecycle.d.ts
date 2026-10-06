/**
 * The terminal outcome of a login runner. A runner reports exactly one value.
 * The value is a fixed, non-secret status.
 */
export type LoginRunnerOutcome = "success" | "failure" | "timeout" | "cancelled";
/**
 * The base result of a login runner. Every runner returns at least these three
 * fields. A runner can extend the base with its own non-secret status fields. The
 * result never carries a URL, a code, or a token byte.
 */
export interface LoginRunnerResult {
    outcome: LoginRunnerOutcome;
    exitCode: number | null;
    promptSurfaced: boolean;
}
/**
 * A non-leaking progress sink. It receives only fixed status lines. A runner
 * never passes a URL, a code, or a token byte to this sink.
 */
export type LoginRunnerLog = (line: string) => void;
/**
 * The shared lifecycle options. Both runners set the host-side timeout, accept an
 * optional cancellation signal, and accept an optional log sink. Each runner
 * option type extends this base with its own callbacks.
 */
export interface LoginRunnerLifecycleOptions {
    /** The host-side timeout in milliseconds. */
    timeoutMs: number;
    /** An optional cancellation signal. */
    signal?: AbortSignal;
    /** A non-leaking progress sink. It receives only fixed status lines. */
    log?: LoginRunnerLog;
}
/**
 * The dispose contract. A login driver releases its resources through `dispose`.
 * The runner always disposes the driver one time for every terminal state. The
 * method must be safe to call one time on every path.
 */
export interface LoginRunnerDisposable {
    /** Releases the driver resources. */
    dispose(): Promise<void>;
}
/**
 * The result of the timeout race. The `exit` kind carries the command exit code.
 * The `timeout` kind and the `cancelled` kind each mark a terminal state with no
 * exit code.
 */
export type LoginRunnerRaceResult = {
    kind: "exit";
    exitCode: number | null;
} | {
    kind: "timeout";
} | {
    kind: "cancelled";
};
/**
 * Races the streaming `work` against the timeout and the cancellation signal. The
 * work result resolves the race with an `exit` status; the timeout resolves it
 * with a `timeout` status; the signal resolves it with a `cancelled` status. A
 * pre-aborted signal resolves the race with a `cancelled` status at once, before
 * the helper starts the timer or listens to the work. A work error rejects the
 * race, so the caller can convert it to a fixed, non-secret error. A late work
 * rejection after the race already settled is consumed here, so it never becomes
 * an unhandled rejection. The helper clears the timer and removes the signal
 * listener on the first settle.
 */
export declare function raceLoginRunnerExit(work: Promise<{
    exitCode: number | null;
}>, timeoutMs: number, signal: AbortSignal | undefined): Promise<LoginRunnerRaceResult>;
//# sourceMappingURL=login-runner-lifecycle.d.ts.map