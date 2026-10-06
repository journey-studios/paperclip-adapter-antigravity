export declare const SYNC_OPERATION_CONCURRENCY_LIMIT = 4;
export type SyncOperationTask<T> = () => Promise<T>;
/**
 * Run an ordered list of sync operation tasks and settle every started task.
 *
 * When `concurrent` is false, the scheduler runs the tasks one at a time in
 * input order. When `concurrent` is true, the scheduler keeps at most `bound`
 * tasks active. The scheduler always waits for every started task to settle
 * before it returns. It returns the settled results in input order.
 *
 * @param tasks Ordered task list. The scheduler calls each thunk to start it.
 * @param concurrent Turn concurrency on or off.
 * @param bound Maximum active tasks when `concurrent` is true.
 * @returns Settled results in input order, one per task.
 */
export declare function scheduleSyncOperations<T>(tasks: ReadonlyArray<SyncOperationTask<T>>, concurrent: boolean, bound?: number): Promise<Array<PromiseSettledResult<T>>>;
//# sourceMappingURL=sync-operation-schedule.d.ts.map